"""merge frontlines and relationships

Revision ID: 1c209624defd
Revises: 003_frontlines, 6eaff32ca441
Create Date: 2026-01-29 00:11:41.768605

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = '1c209624defd'
down_revision: Union[str, None] = ('003_frontlines', '6eaff32ca441')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
