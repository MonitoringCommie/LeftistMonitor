"""add country relationships

Revision ID: 6eaff32ca441
Revises: f002497c4728
Create Date: 2024-01-28

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = '6eaff32ca441'
down_revision: Union[str, None] = 'f002497c4728'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'country_relationships',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('country_a_id', UUID(as_uuid=True), sa.ForeignKey('countries.id', ondelete='CASCADE'), nullable=False),
        sa.Column('country_b_id', UUID(as_uuid=True), sa.ForeignKey('countries.id', ondelete='CASCADE'), nullable=False),
        sa.Column('relationship_type', sa.String(50), nullable=False),
        sa.Column('relationship_nature', sa.String(50), nullable=False),
        sa.Column('name', sa.String(255)),
        sa.Column('description', sa.Text),
        sa.Column('valid_from', sa.Date, nullable=False),
        sa.Column('valid_to', sa.Date),
        sa.Column('wikidata_id', sa.String(20)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('ix_country_relationships_country_a', 'country_relationships', ['country_a_id'])
    op.create_index('ix_country_relationships_country_b', 'country_relationships', ['country_b_id'])
    op.create_index('ix_country_relationships_valid_from', 'country_relationships', ['valid_from'])


def downgrade() -> None:
    op.drop_index('ix_country_relationships_valid_from')
    op.drop_index('ix_country_relationships_country_b')
    op.drop_index('ix_country_relationships_country_a')
    op.drop_table('country_relationships')
