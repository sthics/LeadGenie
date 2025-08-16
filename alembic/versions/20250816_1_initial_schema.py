"""Initial schema

Revision ID: 20250816_1
Revises: 
Create Date: 2025-08-16 07:09:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250816_1'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # This is a placeholder migration since the schema already exists
    # All tables and columns are already in place
    pass


def downgrade() -> None:
    # Downgrade not implemented for initial migration
    pass