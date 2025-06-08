from typing import List
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.ai_service import LeadQualificationAI, LeadCreate, LeadQualification
from app.models.database import Lead, AIProcessingLog
import structlog

logger = structlog.get_logger()
router = APIRouter()

# Dependency to get AI service instance
async def get_ai_service():
    service = LeadQualificationAI()
    if not service.model_warm:
        await service.warm_up_model()
    return service

@router.post("/qualify", response_model=LeadQualification)
async def qualify_lead(
    lead: LeadCreate,
    background_tasks: BackgroundTasks,
    ai_service: LeadQualificationAI = Depends(get_ai_service),
    db: AsyncSession = Depends(get_db)
):
    """
    Qualify a single lead using AI analysis.
    """
    try:
        # Create lead record
        db_lead = Lead(
            name=lead.name,
            email=lead.email,
            company=lead.company,
            description=lead.description,
            budget=lead.budget,
            timeline=lead.timeline,
            status="processing"
        )
        db.add(db_lead)
        await db.flush()
        
        # Queue AI processing as background task
        background_tasks.add_task(
            process_lead_qualification,
            db_lead.id,
            lead,
            ai_service,
            db
        )
        
        return LeadQualification(
            score=0,
            category="Processing",
            confidence=0.0,
            reasoning="Lead is being processed",
            buying_signals=[],
            risk_factors=[],
            next_actions=["Wait for processing"]
        )
        
    except Exception as e:
        logger.error("lead_qualification_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-qualify", response_model=List[LeadQualification])
async def batch_qualify_leads(
    leads: List[LeadCreate],
    ai_service: LeadQualificationAI = Depends(get_ai_service)
):
    """
    Qualify multiple leads in batch.
    """
    try:
        return await ai_service.batch_qualify_leads(leads)
    except Exception as e:
        logger.error("batch_qualification_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def check_ai_health(
    ai_service: LeadQualificationAI = Depends(get_ai_service)
):
    """
    Check AI service health.
    """
    return await ai_service.get_model_health()

async def process_lead_qualification(
    lead_id: int,
    lead: LeadCreate,
    ai_service: LeadQualificationAI,
    db: AsyncSession
):
    """
    Background task for lead qualification.
    """
    try:
        # Get AI qualification
        qualification = await ai_service.qualify_lead(lead)
        
        # Update lead record
        lead_record = await db.get(Lead, lead_id)
        if lead_record:
            lead_record.ai_score = qualification.score
            lead_record.category = qualification.category
            lead_record.intent_analysis = {
                "confidence": qualification.confidence,
                "reasoning": qualification.reasoning
            }
            lead_record.buying_signals = qualification.buying_signals
            lead_record.risk_factors = qualification.risk_factors
            lead_record.status = "qualified"
            
            await db.commit()
            
            logger.info(
                "lead_qualified",
                lead_id=lead_id,
                score=qualification.score,
                category=qualification.category
            )
            
    except Exception as e:
        logger.error(
            "lead_qualification_background_failed",
            lead_id=lead_id,
            error=str(e)
        )
        
        # Update lead status to failed
        lead_record = await db.get(Lead, lead_id)
        if lead_record:
            lead_record.status = "failed"
            await db.commit() 