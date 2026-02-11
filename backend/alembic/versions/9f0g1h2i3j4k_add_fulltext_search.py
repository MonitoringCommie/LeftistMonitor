"""Add full-text search indexes and tsvector columns

Revision ID: 9f0g1h2i3j4k
Revises: 8e9f0g1h2i3j
Create Date: 2026-02-01 19:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9f0g1h2i3j4k'
down_revision: Union[str, None] = '8e9f0g1h2i3j'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pg_trgm extension for fuzzy matching
    op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')

    # Add tsvector columns for full-text search
    # People table
    op.add_column('people', sa.Column('search_vector', sa.Text, nullable=True))
    op.execute("""
        UPDATE people SET search_vector = 
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(bio_short, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(biography, '')), 'C')
    """)
    op.execute("""
        CREATE INDEX idx_people_search_vector ON people USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio_short, '')))
    """)
    op.execute("""
        CREATE INDEX idx_people_name_trgm ON people USING GIN (name gin_trgm_ops)
    """)

    # Events table
    op.add_column('events', sa.Column('search_vector', sa.Text, nullable=True))
    op.execute("""
        UPDATE events SET search_vector = 
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B')
    """)
    op.execute("""
        CREATE INDEX idx_events_search_vector ON events USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')))
    """)
    op.execute("""
        CREATE INDEX idx_events_title_trgm ON events USING GIN (title gin_trgm_ops)
    """)

    # Books table
    op.add_column('books', sa.Column('search_vector', sa.Text, nullable=True))
    op.execute("""
        UPDATE books SET search_vector = 
            setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B')
    """)
    op.execute("""
        CREATE INDEX idx_books_search_vector ON books USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')))
    """)
    op.execute("""
        CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops)
    """)

    # Conflicts table
    op.add_column('conflicts', sa.Column('search_vector', sa.Text, nullable=True))
    op.execute("""
        UPDATE conflicts SET search_vector = 
            setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B')
    """)
    op.execute("""
        CREATE INDEX idx_conflicts_search_vector ON conflicts USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')))
    """)
    op.execute("""
        CREATE INDEX idx_conflicts_name_trgm ON conflicts USING GIN (name gin_trgm_ops)
    """)

    # Countries table - just trigram for name matching
    op.execute("""
        CREATE INDEX idx_countries_name_trgm ON countries USING GIN (name_en gin_trgm_ops)
    """)


def downgrade() -> None:
    # Drop indexes
    op.execute('DROP INDEX IF EXISTS idx_countries_name_trgm')
    op.execute('DROP INDEX IF EXISTS idx_conflicts_name_trgm')
    op.execute('DROP INDEX IF EXISTS idx_conflicts_search_vector')
    op.execute('DROP INDEX IF EXISTS idx_books_title_trgm')
    op.execute('DROP INDEX IF EXISTS idx_books_search_vector')
    op.execute('DROP INDEX IF EXISTS idx_events_title_trgm')
    op.execute('DROP INDEX IF EXISTS idx_events_search_vector')
    op.execute('DROP INDEX IF EXISTS idx_people_name_trgm')
    op.execute('DROP INDEX IF EXISTS idx_people_search_vector')

    # Drop columns
    op.drop_column('conflicts', 'search_vector')
    op.drop_column('books', 'search_vector')
    op.drop_column('events', 'search_vector')
    op.drop_column('people', 'search_vector')
