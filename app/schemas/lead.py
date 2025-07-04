from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class LeadBase(BaseModel):
    name: str
    email: EmailStr
    company: str
    message: str
    category: str
    score: int

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
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 