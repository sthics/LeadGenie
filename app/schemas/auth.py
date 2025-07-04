from pydantic import BaseModel, EmailStr, constr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenPayload(BaseModel):
    sub: str  # user id
    exp: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True 