"""
Email service for sending OTP and other notifications.
Uses Brevo (formerly Sendinblue) for reliable email delivery.
"""

import structlog
import httpx
from jinja2 import Template

from app.core.config import settings

logger = structlog.get_logger()


class EmailService:
    """Email service using Brevo API"""
    
    def __init__(self):
        if not settings.BREVO_API_KEY:
            logger.warning("Brevo API key not configured")
            raise ValueError("Brevo API key is required for email service")
    
    async def send_otp_email(self, email: str, otp_code: str, user_name: str = "User") -> bool:
        """Send OTP verification email"""
        subject = "LeadGenie - Email Verification Code"
        
        # Create HTML email template
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Email Verification - LeadGenie</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .otp-code { font-size: 32px; font-weight: bold; color: #6366f1; text-align: center; 
                           letter-spacing: 5px; margin: 20px 0; padding: 15px; background: white; 
                           border-radius: 8px; border: 2px dashed #6366f1; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .warning { background: #fef3cd; border: 1px solid #fbbf24; color: #92400e; 
                          padding: 10px; border-radius: 4px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🚀 LeadGenie</h1>
                    <p>Email Verification Required</p>
                </div>
                <div class="content">
                    <p>Hi {{ user_name }},</p>
                    <p>Welcome to LeadGenie! Please verify your email address to complete your registration.</p>
                    
                    <p>Your verification code is:</p>
                    <div class="otp-code">{{ otp_code }}</div>
                    
                    <div class="warning">
                        <strong>⏰ This code expires in 5 minutes</strong><br>
                        For security, please don't share this code with anyone.
                    </div>
                    
                    <p>If you didn't request this verification, please ignore this email.</p>
                    
                    <p>Best regards,<br>The LeadGenie Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message from LeadGenie.<br>
                    © 2025 LeadGenie. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = html_template.render(user_name=user_name, otp_code=otp_code)
        
        # Plain text version
        text_content = f"""
        Hi {user_name},

        Welcome to LeadGenie! Please verify your email address to complete your registration.

        Your verification code is: {otp_code}

        ⏰ This code expires in 5 minutes.
        For security, please don't share this code with anyone.

        If you didn't request this verification, please ignore this email.

        Best regards,
        The LeadGenie Team
        """
        
        return await self._send_via_brevo(email, subject, text_content, html_content)
    
    async def _send_via_brevo(self, to_email: str, subject: str, text_content: str, html_content: str) -> bool:
        """Send email via Brevo (Sendinblue) API"""
        url = "https://api.brevo.com/v3/smtp/email"
        
        headers = {
            "Api-Key": settings.BREVO_API_KEY,
            "Content-Type": "application/json"
        }
        
        data = {
            "sender": {
                "name": settings.EMAIL_FROM_NAME,
                "email": settings.EMAIL_FROM_ADDRESS
            },
            "to": [{"email": to_email}],
            "subject": subject,
            "textContent": text_content,
            "htmlContent": html_content
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data, headers=headers)
                
                if response.status_code == 201:
                    logger.info("Email sent successfully via Brevo", email=to_email)
                    return True
                else:
                    logger.error("Brevo email failed", status=response.status_code, response=response.text)
                    return False
        except Exception as e:
            logger.error("Failed to send email via Brevo", error=str(e))
            return False


# Global email service instance
email_service = EmailService()