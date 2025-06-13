from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    type = Column(String(50), nullable=False)  # email/sms/etc
    status = Column(String(50), nullable=False)  # pending/sent/failed
    sent_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="notifications")
    lead = relationship("Lead", back_populates="notifications") 