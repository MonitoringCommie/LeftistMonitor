"""add_occupation_liberation_tables

Revision ID: 4c5d6e7f8g9h
Revises: 3b4c5d6e7f8g
Create Date: 2026-01-30

Tables for tracking occupations, settler colonialism, and liberation struggles.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from geoalchemy2 import Geometry

revision: str = "4c5d6e7f8g9h"
down_revision: Union[str, None] = "3b4c5d6e7f8g"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Occupations table
    op.create_table(
        "occupations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("occupier_country_id", UUID(as_uuid=True), sa.ForeignKey("countries.id")),
        sa.Column("occupied_territory", sa.String(255), nullable=False),
        sa.Column("occupied_people", sa.String(255)),
        sa.Column("start_date", sa.Date),
        sa.Column("end_date", sa.Date),
        sa.Column("occupation_type", sa.String(50)),
        sa.Column("international_law_status", sa.String(100)),
        sa.Column("un_resolutions", ARRAY(sa.String(50))),
        sa.Column("population_displaced", sa.Integer),
        sa.Column("settlements_built", sa.Integer),
        sa.Column("land_confiscated_km2", sa.Numeric(12, 2)),
        sa.Column("wikidata_id", sa.String(20), index=True),
        sa.Column("description", sa.Text),
        sa.Column("progressive_analysis", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Resistance movements
    op.create_table(
        "resistance_movements",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("name_native", sa.String(255)),
        sa.Column("abbreviation", sa.String(50)),
        sa.Column("country_id", UUID(as_uuid=True), sa.ForeignKey("countries.id")),
        sa.Column("occupation_id", UUID(as_uuid=True), sa.ForeignKey("occupations.id")),
        sa.Column("founded_date", sa.Date),
        sa.Column("dissolved_date", sa.Date),
        sa.Column("ideology_tags", ARRAY(sa.String(50))),
        sa.Column("has_armed_wing", sa.Boolean, default=False),
        sa.Column("has_political_wing", sa.Boolean, default=False),
        sa.Column("designated_terrorist_by", ARRAY(sa.String(100))),
        sa.Column("wikidata_id", sa.String(20), index=True),
        sa.Column("description", sa.Text),
        sa.Column("progressive_analysis", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Nakba villages
    op.create_table(
        "nakba_villages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name_arabic", sa.String(255), nullable=False),
        sa.Column("name_english", sa.String(255)),
        sa.Column("district", sa.String(100)),
        sa.Column("sub_district", sa.String(100)),
        sa.Column("population_1945", sa.Integer),
        sa.Column("land_area_dunams", sa.Integer),
        sa.Column("depopulation_date", sa.Date),
        sa.Column("depopulation_cause", sa.String(100)),
        sa.Column("current_status", sa.String(255)),
        sa.Column("israeli_locality_on_lands", sa.String(255)),
        sa.Column("geometry", Geometry(geometry_type="POINT", srid=4326)),
        sa.Column("refugees_displaced", sa.Integer),
        sa.Column("massacre_occurred", sa.Boolean, default=False),
        sa.Column("massacre_deaths", sa.Integer),
        sa.Column("zochrot_id", sa.String(50), index=True),
        sa.Column("wikidata_id", sa.String(20), index=True),
        sa.Column("sources", ARRAY(sa.String(500))),
        sa.Column("description", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Settlements
    op.create_table(
        "settlements",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name_english", sa.String(255), nullable=False),
        sa.Column("name_hebrew", sa.String(255)),
        sa.Column("settlement_type", sa.String(50)),
        sa.Column("established_year", sa.Integer),
        sa.Column("location_region", sa.String(100)),
        sa.Column("governorate", sa.String(100)),
        sa.Column("population", sa.Integer),
        sa.Column("population_year", sa.Integer),
        sa.Column("built_on_village", sa.String(255)),
        sa.Column("geometry", Geometry(geometry_type="POLYGON", srid=4326)),
        sa.Column("area_dunams", sa.Integer),
        sa.Column("legal_status", sa.String(50), default="illegal"),
        sa.Column("wikidata_id", sa.String(20), index=True),
        sa.Column("sources", ARRAY(sa.String(500))),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Separation wall
    op.create_table(
        "separation_wall",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("segment_name", sa.String(255)),
        sa.Column("construction_start", sa.Date),
        sa.Column("construction_end", sa.Date),
        sa.Column("length_km", sa.Numeric(8, 2)),
        sa.Column("wall_type", sa.String(50)),
        sa.Column("land_isolated_dunams", sa.Integer),
        sa.Column("geometry", Geometry(geometry_type="LINESTRING", srid=4326)),
        sa.Column("icj_ruling_2004", sa.Boolean, default=True),
        sa.Column("source", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Checkpoints
    op.create_table(
        "checkpoints",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255)),
        sa.Column("checkpoint_type", sa.String(50)),
        sa.Column("governorate", sa.String(100)),
        sa.Column("geometry", Geometry(geometry_type="POINT", srid=4326)),
        sa.Column("restrictions", sa.Text),
        sa.Column("ocha_id", sa.String(50), index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Gaza siege data
    op.create_table(
        "gaza_siege_data",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("electricity_hours_per_day", sa.Numeric(4, 1)),
        sa.Column("water_access_percent", sa.Numeric(5, 2)),
        sa.Column("food_insecurity_percent", sa.Numeric(5, 2)),
        sa.Column("unemployment_percent", sa.Numeric(5, 2)),
        sa.Column("casualties_month", sa.Integer),
        sa.Column("source", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Massacres
    op.create_table(
        "massacres",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("date_start", sa.Date, nullable=False),
        sa.Column("date_end", sa.Date),
        sa.Column("location_name", sa.String(255)),
        sa.Column("country_id", UUID(as_uuid=True), sa.ForeignKey("countries.id")),
        sa.Column("geometry", Geometry(geometry_type="POINT", srid=4326)),
        sa.Column("perpetrator", sa.String(255)),
        sa.Column("total_killed", sa.Integer),
        sa.Column("civilians_killed", sa.Integer),
        sa.Column("children_killed", sa.Integer),
        sa.Column("wikidata_id", sa.String(20), index=True),
        sa.Column("sources", ARRAY(sa.String(500))),
        sa.Column("description", sa.Text),
        sa.Column("progressive_analysis", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Troubles events
    op.create_table(
        "troubles_events",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("location_name", sa.String(255)),
        sa.Column("geometry", Geometry(geometry_type="POINT", srid=4326)),
        sa.Column("event_type", sa.String(50)),
        sa.Column("perpetrator", sa.String(100)),
        sa.Column("perpetrator_side", sa.String(50)),
        sa.Column("civilian_deaths", sa.Integer),
        sa.Column("total_deaths", sa.Integer),
        sa.Column("collusion_documented", sa.Boolean, default=False),
        sa.Column("wikidata_id", sa.String(20), index=True),
        sa.Column("sources", ARRAY(sa.String(500))),
        sa.Column("description", sa.Text),
        sa.Column("progressive_analysis", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Territory snapshots
    op.create_table(
        "territory_snapshots",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("occupation_id", UUID(as_uuid=True), sa.ForeignKey("occupations.id", ondelete="CASCADE")),
        sa.Column("year", sa.Integer, nullable=False),
        sa.Column("controller", sa.String(100)),
        sa.Column("territory_type", sa.String(50)),
        sa.Column("geometry", Geometry(geometry_type="MULTIPOLYGON", srid=4326)),
        sa.Column("area_km2", sa.Numeric(12, 2)),
        sa.Column("percent_of_total", sa.Numeric(5, 2)),
        sa.Column("source", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Create indexes
    op.create_index("idx_occupations_occupier", "occupations", ["occupier_country_id"])
    op.create_index("idx_nakba_district", "nakba_villages", ["district"])
    op.create_index("idx_settlements_region", "settlements", ["location_region"])
    op.create_index("idx_massacres_date", "massacres", ["date_start"])
    op.create_index("idx_troubles_date", "troubles_events", ["date"])
    op.create_index("idx_territory_year", "territory_snapshots", ["occupation_id", "year"])

    # Spatial indexes
    op.execute("CREATE INDEX idx_nakba_geom ON nakba_villages USING GIST (geometry)")
    op.execute("CREATE INDEX idx_settlements_geom ON settlements USING GIST (geometry)")
    op.execute("CREATE INDEX idx_wall_geom ON separation_wall USING GIST (geometry)")
    op.execute("CREATE INDEX idx_checkpoints_geom ON checkpoints USING GIST (geometry)")
    op.execute("CREATE INDEX idx_massacres_geom ON massacres USING GIST (geometry)")
    op.execute("CREATE INDEX idx_troubles_geom ON troubles_events USING GIST (geometry)")
    op.execute("CREATE INDEX idx_territory_geom ON territory_snapshots USING GIST (geometry)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_nakba_geom")
    op.execute("DROP INDEX IF EXISTS idx_settlements_geom")
    op.execute("DROP INDEX IF EXISTS idx_wall_geom")
    op.execute("DROP INDEX IF EXISTS idx_checkpoints_geom")
    op.execute("DROP INDEX IF EXISTS idx_massacres_geom")
    op.execute("DROP INDEX IF EXISTS idx_troubles_geom")
    op.execute("DROP INDEX IF EXISTS idx_territory_geom")

    op.drop_table("territory_snapshots")
    op.drop_table("troubles_events")
    op.drop_table("massacres")
    op.drop_table("gaza_siege_data")
    op.drop_table("checkpoints")
    op.drop_table("separation_wall")
    op.drop_table("settlements")
    op.drop_table("nakba_villages")
    op.drop_table("resistance_movements")
    op.drop_table("occupations")
