"""
SQLAdmin interface for LeadGenie
"""

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import structlog

from app.models.user import User
from app.models.lead import Lead
from app.models.otp import EmailOTP
from app.core.database import engine, async_session_factory
from app.services import auth as auth_service

logger = structlog.get_logger()


class AdminAuth(AuthenticationBackend):
    """Authentication backend for SQLAdmin"""
    
    async def login(self, request: Request) -> bool:
        form = await request.form()
        email = form.get("username")  # SQLAdmin uses 'username' field
        password = form.get("password")

        if not email or not password:
            return False

        try:
            # Create async session for authentication
            async with async_session_factory() as session:
                user = await auth_service.authenticate_user(session, email, password)
                if user and user.is_active and user.role == "admin":
                    # Store user info in session
                    request.session.update({
                        "user_id": str(user.id),
                        "email": user.email,
                        "role": user.role
                    })
                    logger.info("Admin user logged in", email=email)
                    return True
        except Exception as e:
            logger.error("Admin authentication failed", error=str(e), email=email)
        
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        user_id = request.session.get("user_id")
        role = request.session.get("role")
        
        return bool(user_id and role == "admin")


# Admin views
class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.email, User.full_name, User.role, User.is_active, User.created_at]
    column_searchable_list = [User.email, User.full_name]
    column_sortable_list = [User.email, User.full_name, User.role, User.created_at]
    column_filters = [User.role, User.is_active]
    
    # Don't show password field in forms only
    form_excluded_columns = [User.hashed_password, User.created_at, User.updated_at]
    
    # Make some fields read-only
    form_widget_args = {
        "id": {"readonly": True},
        "created_at": {"readonly": True},
        "updated_at": {"readonly": True}
    }
    
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"


class LeadAdmin(ModelView, model=Lead):
    column_list = [
        Lead.id, Lead.name, Lead.email, Lead.company, 
        Lead.category, Lead.score, Lead.status, Lead.created_at
    ]
    column_searchable_list = [Lead.name, Lead.email, Lead.company]
    column_sortable_list = [Lead.name, Lead.email, Lead.score, Lead.created_at]
    column_filters = [Lead.category, Lead.status]
    
    form_excluded_columns = [Lead.created_at, Lead.updated_at]
    
    # Custom column formatting
    column_formatters = {
        "score": lambda m, a: f"{getattr(m, a, 0)}%" if getattr(m, a) is not None else "N/A"
    }
    
    name = "Lead"
    name_plural = "Leads"
    icon = "fa-solid fa-users"


class EmailOTPAdmin(ModelView, model=EmailOTP):
    column_list = [
        EmailOTP.id, EmailOTP.email, EmailOTP.created_for, 
        EmailOTP.is_verified, EmailOTP.attempts, EmailOTP.expires_at, EmailOTP.created_at
    ]
    column_searchable_list = [EmailOTP.email]
    column_sortable_list = [EmailOTP.email, EmailOTP.created_at, EmailOTP.expires_at]
    column_filters = [EmailOTP.created_for, EmailOTP.is_verified]
    
    # Don't allow editing OTP codes
    form_excluded_columns = [EmailOTP.otp_code, EmailOTP.created_at, EmailOTP.updated_at]
    
    # Make most fields read-only
    form_widget_args = {
        "id": {"readonly": True},
        "email": {"readonly": True},
        "created_for": {"readonly": True},
        "expires_at": {"readonly": True},
        "attempts": {"readonly": True}
    }
    
    name = "OTP Code"
    name_plural = "OTP Codes"
    icon = "fa-solid fa-key"


def setup_admin(app):
    """Setup SQLAdmin with authentication"""
    
    # Initialize authentication backend  
    authentication_backend = AdminAuth(secret_key="9ce555cdfdc9505f08ce9c664c938aa79e4dae27daf501e52f9d56ff5c2b8b5c")
    
    # Create admin instance
    admin = Admin(
        app=app, 
        engine=engine,
        authentication_backend=authentication_backend,
        title="LeadGenie Admin",
        logo_url="/static/logoupdated.png" if hasattr(app, 'mount') else None,
        templates_dir="app/admin/templates" if hasattr(app, 'mount') else None
    )
    
    # Add model views
    admin.add_view(UserAdmin)
    admin.add_view(LeadAdmin)
    admin.add_view(EmailOTPAdmin)
    
    logger.info("SQLAdmin setup complete")
    return admin