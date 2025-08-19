from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from uuid import UUID

class UserRole(str, Enum):
    ADMIN = "admin"
    SALES_MANAGER = "sales_manager"
    SALES_REP = "sales_rep"

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenPayload(BaseModel):
    sub: str  # user id
    exp: int  # timestamp

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="User password")

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="User's full name")
    role: Optional[UserRole] = UserRole.SALES_REP

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True 