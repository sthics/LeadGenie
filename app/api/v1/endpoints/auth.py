from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import uuid

from app.core.config import settings
from app.core.deps import get_db, get_current_user
from app.services import auth as auth_service
from app.schemas.auth import Token, UserCreate, UserResponse, RefreshTokenRequest
from app.models.user import User, UserRole

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(
    response: Response,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await auth_service.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create both access and refresh tokens
    access_token, refresh_token = await auth_service.create_tokens(db, str(user.id))
    
    # Set secure httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax"
    )
    response.set_cookie(
        key="refresh_token", 
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/register", response_model=UserResponse)
async def register(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Register new user.
    """
    result = await db.execute(select(User).filter(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Create user with raw SQL to avoid enum serialization issues
    user_id = uuid.uuid4()
    role_value = user_in.role.value if hasattr(user_in.role, 'value') else user_in.role
    
    await db.execute(text("""
        INSERT INTO users (id, email, hashed_password, full_name, role, is_active, is_superuser, created_at, updated_at)
        VALUES (:id, :email, :hashed_password, :full_name, :role, :is_active, :is_superuser, NOW(), NOW())
    """), {
        "id": user_id,
        "email": user_in.email,
        "hashed_password": auth_service.get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "role": role_value,
        "is_active": True,
        "is_superuser": False,
    })
    await db.commit()
    
    # Fetch the created user
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    return user

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token from cookie
    """
    # Get refresh token from cookie
    refresh_token_value = request.cookies.get("refresh_token")
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    user = await auth_service.verify_refresh_token(db, refresh_token_value)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Revoke the old refresh token and create new ones
    await auth_service.revoke_refresh_token(db, refresh_token_value)
    access_token, new_refresh_token = await auth_service.create_tokens(db, str(user.id))
    
    # Set new secure httpOnly cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax"
    )
    response.set_cookie(
        key="refresh_token", 
        value=new_refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite="lax"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Logout user by revoking refresh token and clearing cookies
    """
    # Get refresh token from cookie
    refresh_token_value = request.cookies.get("refresh_token")
    if refresh_token_value:
        await auth_service.revoke_refresh_token(db, refresh_token_value)
    
    # Clear cookies
    response.delete_cookie(key="access_token", httponly=True, secure=settings.SECURE_COOKIES, samesite="lax")
    response.delete_cookie(key="refresh_token", httponly=True, secure=settings.SECURE_COOKIES, samesite="lax")
    
    return {"message": "Successfully logged out"}

@router.post("/logout-all")
async def logout_all(
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Logout user from all devices by revoking all refresh tokens
    """
    await auth_service.revoke_all_user_tokens(db, str(current_user.id))
    
    # Clear cookies on this device
    response.delete_cookie(key="access_token", httponly=True, secure=settings.SECURE_COOKIES, samesite="lax")
    response.delete_cookie(key="refresh_token", httponly=True, secure=settings.SECURE_COOKIES, samesite="lax")
    
    return {"message": "Successfully logged out from all devices"}

@router.get("/users/me", response_model=UserResponse)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user 