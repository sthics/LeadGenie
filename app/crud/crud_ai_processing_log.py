
from sqlalchemy.orm import Session
from app.models.ai_processing_log import AIProcessingLog
from app.schemas.ai_processing_log import AIProcessingLogCreate


def create_ai_processing_log(
    db: Session, *, obj_in: AIProcessingLogCreate
) -> AIProcessingLog:
    db_obj = AIProcessingLog(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
