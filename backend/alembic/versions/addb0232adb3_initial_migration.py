"""Initial migration

Revision ID: addb0232adb3
Revises:
Create Date: 2026-01-28 00:11:54.825865

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2


revision: str = "addb0232adb3"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table("countries",
    sa.Column("id", sa.UUID(), nullable=False),
    sa.Column("gwcode", sa.Integer(), nullable=True),
    sa.Column("cowcode", sa.Integer(), nullable=True),
    sa.Column("iso_alpha2", sa.String(length=2), nullable=True),
    sa.Column("iso_alpha3", sa.String(length=3), nullable=True),
    sa.Column("wikidata_id", sa.String(length=20), nullable=True),
    sa.Column("name_en", sa.String(length=255), nullable=False),
    sa.Column("name_native", sa.String(length=255), nullable=True),
    sa.Column("name_short", sa.String(length=100), nullable=True),
    sa.Column("valid_from", sa.Date(), nullable=False),
    sa.Column("valid_to", sa.Date(), nullable=True),
    sa.Column("entity_type", sa.String(length=50), nullable=False),
    sa.Column("description", sa.Text(), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    sa.PrimaryKeyConstraint("id")
    )
    op.create_index(op.f("ix_countries_cowcode"), "countries", ["cowcode"], unique=False)
    op.create_index(op.f("ix_countries_gwcode"), "countries", ["gwcode"], unique=False)
    op.create_table("country_borders",
    sa.Column("id", sa.UUID(), nullable=False),
    sa.Column("country_id", sa.UUID(), nullable=False),
    sa.Column("geometry", geoalchemy2.types.Geometry(geometry_type="MULTIPOLYGON", srid=4326, dimension=2, from_text="ST_GeomFromEWKT", name="geometry", nullable=False), nullable=False),
    sa.Column("valid_from", sa.Date(), nullable=False),
    sa.Column("valid_to", sa.Date(), nullable=True),
    sa.Column("source", sa.String(length=100), nullable=False),
    sa.Column("source_id", sa.String(length=100), nullable=True),
    sa.Column("area_km2", sa.Float(), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id")
    )
    op.create_table("country_capitals",
    sa.Column("id", sa.UUID(), nullable=False),
    sa.Column("country_id", sa.UUID(), nullable=False),
    sa.Column("name", sa.String(length=255), nullable=False),
    sa.Column("location", geoalchemy2.types.Geometry(geometry_type="POINT", srid=4326, dimension=2, from_text="ST_GeomFromEWKT", name="geometry"), nullable=True),
    sa.Column("valid_from", sa.Date(), nullable=False),
    sa.Column("valid_to", sa.Date(), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
    sa.PrimaryKeyConstraint("id")
    )


def downgrade() -> None:
    op.drop_table("country_capitals")
    op.drop_table("country_borders")
    op.drop_index(op.f("ix_countries_gwcode"), table_name="countries")
    op.drop_index(op.f("ix_countries_cowcode"), table_name="countries")
    op.drop_table("countries")
