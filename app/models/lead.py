from typing import Optional, List
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, JSON, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base


class LeadCategory(str, Enum):
    HOT = "hot"
    WARM = "warm"
    COLD = "cold"


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    LOST = "lost"
    WON = "won"


class TimelineEnum(str, Enum):
    IMMEDIATE = "immediate"
    WITHIN_30_DAYS = "within_30_days"
    WITHIN_90_DAYS = "within_90_days"
    BEYOND_90_DAYS = "beyond_90_days"


class Lead(Base):
    """
    Lead model for storing and managing lead information.
    """
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False)
    description = Column(String, nullable=True)
    budget = Column(Numeric(10, 2), nullable=True)
    timeline = Column(Enum(TimelineEnum), nullable=True)
    
    # AI Analysis Results
    ai_score = Column(Integer, nullable=True)
    category = Column(Enum(LeadCategory), nullable=True)
    intent_analysis = Column(JSON, nullable=True)
    buying_signals = Column(JSON, nullable=True)  # List[str]
    risk_factors = Column(JSON, nullable=True)    # List[str]
    
    # Metadata
    source = Column(String, nullable=False, default="form")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    status = Column(Enum(LeadStatus), nullable=False, default=LeadStatus.NEW)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<Lead {self.name} - {self.company}>" 