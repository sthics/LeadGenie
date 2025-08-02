from typing import Optional
from enum import Enum as PyEnum
from sqlalchemy import Boolean, Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
import uuid
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class UserRole(str, PyEnum):
    ADMIN = "admin"
    SALES_MANAGER = "sales_manager"
    SALES_REP = "sales_rep"


class User(BaseModel):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(PgEnum(UserRole, name='user_role_enum', create_type=False), nullable=False, default=UserRole.SALES_REP)
    company_id = Column(UUID(as_uuid=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    created_leads = relationship("Lead", foreign_keys="[Lead.created_by]", back_populates="creator")
    assigned_leads = relationship("Lead", foreign_keys="[Lead.assigned_to]", back_populates="assignee")
    notifications = relationship("Notification", back_populates="user")

    def __repr__(self):
        return f"<User {self.email}>" 