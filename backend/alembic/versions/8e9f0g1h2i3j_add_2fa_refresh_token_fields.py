"""Add 2FA and refresh token fields to users table

Revision ID: 8e9f0g1h2i3j
Revises: 7d8e9f0g1h2i
Create Date: 2026-02-01 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8e9f0g1h2i3j'
down_revision: Union[str, None] = '7d8e9f0g1h2i'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add Two-Factor Authentication fields
    op.add_column('users', sa.Column('two_factor_enabled', sa.Boolean, default=False, server_default='false'))
    op.add_column('users', sa.Column('two_factor_secret', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('two_factor_backup_codes', postgresql.ARRAY(sa.String), server_default='{}'))
    op.add_column('users', sa.Column('two_factor_verified_at', sa.DateTime, nullable=True))

    # Add Refresh Token tracking fields
    op.add_column('users', sa.Column('refresh_token_family', sa.String(64), nullable=True))
    op.add_column('users', sa.Column('refresh_token_issued_at', sa.DateTime, nullable=True))

    # Create index for refresh token family lookups
    op.create_index('ix_users_refresh_token_family', 'users', ['refresh_token_family'])


def downgrade() -> None:
    # Drop index
    op.drop_index('ix_users_refresh_token_family')

    # Drop refresh token fields
    op.drop_column('users', 'refresh_token_issued_at')
    op.drop_column('users', 'refresh_token_family')

    # Drop 2FA fields
    op.drop_column('users', 'two_factor_verified_at')
    op.drop_column('users', 'two_factor_backup_codes')
    op.drop_column('users', 'two_factor_secret')
    op.drop_column('users', 'two_factor_enabled')
