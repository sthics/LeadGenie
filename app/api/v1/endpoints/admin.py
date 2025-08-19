from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from app.core.deps import get_db, get_current_admin_user
from app.schemas.user import UserResponse
from app.schemas.lead import LeadResponse, LeadUpdate
from app.models.user import User
from app.models.lead import Lead

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """List all users (admin only)"""
    result = await db.execute(select(User).offset(skip).limit(limit))
    users = result.scalars().all()
    return users

@router.get("/leads", response_model=List[LeadResponse])
async def list_all_leads(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """List all leads with optional category filter (admin only)"""
    query = select(Lead)
    if category:
        query = query.filter(Lead.category == category)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    leads = result.scalars().all()
    return leads

@router.put("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    lead_update: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a lead's details (admin only)"""
    result = await db.execute(select(Lead).filter(Lead.id == lead_id))
    lead = result.scalars().first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    for field, value in lead_update.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    
    lead.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(lead)
    return lead

@router.delete("/leads/{lead_id}")
async def delete_lead(
    lead_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete a lead (admin only)"""
    result = await db.execute(select(Lead).filter(Lead.id == lead_id))
    lead = result.scalars().first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    await db.delete(lead)
    await db.commit()
    return {"message": "Lead deleted successfully"}

@router.get("/stats")
async def get_system_stats(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get system statistics (admin only)"""
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar()
    
    total_leads_result = await db.execute(select(func.count(Lead.id)))
    total_leads = total_leads_result.scalar()
    
    hot_leads_result = await db.execute(select(func.count(Lead.id)).filter(Lead.category == "hot"))
    hot_leads = hot_leads_result.scalar()
    
    warm_leads_result = await db.execute(select(func.count(Lead.id)).filter(Lead.category == "warm"))
    warm_leads = warm_leads_result.scalar()
    
    cold_leads_result = await db.execute(select(func.count(Lead.id)).filter(Lead.category == "cold"))
    cold_leads = cold_leads_result.scalar()
    
    return {
        "total_users": total_users,
        "total_leads": total_leads,
        "leads_by_category": {
            "hot": hot_leads,
            "warm": warm_leads,
            "cold": cold_leads
        }
    } 