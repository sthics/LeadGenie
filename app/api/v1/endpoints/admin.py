from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.deps import get_db, get_current_admin_user
from app.schemas.user import UserResponse
from app.schemas.lead import LeadResponse, LeadUpdate
from app.models.user import User
from app.models.lead import Lead

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100
):
    """List all users (admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/leads", response_model=List[LeadResponse])
async def list_all_leads(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """List all leads with optional category filter (admin only)"""
    query = db.query(Lead)
    if category:
        query = query.filter(Lead.category == category)
    leads = query.offset(skip).limit(limit).all()
    return leads

@router.put("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    lead_update: LeadUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update a lead's details (admin only)"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    for field, value in lead_update.dict(exclude_unset=True).items():
        setattr(lead, field, value)
    
    lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lead)
    return lead

@router.delete("/leads/{lead_id}")
async def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Delete a lead (admin only)"""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    db.delete(lead)
    db.commit()
    return {"message": "Lead deleted successfully"}

@router.get("/stats")
async def get_system_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get system statistics (admin only)"""
    total_users = db.query(User).count()
    total_leads = db.query(Lead).count()
    hot_leads = db.query(Lead).filter(Lead.category == "hot").count()
    warm_leads = db.query(Lead).filter(Lead.category == "warm").count()
    cold_leads = db.query(Lead).filter(Lead.category == "cold").count()
    
    return {
        "total_users": total_users,
        "total_leads": total_leads,
        "leads_by_category": {
            "hot": hot_leads,
            "warm": warm_leads,
            "cold": cold_leads
        }
    } 