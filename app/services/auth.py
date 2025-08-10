from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import secrets

from app.core.config import settings
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.schemas.auth import TokenPayload

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_token(token: str) -> TokenPayload:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        token_data = TokenPayload(**payload)
        if datetime.fromtimestamp(token_data.exp) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return token_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_refresh_token() -> str:
    """Generate a secure random refresh token"""
    return secrets.token_urlsafe(32)

async def create_tokens(db: AsyncSession, user_id: str) -> Tuple[str, str]:
    """Create both access and refresh tokens"""
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=user_id, expires_delta=access_token_expires)
    
    # Create refresh token
    refresh_token_value = create_refresh_token()
    
    # Store refresh token in database
    refresh_token = RefreshToken(
        token=refresh_token_value,
        user_id=user_id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    db.add(refresh_token)
    await db.commit()
    
    return access_token, refresh_token_value

async def verify_refresh_token(db: AsyncSession, refresh_token: str) -> Optional[User]:
    """Verify and return user if refresh token is valid"""
    result = await db.execute(
        select(RefreshToken)
        .filter(RefreshToken.token == refresh_token)
        .filter(RefreshToken.is_revoked == False)
    )
    token_record = result.scalars().first()
    
    if not token_record or not token_record.is_valid():
        return None
    
    # Get the user
    result = await db.execute(select(User).filter(User.id == token_record.user_id))
    return result.scalars().first()

async def revoke_refresh_token(db: AsyncSession, refresh_token: str) -> bool:
    """Revoke a refresh token"""
    result = await db.execute(
        select(RefreshToken).filter(RefreshToken.token == refresh_token)
    )
    token_record = result.scalars().first()
    
    if token_record:
        token_record.is_revoked = True
        await db.commit()
        return True
    return False

async def revoke_all_user_tokens(db: AsyncSession, user_id: str) -> None:
    """Revoke all refresh tokens for a user"""
    result = await db.execute(
        select(RefreshToken)
        .filter(RefreshToken.user_id == user_id)
        .filter(RefreshToken.is_revoked == False)
    )
    tokens = result.scalars().all()
    
    for token in tokens:
        token.is_revoked = True
    
    await db.commit()

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user 