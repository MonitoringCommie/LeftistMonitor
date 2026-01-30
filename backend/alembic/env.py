"""Alembic migration environment."""
import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from src.config import get_settings
from src.database import Base

# Import all models to ensure they're registered
from src.geography.models import Country, CountryBorder, CountryCapital
from src.politics.models import (
    Ideology, PoliticalParty, Election, ElectionResult, PartyMembership
)
from src.people.models import (
    Person, PersonConnection, PersonPosition, Book, BookAuthor
)
from src.events.models import Event, Conflict, ConflictParticipant
from src.policies.models import Policy, PolicyTopic, PolicyVote

config = context.config
settings = get_settings()

# Set the database URL from settings (convert async to sync for alembic)
sync_url = settings.database_url.replace("+asyncpg", "")
config.set_main_option("sqlalchemy.url", sync_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine

    url = config.get_main_option("sqlalchemy.url")
    connectable = create_engine(url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
