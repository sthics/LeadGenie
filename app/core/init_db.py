import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import async_session_factory
from app.models.database import User, Company, Lead, AIProcessingLog
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def init_db() -> None:
    """Initialize the database with test data."""
    async with async_session_factory() as session:
        # Create test company
        company = Company(
            name="Test Company",
            domain="testcompany.com",
            settings={"theme": "light", "notifications": True}
        )
        session.add(company)
        await session.flush()

        # Create admin user
        admin = User(
            email="admin@testcompany.com",
            hashed_password=pwd_context.hash("admin123"),
            full_name="Admin User",
            role="admin",
            company_id=company.id,
            is_active=True
        )
        session.add(admin)
        await session.flush()

        # Create test leads
        leads = [
            Lead(
                name="John Doe",
                email="john@example.com",
                company="Acme Corp",
                description="Interested in AI solutions",
                budget="$50k-100k",
                timeline="Q3 2024",
                ai_score=85.5,
                category="hot",
                intent_analysis={"interest_level": "high", "urgency": "medium"},
                buying_signals={"budget_approved": True, "decision_maker": True},
                risk_factors={"competition": "low", "timeline_risk": "medium"},
                source="website",
                assigned_to_id=admin.id,
                status="new",
                processed_at=datetime.utcnow()
            ),
            Lead(
                name="Jane Smith",
                email="jane@example.com",
                company="TechStart Inc",
                description="Looking for CRM integration",
                budget="$10k-20k",
                timeline="Q4 2024",
                ai_score=65.0,
                category="warm",
                intent_analysis={"interest_level": "medium", "urgency": "low"},
                buying_signals={"budget_approved": False, "decision_maker": False},
                risk_factors={"competition": "high", "timeline_risk": "low"},
                source="referral",
                status="contacted"
            )
        ]
        session.add_all(leads)
        await session.flush()

        # Create AI processing logs
        logs = [
            AIProcessingLog(
                lead_id=leads[0].id,
                model_used="gpt-4",
                tokens_used=150,
                processing_time=2.5,
                cost=0.03,
                success=True
            ),
            AIProcessingLog(
                lead_id=leads[1].id,
                model_used="gpt-4",
                tokens_used=120,
                processing_time=2.0,
                cost=0.02,
                success=True
            )
        ]
        session.add_all(logs)
        
        await session.commit()

if __name__ == "__main__":
    asyncio.run(init_db()) 