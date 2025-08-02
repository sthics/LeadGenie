
import httpx
from app.core.config import settings
from app.services.prompt_templates import LEAD_QUALIFICATION_PROMPT
from app.services.response_parser import ResponseValidator
from app.services.fallback_handler import FallbackHandler
import json

class FreeAPIService:
    def __init__(self):
        self.base_url = "https://api.groq.com/openai/v1"
        self.api_key = settings.GROQ_API_KEY

    async def generate_response(self, lead_data: dict) -> str:
        prompt = LEAD_QUALIFICATION_PROMPT.format(
            name=lead_data.get("name"),
            company=lead_data.get("company"),
            email=lead_data.get("email"),
            description=lead_data.get("message"),
            budget=lead_data.get("budget"),
            timeline=lead_data.get("timeline"),
        )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "llama3-8b-8192",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 1000,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

class LeadQualificationAI:
    def __init__(self):
        self.api_service = FreeAPIService()
        self.validator = ResponseValidator()
        self.fallback_handler = FallbackHandler()

    async def qualify_lead(self, lead_data: dict) -> dict:
        try:
            response = await self.api_service.generate_response(lead_data)
            if self.validator.validate_ai_response(response):
                return json.loads(response)
            else:
                return self.fallback_handler.rule_based_qualify(lead_data)
        except Exception as e:
            # In a real application, you would log the error here
            return self.fallback_handler.rule_based_qualify(lead_data)
