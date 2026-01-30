"""Application configuration."""
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql+asyncpg://leftist:leftist_dev_password@localhost:5432/leftist_monitor"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # App
    environment: str = "development"
    debug: bool = True
    secret_key: str = "change-this-in-production"
    
    # API
    api_v1_prefix: str = "/api/v1"
    project_name: str = "Leftist Monitor"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
