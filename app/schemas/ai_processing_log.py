
from pydantic import BaseModel
import uuid
from datetime import datetime

class AIProcessingLogBase(BaseModel):
    lead_id: uuid.UUID
    model_used: str
    prompt_used: str | None = None
    response_received: str | None = None
    processing_time: float | None = None
    success: bool | None = None
    error_message: str | None = None

class AIProcessingLogCreate(AIProcessingLogBase):
    pass

class AIProcessingLog(AIProcessingLogBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True
