"""
Rate limiting configuration for API endpoints
"""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import structlog

logger = structlog.get_logger()

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# Custom rate limit exceeded handler
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded"""
    logger.warning(
        "Rate limit exceeded",
        remote_addr=get_remote_address(request),
        path=request.url.path,
        method=request.method
    )
    
    # Get retry_after from the exception, default to 60 seconds if not available
    retry_after = getattr(exc, 'retry_after', 60)
    
    response = JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded. Please wait {retry_after} seconds before retrying.",
            "retry_after": retry_after
        }
    )
    response.headers["Retry-After"] = str(retry_after)
    return response

# Rate limit configurations
AUTH_RATE_LIMITS = {
    "login": "5/minute",           # 5 login attempts per minute
    "register": "3/minute",        # 3 registration attempts per minute
    "send_otp": "2/minute",        # 2 OTP requests per minute
    "verify_otp": "10/minute",     # 10 OTP verification attempts per minute
    "refresh": "10/minute",        # 10 token refresh per minute
}

GENERAL_RATE_LIMITS = {
    "default": "60/minute",        # 60 requests per minute for general endpoints
    "create": "30/minute",         # 30 create operations per minute
    "update": "30/minute",         # 30 update operations per minute
    "delete": "10/minute",         # 10 delete operations per minute
}