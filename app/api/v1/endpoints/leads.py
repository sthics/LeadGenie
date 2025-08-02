
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import structlog

from app.core.database import get_db
from app.services.ai_service import LeadQualificationAI
from app.models.lead import Lead, LeadStatus
from app.schemas.lead import LeadCreate, LeadResponse

logger = structlog.get_logger()
router = APIRouter()

@router.post("/qualify", response_model=LeadResponse)
async def qualify_lead(
    lead: LeadCreate,
    background_tasks: BackgroundTasks,
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
            message=lead.message,
            status=LeadStatus.PROCESSING
        )
        db.add(db_lead)
        await db.commit()
        await db.refresh(db_lead)

        # Queue AI processing as background task
        background_tasks.add_task(
            process_lead_qualification,
            db_lead.id,
            lead.dict(),
            db
        )

        return db_lead

    except Exception as e:
        logger.error("lead_qualification_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

async def process_lead_qualification(
    lead_id: str,
    lead_data: dict,
    db: AsyncSession
):
    """
    Background task for lead qualification.
    """
    try:
        ai_service = LeadQualificationAI()
        # Get AI qualification
        qualification = await ai_service.qualify_lead(lead_data)

        # Update lead record
        lead_record = await db.get(Lead, lead_id)
        if lead_record:
            lead_record.ai_score = qualification.get("score")
            lead_record.category = qualification.get("category")
            lead_record.intent_analysis = {
                "confidence": qualification.get("confidence"),
                "reasoning": qualification.get("reasoning")
            }
            lead_record.buying_signals = qualification.get("buying_signals")
            lead_record.risk_factors = qualification.get("risk_factors")
            lead_record.status = LeadStatus.QUALIFIED

            await db.commit()

            logger.info(
                "lead_qualified",
                lead_id=lead_id,
                score=qualification.get("score"),
                category=qualification.get("category")
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
            lead_record.status = LeadStatus.FAILED
            await db.commit()
