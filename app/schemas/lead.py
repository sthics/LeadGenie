from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List, Any
from uuid import UUID

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    message: str

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    message: Optional[str] = None
    category: Optional[str] = None
    score: Optional[int] = None

class LeadResponse(LeadBase):
    id: UUID
    category: Optional[str] = None
    score: Optional[int] = None
    ai_score: Optional[int] = None
    status: str
    intent_analysis: Optional[Any] = None
    buying_signals: Optional[Any] = None
    risk_factors: Optional[Any] = None
    source: Optional[str] = None
    processed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LeadList(BaseModel):
    leads: List[LeadResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class LeadStats(BaseModel):
    total_leads: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    avg_score: float
    processing_leads: int
    qualified_leads: int