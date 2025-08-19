from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class OTPRequest(BaseModel):
    """Request to send OTP to email"""
    email: EmailStr
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="User's full name")


class OTPVerification(BaseModel):
    """Request to verify OTP"""
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")


class OTPResponse(BaseModel):
    """Response after sending OTP"""
    message: str
    email: EmailStr
    expires_in_minutes: int
    

class UserRegistrationWithOTP(BaseModel):
    """Complete user registration with OTP verification"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="User's full name")
    otp_code: str = Field(..., min_length=6, max_length=6, pattern="^[0-9]{6}$")
    role: Optional[str] = Field("sales_rep", max_length=20, description="User role")