from typing import Optional, List
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Numeric, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
import uuid
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class LeadCategory(str, PyEnum):
    HOT = "hot"
    WARM = "warm"
    COLD = "cold"


class LeadStatus(str, PyEnum):
    NEW = "NEW"
    CONTACTED = "CONTACTED" 
    QUALIFIED = "QUALIFIED"
    PROCESSING = "PROCESSING"
    FAILED = "FAILED"
    LOST = "LOST"
    WON = "WON"


class TimelineEnum(str, PyEnum):
    IMMEDIATE = "immediate"
    WITHIN_30_DAYS = "within_30_days"
    WITHIN_90_DAYS = "within_90_days"
    BEYOND_90_DAYS = "beyond_90_days"


class Lead(BaseModel):
    __tablename__ = "leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)  # hot/warm/cold
    score = Column(Integer, nullable=False)  # 0-100
    reason = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # AI Analysis Results
    ai_score = Column(Integer, nullable=True)
    enhanced_score = Column(Integer, nullable=True)  # Enhanced scoring system result
    intent_analysis = Column(JSON, nullable=True)
    buying_signals = Column(JSON, nullable=True)  # List[str]
    risk_factors = Column(JSON, nullable=True)    # List[str]
    scoring_breakdown = Column(JSON, nullable=True)  # Detailed scoring breakdown
    next_actions = Column(JSON, nullable=True)  # List[str] - AI suggested next actions
    
    # Metadata
    source = Column(String, nullable=False, default="form")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(PgEnum(LeadStatus, name='lead_status_enum', create_type=False), nullable=False, default=LeadStatus.NEW)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_leads")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_leads")
    notifications = relationship("Notification", back_populates="lead")

    def __repr__(self):
        return f"<Lead {self.name} - {self.company}>" 