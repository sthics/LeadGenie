
import httpx
import json
import time
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.crud import crud_ai_processing_log
from app.schemas.ai_processing_log import AIProcessingLogCreate
from .prompt_templates import LEAD_QUALIFICATION_PROMPT
from .response_parser import ResponseValidator
from .fallback_handler import FallbackHandler
from .scoring import ScoringService
from .cost_tracker import CostTracker

class FreeAPIService:
    def __init__(self):
        self.base_url = "https://api.groq.com/openai/v1"
        self.api_key = settings.GROQ_API_KEY

    async def generate_response(self, lead_data: dict) -> dict:
        prompt = LEAD_QUALIFICATION_PROMPT.format(
            name=lead_data.get("name"),
            company=lead_data.get("company"),
            email=lead_data.get("email"),
            description=lead_data.get("message"),
            budget=lead_data.get("budget"),
            timeline=lead_data.get("timeline"),
        )

        async with httpx.AsyncClient() as client:
            start_time = time.time()
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama-3.1-8b-instant",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 2000,
                },
            )
            response.raise_for_status()
            end_time = time.time()
            
            response_json = response.json()
            response_json["processing_time"] = end_time - start_time
            return response_json

class LeadQualificationAI:
    def __init__(self, db: AsyncSession):
        self.api_service = FreeAPIService()
        self.validator = ResponseValidator()
        self.fallback_handler = FallbackHandler()
        self.scoring_service = ScoringService()
        self.cost_tracker = CostTracker()
        self.db = db

    async def qualify_lead(self, lead_data: dict) -> dict:
        try:
            ai_response = await self.api_service.generate_response(lead_data)
            response_content = ai_response["choices"][0]["message"]["content"]
            
            log_entry = self._prepare_log_entry(lead_data, ai_response, response_content)

            if self.validator.validate_ai_response(response_content):
                response_data = self.validator.parse_ai_response(response_content)
                
                # Calculate enhanced scoring
                enhanced_score = self.scoring_service.calculate_score(response_data)
                enhanced_category = self.scoring_service.assign_category(enhanced_score)
                scoring_breakdown = self.scoring_service.get_scoring_breakdown(response_data)
                
                # Preserve original AI scores and add enhanced results
                response_data['ai_original_score'] = response_data.get('score')  # Store original AI score
                response_data['score'] = enhanced_score  # Update to enhanced score
                response_data['enhanced_score'] = enhanced_score
                response_data['category'] = enhanced_category
                response_data['scoring_breakdown'] = scoring_breakdown
                
                await crud_ai_processing_log.create_ai_processing_log(db=self.db, obj_in=log_entry)
                return response_data
            else:
                log_entry.success = False
                log_entry.error_message = "Invalid AI response format"
                await crud_ai_processing_log.create_ai_processing_log(db=self.db, obj_in=log_entry)
                return self.fallback_handler.rule_based_qualify(lead_data)
        except Exception as e:
            log_entry.success = False
            log_entry.error_message = str(e)
            crud_ai_processing_log.create_ai_processing_log(db=self.db, obj_in=log_entry)
            return self.fallback_handler.rule_based_qualify(lead_data)

    def _prepare_log_entry(self, lead_data: dict, ai_response: dict, response_content: str) -> AIProcessingLogCreate:
        # Prepare the prompt that was sent to the AI  
        from .prompt_templates import LEAD_QUALIFICATION_PROMPT
        prompt = LEAD_QUALIFICATION_PROMPT.format(
            name=lead_data.get("name"),
            company=lead_data.get("company"),
            email=lead_data.get("email"),
            description=lead_data.get("message"),
            budget=lead_data.get("budget"),
            timeline=lead_data.get("timeline"),
        )

        return AIProcessingLogCreate(
            lead_id=lead_data.get("id"),
            model_used=ai_response.get("model"),
            prompt_used=prompt,
            response_received=response_content,
            processing_time=ai_response.get("processing_time"),
            success=True,
        )
