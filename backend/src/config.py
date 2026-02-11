"""Application configuration."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    All environment variables are loaded from .env file.
    Required variables: DATABASE_URL, REDIS_URL, SECRET_KEY
    """

    # Database - PostgreSQL with asyncpg driver
    database_url: str = "postgresql+asyncpg://leftist:leftist_dev_password@localhost:5432/leftist_monitor"

    # Redis - For caching and session management
    redis_url: str = "redis://localhost:6379/0"

    # App settings
    environment: str = "development"
    debug: bool = False
    secret_key: str = "dev-secret-key-change-in-production"

    # API configuration
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Leftist Monitor"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance.

    Settings are cached using lru_cache to avoid reloading from file
    on every request. Environment variables must be set before first call.
    """
    return Settings()
