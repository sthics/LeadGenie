from sqlalchemy import Column, String, Integer, ForeignKey, Boolean, Text, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.models.base import BaseModel


class AIProcessingLog(BaseModel):
    """
    Model for tracking AI service usage and performance.
    """
    __tablename__ = "ai_processing_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # Change to UUID
    lead_id = Column(UUID(as_uuid=True), ForeignKey("leads.id"), nullable=False)
    model_used = Column(String(100), nullable=False)
    prompt_used = Column(Text, nullable=True)
    response_received = Column(Text, nullable=True)
    processing_time = Column(Float, nullable=True)  # double precision in DB
    success = Column(Boolean, nullable=True)
    error_message = Column(Text, nullable=True)

    def __repr__(self):
        return f"<AIProcessingLog {self.id} - Lead: {self.lead_id}>" 