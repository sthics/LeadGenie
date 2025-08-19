from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Any, Dict
from uuid import UUID

class LeadBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Lead's full name")
    email: EmailStr
    company: Optional[str] = Field(None, max_length=100, description="Company name")
    message: str = Field(..., min_length=10, max_length=2000, description="Lead's message or inquiry")

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    company: Optional[str] = Field(None, max_length=100)
    message: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[str] = Field(None, max_length=50)
    score: Optional[int] = Field(None, ge=0, le=100, description="Score between 0-100")

class LeadResponse(LeadBase):
    id: UUID
    category: Optional[str] = None
    score: Optional[int] = None
    ai_score: Optional[int] = None
    enhanced_score: Optional[int] = None
    status: str
    intent_analysis: Optional[Any] = None
    buying_signals: Optional[Any] = None
    risk_factors: Optional[Any] = None
    scoring_breakdown: Optional[Any] = None
    next_actions: Optional[Any] = None
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

class ScoringBreakdown(BaseModel):
    base_confidence_score: int
    ai_influence_score: int
    buying_signals_score: int
    risk_factors_score: int
    combination_bonus: int
    total_score: int
    category: str
    breakdown: Dict[str, str]  # Percentage contributions

class LeadScoringAnalysis(BaseModel):
    lead_id: UUID
    ai_score: Optional[int] = None
    enhanced_score: Optional[int] = None
    category: Optional[str] = None
    confidence: Optional[float] = None
    buying_signals: Optional[List[str]] = None
    risk_factors: Optional[List[str]] = None
    next_actions: Optional[List[str]] = None
    scoring_breakdown: Optional[ScoringBreakdown] = None
    reasoning: Optional[str] = None

class LeadStats(BaseModel):
    total_leads: int
    hot_leads: int
    warm_leads: int
    cold_leads: int
    avg_score: float
    avg_enhanced_score: Optional[float] = None
    processing_leads: int
    qualified_leads: int