"""add_otp_table

Revision ID: afeda3715092
Revises: 20250816_1
Create Date: 2025-08-18 16:30:00.454600+00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'afeda3715092'
down_revision = '20250816_1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create OTP table
    op.create_table(
        'email_otps',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('otp_code', sa.String(6), nullable=False),
        sa.Column('created_for', sa.String(50), nullable=False, default='registration'),
        sa.Column('is_verified', sa.Boolean, nullable=False, default=False),
        sa.Column('attempts', sa.Integer, nullable=False, default=0),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()'))
    )
    
    # Create indexes for efficient querying
    op.create_index('ix_email_otps_email_purpose', 'email_otps', ['email', 'created_for'])
    op.create_index('ix_email_otps_expires_at', 'email_otps', ['expires_at'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_email_otps_expires_at', 'email_otps')
    op.drop_index('ix_email_otps_email_purpose', 'email_otps')
    
    # Drop table
    op.drop_table('email_otps')