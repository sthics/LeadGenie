
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
import structlog
from uuid import UUID

from app.core.database import get_db
from app.core.deps import get_current_user
from app.services.ai import LeadQualificationAI
from app.models.lead import Lead, LeadStatus
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadResponse, LeadList, LeadStats, LeadUpdate, LeadScoringAnalysis

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
            category="cold",  # Default category
            score=0,  # Default score
            status=LeadStatus.PROCESSING.value
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
        ai_service = LeadQualificationAI(db)
        # Get AI qualification
        lead_data["id"] = lead_id
        qualification = await ai_service.qualify_lead(lead_data)

        # Update lead record with enhanced data
        lead_record = await db.get(Lead, lead_id)
        if lead_record:
            # Store both AI and enhanced scores
            lead_record.ai_score = qualification.get("score")
            lead_record.enhanced_score = qualification.get("enhanced_score", qualification.get("score"))
            lead_record.score = qualification.get("enhanced_score", qualification.get("score"))  # Use enhanced as primary
            lead_record.category = qualification.get("category").lower() if qualification.get("category") else "cold"
            
            # Store detailed analysis
            lead_record.intent_analysis = {
                "confidence": qualification.get("confidence"),
                "reasoning": qualification.get("reasoning")
            }
            lead_record.buying_signals = qualification.get("buying_signals", [])
            lead_record.risk_factors = qualification.get("risk_factors", [])
            lead_record.next_actions = qualification.get("next_actions", [])
            lead_record.scoring_breakdown = qualification.get("scoring_breakdown")
            lead_record.status = LeadStatus.QUALIFIED.value

            await db.commit()

            logger.info(
                "lead_qualified",
                lead_id=lead_id,
                ai_score=qualification.get("score"),
                enhanced_score=qualification.get("enhanced_score"),
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
            lead_record.status = LeadStatus.FAILED.value
            await db.commit()


@router.get("/", response_model=LeadList)
async def get_leads(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of leads with filtering.
    """
    try:
        # Base query
        query = select(Lead)
        count_query = select(func.count(Lead.id))
        
        # Apply filters
        if category:
            query = query.where(Lead.category == category)
            count_query = count_query.where(Lead.category == category)
        
        if status:
            query = query.where(Lead.status == status)
            count_query = count_query.where(Lead.status == status)
            
        if search:
            search_filter = Lead.name.ilike(f"%{search}%") | Lead.company.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar()
        
        # Apply pagination and ordering
        offset = (page - 1) * per_page
        query = query.order_by(desc(Lead.created_at)).offset(offset).limit(per_page)
        
        result = await db.execute(query)
        leads = result.scalars().all()
        
        total_pages = (total + per_page - 1) // per_page
        
        return LeadList(
            leads=leads,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error("get_leads_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=LeadStats)
async def get_lead_stats(db: AsyncSession = Depends(get_db)):
    """
    Get lead statistics for dashboard.
    """
    try:
        # Total leads
        total_result = await db.execute(select(func.count(Lead.id)))
        total_leads = total_result.scalar()
        
        # Category counts
        hot_result = await db.execute(select(func.count(Lead.id)).where(Lead.category == "hot"))
        hot_leads = hot_result.scalar() or 0
        
        warm_result = await db.execute(select(func.count(Lead.id)).where(Lead.category == "warm"))
        warm_leads = warm_result.scalar() or 0
        
        cold_result = await db.execute(select(func.count(Lead.id)).where(Lead.category == "cold"))
        cold_leads = cold_result.scalar() or 0
        
        # Status counts
        processing_result = await db.execute(select(func.count(Lead.id)).where(Lead.status == LeadStatus.PROCESSING.value))
        processing_leads = processing_result.scalar() or 0
        
        qualified_result = await db.execute(select(func.count(Lead.id)).where(Lead.status == LeadStatus.QUALIFIED.value))
        qualified_leads = qualified_result.scalar() or 0
        
        # Average scores
        avg_result = await db.execute(select(func.avg(Lead.ai_score)).where(Lead.ai_score.is_not(None)))
        avg_score = avg_result.scalar() or 0.0
        
        avg_enhanced_result = await db.execute(select(func.avg(Lead.enhanced_score)).where(Lead.enhanced_score.is_not(None)))
        avg_enhanced_score = avg_enhanced_result.scalar() or 0.0
        
        return LeadStats(
            total_leads=total_leads,
            hot_leads=hot_leads,
            warm_leads=warm_leads,
            cold_leads=cold_leads,
            avg_score=float(avg_score),
            avg_enhanced_score=float(avg_enhanced_score),
            processing_leads=processing_leads,
            qualified_leads=qualified_leads
        )
        
    except Exception as e:
        logger.error("get_lead_stats_failed", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific lead by ID.
    """
    try:
        lead = await db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        return lead
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_lead_failed", lead_id=lead_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    lead_update: LeadUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update a specific lead.
    """
    try:
        lead = await db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Update fields
        for field, value in lead_update.dict(exclude_unset=True).items():
            setattr(lead, field, value)
        
        await db.commit()
        await db.refresh(lead)
        
        logger.info("lead_updated", lead_id=lead_id)
        return lead
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("update_lead_failed", lead_id=lead_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{lead_id}/analysis", response_model=LeadScoringAnalysis)
async def get_lead_scoring_analysis(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed scoring analysis for a specific lead.
    """
    try:
        lead = await db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Extract confidence from intent_analysis if available
        confidence = None
        reasoning = None
        if lead.intent_analysis:
            confidence = lead.intent_analysis.get("confidence")
            reasoning = lead.intent_analysis.get("reasoning")
        
        return LeadScoringAnalysis(
            lead_id=lead_id,
            ai_score=lead.ai_score,
            enhanced_score=lead.enhanced_score,
            category=lead.category,
            confidence=confidence,
            buying_signals=lead.buying_signals,
            risk_factors=lead.risk_factors,
            next_actions=lead.next_actions,
            scoring_breakdown=lead.scoring_breakdown,
            reasoning=reasoning
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("get_lead_analysis_failed", lead_id=lead_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{lead_id}")
async def delete_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific lead.
    """
    try:
        lead = await db.get(Lead, lead_id)
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        await db.delete(lead)
        await db.commit()
        
        logger.info("lead_deleted", lead_id=lead_id)
        return {"message": "Lead deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("delete_lead_failed", lead_id=lead_id, error=str(e))
        raise HTTPException(status_code=500, detail=str(e))
