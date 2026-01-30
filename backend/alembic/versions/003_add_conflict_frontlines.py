"""Add conflict frontlines table

Revision ID: 003_frontlines
Revises: f002497c4728
Create Date: 2024-01-28
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

revision = '003_frontlines'
down_revision = 'f002497c4728'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'conflict_frontlines',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conflict_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('controlled_by', sa.String(100), nullable=False),
        sa.Column('geometry', Geometry(geometry_type='GEOMETRY', srid=4326), nullable=False),
        sa.Column('geometry_type', sa.String(20), nullable=False),
        sa.Column('source', sa.String(255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('color', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['conflict_id'], ['conflicts.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_conflict_frontlines_conflict_id', 'conflict_frontlines', ['conflict_id'])
    op.create_index('ix_conflict_frontlines_date', 'conflict_frontlines', ['date'])


def downgrade() -> None:
    op.drop_index('ix_conflict_frontlines_date')
    op.drop_index('ix_conflict_frontlines_conflict_id')
    op.drop_table('conflict_frontlines')
