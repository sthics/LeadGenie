#!/usr/bin/env python3
"""
Deployment script for LeadGenie on Render.
Handles database migrations and initial setup.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from alembic import command
from alembic.config import Config
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import structlog

logger = structlog.get_logger()


async def run_migrations():
    """Run database migrations using Alembic."""
    try:
        logger.info("Starting database migrations...")
        
        # Get database URL from environment
        db_url = os.getenv("SQLALCHEMY_DATABASE_URI")
        if not db_url:
            # Construct from individual components
            server = os.getenv("POSTGRES_SERVER")
            user = os.getenv("POSTGRES_USER")
            password = os.getenv("POSTGRES_PASSWORD")
            db = os.getenv("POSTGRES_DB")
            
            if not all([server, user, password, db]):
                raise ValueError("Database configuration is incomplete")
            
            db_url = f"postgresql+asyncpg://{user}:{password}@{server}/{db}"
        
        # Test database connection
        engine = create_async_engine(db_url)
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        await engine.dispose()
        
        logger.info("Database connection successful")
        
        # Run migrations
        alembic_cfg = Config("alembic.ini")
        alembic_cfg.set_main_option("sqlalchemy.url", db_url.replace("+asyncpg", ""))
        
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations completed successfully")
        
    except Exception as e:
        logger.error("Migration failed", error=str(e))
        raise


async def create_superuser():
    """Create the initial superuser if it doesn't exist."""
    try:
        from app.core.config import settings
        from app.core.database import get_async_session
        from app.models.user import User, UserRole
        from app.services.auth import get_password_hash
        from sqlalchemy import select
        import uuid
        
        logger.info("Checking for superuser...")
        
        async for session in get_async_session():
            # Check if superuser exists
            result = await session.execute(
                select(User).filter(User.email == settings.FIRST_SUPERUSER)
            )
            existing_user = result.scalars().first()
            
            if not existing_user:
                logger.info("Creating superuser...")
                
                superuser = User(
                    id=uuid.uuid4(),
                    email=settings.FIRST_SUPERUSER,
                    hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                    full_name="System Administrator",
                    role=UserRole.ADMIN,
                    is_active=True,
                    is_superuser=True
                )
                
                session.add(superuser)
                await session.commit()
                logger.info("Superuser created successfully")
            else:
                logger.info("Superuser already exists")
            
            break
            
    except Exception as e:
        logger.error("Failed to create superuser", error=str(e))
        # Don't raise here as this is not critical for deployment


async def main():
    """Main deployment function."""
    logger.info("Starting LeadGenie deployment...")
    
    try:
        # Run database migrations
        await run_migrations()
        
        # Create superuser
        await create_superuser()
        
        logger.info("Deployment completed successfully!")
        
    except Exception as e:
        logger.error("Deployment failed", error=str(e))
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())