"""Add email verification fields to users table.

Revision ID: af1b2c3d4e5f
Revises: 9f0g1h2i3j4k
Create Date: 2026-02-01

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "af1b2c3d4e5f"
down_revision: Union[str, None] = "9f0g1h2i3j4k"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add email verification columns
    op.add_column(
        "users",
        sa.Column("email_verified", sa.Boolean(), nullable=False, server_default="false")
    )
    op.add_column(
        "users",
        sa.Column("email_verified_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("users", "email_verified_at")
    op.drop_column("users", "email_verified")
