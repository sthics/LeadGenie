"""
OTP (One-Time Password) service for email verification
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
import structlog

from app.models.otp import EmailOTP
from app.services.email import email_service
from app.core.config import settings

logger = structlog.get_logger()


class OTPService:
    """Service for managing OTP verification"""
    
    @staticmethod
    async def send_verification_otp(
        db: AsyncSession, 
        email: str, 
        user_name: str = "User",
        purpose: str = "registration"
    ) -> Tuple[bool, str]:
        """
        Send OTP verification email
        Returns: (success, message)
        """
        try:
            # Check if there's a recent valid OTP
            existing_otp = await OTPService._get_valid_otp(db, email, purpose)
            if existing_otp:
                logger.info("Valid OTP already exists", email=email)
                return False, "A verification code was already sent. Please check your email or wait 5 minutes to request a new one."
            
            # Invalidate any existing OTPs for this email/purpose
            await OTPService._invalidate_existing_otps(db, email, purpose)
            
            # Create new OTP
            otp = EmailOTP.create_otp(email, purpose, settings.OTP_EXPIRY_MINUTES)
            db.add(otp)
            await db.commit()
            
            # Send email
            email_sent = await email_service.send_otp_email(email, otp.otp_code, user_name)
            
            if email_sent:
                logger.info("OTP sent successfully", email=email, purpose=purpose)
                return True, f"Verification code sent to {email}. Please check your email."
            else:
                # Remove OTP if email failed
                await db.delete(otp)
                await db.commit()
                logger.error("Failed to send OTP email", email=email)
                return False, "Failed to send verification email. Please try again."
                
        except Exception as e:
            logger.error("Error sending OTP", error=str(e), email=email)
            await db.rollback()
            return False, "An error occurred while sending verification code. Please try again."
    
    @staticmethod
    async def verify_otp(
        db: AsyncSession,
        email: str,
        otp_code: str,
        purpose: str = "registration"
    ) -> Tuple[bool, str]:
        """
        Verify OTP code
        Returns: (success, message)
        """
        try:
            # Find the OTP
            result = await db.execute(
                select(EmailOTP).filter(
                    and_(
                        EmailOTP.email == email,
                        EmailOTP.created_for == purpose,
                        EmailOTP.is_verified == False
                    )
                ).order_by(EmailOTP.created_at.desc())
            )
            otp_record = result.scalars().first()
            
            if not otp_record:
                logger.warning("No OTP found for verification", email=email)
                return False, "No verification code found. Please request a new one."
            
            # Increment attempts
            otp_record.attempts += 1
            
            # Check if expired
            if otp_record.is_expired():
                logger.warning("OTP expired", email=email)
                return False, "Verification code has expired. Please request a new one."
            
            # Check max attempts
            if otp_record.attempts > settings.OTP_MAX_ATTEMPTS:
                logger.warning("Max OTP attempts exceeded", email=email)
                return False, "Too many failed attempts. Please request a new verification code."
            
            # Verify code
            if otp_record.otp_code != otp_code:
                await db.commit()  # Save the attempt increment
                remaining = settings.OTP_MAX_ATTEMPTS - otp_record.attempts
                if remaining > 0:
                    logger.warning("Invalid OTP attempt", email=email, attempts=otp_record.attempts)
                    return False, f"Invalid verification code. {remaining} attempts remaining."
                else:
                    logger.warning("OTP verification failed - max attempts", email=email)
                    return False, "Invalid verification code. Please request a new one."
            
            # Success - mark as verified
            otp_record.is_verified = True
            await db.commit()
            
            logger.info("OTP verified successfully", email=email, purpose=purpose)
            return True, "Email verification successful."
            
        except Exception as e:
            logger.error("Error verifying OTP", error=str(e), email=email)
            await db.rollback()
            return False, "An error occurred during verification. Please try again."
    
    @staticmethod
    async def cleanup_expired_otps(db: AsyncSession) -> int:
        """
        Clean up expired OTPs (run as background task)
        Returns: number of deleted OTPs
        """
        try:
            # Delete OTPs older than 24 hours
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
            
            result = await db.execute(
                select(EmailOTP).filter(EmailOTP.created_at < cutoff_time)
            )
            expired_otps = result.scalars().all()
            
            count = len(expired_otps)
            for otp in expired_otps:
                await db.delete(otp)
            
            await db.commit()
            logger.info("Cleaned up expired OTPs", count=count)
            return count
            
        except Exception as e:
            logger.error("Error cleaning up OTPs", error=str(e))
            await db.rollback()
            return 0
    
    @staticmethod
    async def _get_valid_otp(db: AsyncSession, email: str, purpose: str) -> Optional[EmailOTP]:
        """Get valid OTP for email/purpose if exists"""
        result = await db.execute(
            select(EmailOTP).filter(
                and_(
                    EmailOTP.email == email,
                    EmailOTP.created_for == purpose,
                    EmailOTP.is_verified == False,
                    EmailOTP.expires_at > datetime.now(timezone.utc),
                    EmailOTP.attempts < settings.OTP_MAX_ATTEMPTS
                )
            ).order_by(EmailOTP.created_at.desc())
        )
        return result.scalars().first()
    
    @staticmethod
    async def _invalidate_existing_otps(db: AsyncSession, email: str, purpose: str):
        """Mark existing OTPs as verified (invalidate them)"""
        result = await db.execute(
            select(EmailOTP).filter(
                and_(
                    EmailOTP.email == email,
                    EmailOTP.created_for == purpose,
                    EmailOTP.is_verified == False
                )
            )
        )
        existing_otps = result.scalars().all()
        
        for otp in existing_otps:
            otp.is_verified = True
        
        await db.commit()