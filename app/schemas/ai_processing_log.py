
from pydantic import BaseModel
import uuid
from datetime import datetime

class AIProcessingLogBase(BaseModel):
    lead_id: uuid.UUID
    model_used: str
    tokens_used: int
    processing_time: float
    cost: float
    success: bool
    error_message: str | None = None

class AIProcessingLogCreate(AIProcessingLogBase):
    pass

class AIProcessingLog(AIProcessingLogBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True
