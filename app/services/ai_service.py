from typing import List, Dict, Optional
import json
import asyncio
import time
import structlog
from pydantic import BaseModel

from app.models.database import Lead, AIProcessingLog
from app.core.database import async_session_factory

logger = structlog.get_logger()

class LeadQualification(BaseModel):
    score: int
    category: str
    confidence: float
    reasoning: str
    buying_signals: List[str]
    risk_factors: List[str]
    next_actions: List[str]

class LeadCreate(BaseModel):
    name: str
    email: str
    company: str
    description: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None

class LeadQualificationAI:
    def __init__(self):
        self.model_name = "mistral:7b"
        self.response_cache = {}
        self.model_warm = False
        self.prompt_template = """
You are LeadGenie, an expert sales lead qualification assistant.

ROLE: Analyze incoming sales leads and provide qualification scores.

TASK: Review the lead information and provide a structured analysis.

OUTPUT FORMAT (JSON only):
{
  "score": <number 0-100>,
  "category": "<Hot|Warm|Cold>",
  "confidence": <number 0.0-1.0>,
  "reasoning": "<brief explanation>",
  "buying_signals": ["<signal1>", "<signal2>"],
  "risk_factors": ["<risk1>", "<risk2>"],
  "next_actions": ["<action1>", "<action2>"]
}

EXAMPLES:
1. High-value enterprise lead:
{
  "score": 90,
  "category": "Hot",
  "confidence": 0.95,
  "reasoning": "Enterprise company with approved budget and immediate timeline",
  "buying_signals": ["Budget approved", "Decision maker", "Immediate timeline"],
  "risk_factors": ["Competition present"],
  "next_actions": ["Schedule demo", "Send pricing"]
}

2. Small business with unclear needs:
{
  "score": 45,
  "category": "Cold",
  "confidence": 0.8,
  "reasoning": "Small business with unclear requirements and no budget mentioned",
  "buying_signals": ["Basic interest"],
  "risk_factors": ["No budget", "Unclear requirements"],
  "next_actions": ["Qualify budget", "Schedule discovery call"]
}

LEAD TO ANALYZE:
Name: {name}
Company: {company}
Email: {email}
Description: {description}
Budget: {budget}
Timeline: {timeline}

Analyze this lead and respond with ONLY the JSON format above:
"""

    async def qualify_lead(self, lead_data: LeadCreate) -> LeadQualification:
        """Qualify a single lead using AI analysis."""
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = f"{lead_data.email}_{lead_data.company}"
            if cache_key in self.response_cache:
                return self.response_cache[cache_key]
            
            # Format prompt
            prompt = self.prompt_template.format(
                name=lead_data.name,
                company=lead_data.company,
                email=lead_data.email,
                description=lead_data.description or "Not provided",
                budget=lead_data.budget or "Not provided",
                timeline=lead_data.timeline or "Not provided"
            )
            
            # Get AI response
            response = await self._get_ai_response(prompt)
            
            # Parse and validate response
            qualification = self._parse_response(response)
            
            # Cache the result
            self.response_cache[cache_key] = qualification
            
            # Log processing
            await self._log_processing(
                lead_data.email,
                time.time() - start_time,
                True,
                self.model_name
            )
            
            return qualification
            
        except Exception as e:
            logger.error("lead_qualification_failed", error=str(e))
            # Fallback to rule-based qualification
            return await self._rule_based_qualify(lead_data)

    async def batch_qualify_leads(self, leads: List[LeadCreate]) -> List[LeadQualification]:
        """Process multiple leads efficiently."""
        tasks = [self.qualify_lead(lead) for lead in leads]
        return await asyncio.gather(*tasks)

    async def get_model_health(self) -> Dict:
        """Check model health and status."""
        try:
            # Test with a simple prompt
            test_prompt = "Respond with 'OK' if you can process requests."
            response = await self._get_ai_response(test_prompt)
            return {
                "status": "healthy",
                "model": self.model_name,
                "response_time": response.get("processing_time", 0)
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }

    async def warm_up_model(self) -> bool:
        """Pre-load model and test with sample data."""
        try:
            sample_lead = LeadCreate(
                name="Test User",
                email="test@example.com",
                company="Test Company",
                description="Looking for software solution"
            )
            await self.qualify_lead(sample_lead)
            self.model_warm = True
            return True
        except Exception as e:
            logger.error("model_warmup_failed", error=str(e))
            return False

    async def _get_ai_response(self, prompt: str) -> Dict:
        """Get response from AI model."""
        try:
            import ollama
            
            response = await ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.1,
                    "top_p": 0.9,
                    "max_tokens": 1000
                }
            )
            
            return {
                "response": response['response'],
                "processing_time": response.get('total_duration', 0)
            }
            
        except Exception as e:
            logger.error("ai_response_failed", error=str(e))
            raise

    def _parse_response(self, response: Dict) -> LeadQualification:
        """Parse and validate AI response."""
        try:
            # Extract JSON from response
            response_text = response['response']
            json_str = response_text[response_text.find('{'):response_text.rfind('}')+1]
            data = json.loads(json_str)
            
            # Validate required fields
            required_fields = ['score', 'category', 'confidence', 'reasoning', 
                             'buying_signals', 'risk_factors', 'next_actions']
            
            if not all(field in data for field in required_fields):
                raise ValueError("Missing required fields in AI response")
            
            # Validate score range
            if not (0 <= data['score'] <= 100):
                raise ValueError("Score must be between 0 and 100")
            
            # Validate category
            if data['category'] not in ['Hot', 'Warm', 'Cold']:
                raise ValueError("Invalid category")
            
            return LeadQualification(**data)
            
        except Exception as e:
            logger.error("response_parsing_failed", error=str(e))
            raise

    async def _rule_based_qualify(self, lead_data: LeadCreate) -> LeadQualification:
        """Fallback to rule-based qualification when AI fails."""
        score = 50  # Base score
        signals = []
        risks = []
        
        # Budget analysis
        if lead_data.budget and any(keyword in lead_data.budget.lower() 
                                  for keyword in ['approved', 'allocated', 'budget']):
            score += 20
            signals.append("Budget mentioned")
        
        # Urgency analysis
        if lead_data.timeline and any(keyword in lead_data.timeline.lower() 
                                    for keyword in ['immediate', 'urgent', 'asap']):
            score += 15
            signals.append("Urgency expressed")
        
        # Company analysis
        if '@' in lead_data.email and any(domain in lead_data.email.lower() 
                                        for domain in ['.com', '.org', '.net']):
            score += 15
            signals.append("Professional email domain")
        
        # Description analysis
        if lead_data.description:
            if len(lead_data.description.split()) > 50:
                score += 10
                signals.append("Detailed requirements")
            if any(keyword in lead_data.description.lower() 
                  for keyword in ['need', 'looking for', 'interested in']):
                score += 10
                signals.append("Clear interest expressed")
        
        return LeadQualification(
            score=min(100, score),
            category="Hot" if score >= 80 else "Warm" if score >= 60 else "Cold",
            confidence=0.7,  # Lower confidence for rule-based
            reasoning="Rule-based qualification based on lead characteristics",
            buying_signals=signals,
            risk_factors=risks,
            next_actions=["Schedule call", "Send information"]
        )

    async def _log_processing(self, lead_email: str, processing_time: float, 
                            success: bool, model_used: str) -> None:
        """Log AI processing results."""
        async with async_session_factory() as session:
            log = AIProcessingLog(
                lead_id=None,  # Will be updated when lead is created
                model_used=model_used,
                processing_time=processing_time,
                success=success
            )
            session.add(log)
            await session.commit() 