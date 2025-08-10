from pydantic import BaseModel, EmailStr, constr
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
    password: constr(min_length=8)

class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    full_name: Optional[str] = None
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