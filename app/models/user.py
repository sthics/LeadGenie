from typing import Optional
from sqlalchemy import Boolean, Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.models.base import Base


class UserRole(str, Enum):
    ADMIN = "admin"
    SALES_MANAGER = "sales_manager"
    SALES_REP = "sales_rep"


class User(Base):
    """
    User model for authentication and authorization.
    """
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.SALES_REP)
    company_id = Column(UUID(as_uuid=True), nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self):
        return f"<User {self.email}>" 