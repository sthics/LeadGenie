from sqlalchemy import Column, String, Integer, ForeignKey, Numeric, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import BaseModel


class AIProcessingLog(BaseModel):
    """
    Model for tracking AI service usage and performance.
    """
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("lead.id"), nullable=False)
    model_used = Column(String, nullable=False)
    tokens_used = Column(Integer, nullable=False)
    processing_time = Column(Numeric(10, 3), nullable=False)  # in seconds
    cost = Column(Numeric(10, 4), nullable=False)  # in USD
    success = Column(Boolean, nullable=False, default=True)
    error_message = Column(String, nullable=True)

    def __repr__(self):
        return f"<AIProcessingLog {self.id} - Lead: {self.lead_id}>" 