from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
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
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True