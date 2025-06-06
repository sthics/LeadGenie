from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, JSON, Text
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.ext.declarative import declared_attr

Base = declarative_base()

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    company = relationship("Company", back_populates="users")
    assigned_leads = relationship("Lead", back_populates="assigned_to")

class Lead(Base, TimestampMixin):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    budget = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    
    # AI Analysis Fields
    ai_score = Column(Float, nullable=True)
    category = Column(String(50), nullable=True)  # hot/warm/cold
    intent_analysis = Column(JSON, nullable=True)
    buying_signals = Column(JSON, nullable=True)
    risk_factors = Column(JSON, nullable=True)
    
    # Tracking Fields
    source = Column(String(100), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="new")
    processed_at = Column(DateTime, nullable=True)

    # Relationships
    assigned_to = relationship("User", back_populates="assigned_leads")
    ai_logs = relationship("AIProcessingLog", back_populates="lead")

class AIProcessingLog(Base, TimestampMixin):
    __tablename__ = "ai_processing_logs"

    id = Column(Integer, primary_key=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    model_used = Column(String(100), nullable=False)
    tokens_used = Column(Integer, nullable=True)
    processing_time = Column(Float, nullable=True)  # in seconds
    cost = Column(Float, nullable=True)
    success = Column(Boolean, default=True)
    error_message = Column(Text, nullable=True)

    # Relationships
    lead = relationship("Lead", back_populates="ai_logs")

class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    settings = Column(JSON, nullable=True, default=dict)

    # Relationships
    users = relationship("User", back_populates="company") 