from typing import Optional
from sqlalchemy import Column, String, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone, timedelta

from app.models.base import BaseModel


class EmailOTP(BaseModel):
    __tablename__ = "email_otps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_for = Column(String(50), nullable=False)  # 'registration', 'password_reset', etc.

    def __repr__(self):
        return f"<EmailOTP {self.email}>"
    
    def is_expired(self) -> bool:
        """Check if the OTP is expired"""
        return datetime.now(timezone.utc) > self.expires_at
    
    def is_valid(self) -> bool:
        """Check if the OTP is valid (not expired, not verified, attempts < 3)"""
        return not self.is_expired() and not self.is_verified and self.attempts < 3
    
    @classmethod
    def create_otp(cls, email: str, purpose: str = "registration", expires_minutes: int = 5) -> "EmailOTP":
        """Create a new OTP for email verification"""
        import random
        
        otp_code = str(random.randint(100000, 999999))
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
        
        return cls(
            email=email,
            otp_code=otp_code,
            expires_at=expires_at,
            created_for=purpose
        )