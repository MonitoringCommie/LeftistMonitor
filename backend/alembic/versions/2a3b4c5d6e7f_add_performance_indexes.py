"""add_performance_indexes

Revision ID: 2a3b4c5d6e7f
Revises: 1c209624defd
Create Date: 2026-01-29
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "2a3b4c5d6e7f"
down_revision: Union[str, None] = "1c209624defd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Countries and borders indexes
    op.create_index("idx_countries_valid_dates", "countries", ["valid_from", "valid_to"])
    op.create_index("idx_country_borders_valid_dates", "country_borders", ["valid_from", "valid_to"])
    op.create_index("idx_country_borders_country", "country_borders", ["country_id"])

    # Event indexes
    op.create_index("idx_events_start_date", "events", ["start_date"])
    op.create_index("idx_events_end_date", "events", ["end_date"])
    op.create_index("idx_events_primary_country", "events", ["primary_country_id"])
    op.create_index("idx_events_category", "events", ["category"])
    op.create_index("idx_event_country_assoc_event", "event_country_association", ["event_id"])
    op.create_index("idx_event_country_assoc_country", "event_country_association", ["country_id"])

    # Election indexes
    op.create_index("idx_elections_country_date", "elections", ["country_id", "date"])
    op.create_index("idx_election_results_election", "election_results", ["election_id"])
    op.create_index("idx_election_results_party", "election_results", ["party_id"])

    # Political party indexes
    op.create_index("idx_parties_country", "political_parties", ["country_id"])

    # People indexes
    op.create_index("idx_people_primary_country", "people", ["primary_country_id"])
    op.create_index("idx_people_birth_date", "people", ["birth_date"])
    op.create_index("idx_people_death_date", "people", ["death_date"])
    op.create_index("idx_person_country_assoc_person", "person_country_association", ["person_id"])
    op.create_index("idx_person_country_assoc_country", "person_country_association", ["country_id"])

    # Conflict indexes
    op.create_index("idx_conflicts_start_date", "conflicts", ["start_date"])
    op.create_index("idx_conflicts_end_date", "conflicts", ["end_date"])
    op.create_index("idx_conflict_participants_conflict", "conflict_participants", ["conflict_id"])
    op.create_index("idx_conflict_participants_country", "conflict_participants", ["country_id"])

    # Country relationships indexes
    op.create_index("idx_relationships_valid_dates", "country_relationships", ["valid_from", "valid_to"])
    op.create_index("idx_relationships_country_a", "country_relationships", ["country_a_id"])
    op.create_index("idx_relationships_country_b", "country_relationships", ["country_b_id"])

    # Book and policy indexes
    op.create_index("idx_books_publication_year", "books", ["publication_year"])
    op.create_index("idx_policies_country", "policies", ["country_id"])
    op.create_index("idx_policies_date_enacted", "policies", ["date_enacted"])

    # Trigram indexes for text search
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE INDEX idx_people_name_trgm ON people USING GIN (name gin_trgm_ops)")
    op.execute("CREATE INDEX idx_events_title_trgm ON events USING GIN (title gin_trgm_ops)")
    op.execute("CREATE INDEX idx_countries_name_trgm ON countries USING GIN (name_en gin_trgm_ops)")
    op.execute("CREATE INDEX idx_parties_name_trgm ON political_parties USING GIN (name gin_trgm_ops)")
    op.execute("CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_books_title_trgm")
    op.execute("DROP INDEX IF EXISTS idx_parties_name_trgm")
    op.execute("DROP INDEX IF EXISTS idx_countries_name_trgm")
    op.execute("DROP INDEX IF EXISTS idx_events_title_trgm")
    op.execute("DROP INDEX IF EXISTS idx_people_name_trgm")
    op.drop_index("idx_policies_date_enacted")
    op.drop_index("idx_policies_country")
    op.drop_index("idx_books_publication_year")
    op.drop_index("idx_relationships_country_b")
    op.drop_index("idx_relationships_country_a")
    op.drop_index("idx_relationships_valid_dates")
    op.drop_index("idx_conflict_participants_country")
    op.drop_index("idx_conflict_participants_conflict")
    op.drop_index("idx_conflicts_end_date")
    op.drop_index("idx_conflicts_start_date")
    op.drop_index("idx_person_country_assoc_country")
    op.drop_index("idx_person_country_assoc_person")
    op.drop_index("idx_people_death_date")
    op.drop_index("idx_people_birth_date")
    op.drop_index("idx_people_primary_country")
    op.drop_index("idx_parties_country")
    op.drop_index("idx_election_results_party")
    op.drop_index("idx_election_results_election")
    op.drop_index("idx_elections_country_date")
    op.drop_index("idx_event_country_assoc_country")
    op.drop_index("idx_event_country_assoc_event")
    op.drop_index("idx_events_category")
    op.drop_index("idx_events_primary_country")
    op.drop_index("idx_events_end_date")
    op.drop_index("idx_events_start_date")
    op.drop_index("idx_country_borders_country")
    op.drop_index("idx_country_borders_valid_dates")
    op.drop_index("idx_countries_valid_dates")
