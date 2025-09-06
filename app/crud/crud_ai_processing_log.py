
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ai_processing_log import AIProcessingLog
from app.schemas.ai_processing_log import AIProcessingLogCreate


async def create_ai_processing_log(
    db: AsyncSession, *, obj_in: AIProcessingLogCreate
) -> AIProcessingLog:
    db_obj = AIProcessingLog(**obj_in.dict())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
