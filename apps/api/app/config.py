"""Application configuration and environment settings using Pydantic Settings."""

from functools import lru_cache
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for FastAPI Personal AI Assistant backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application settings
    APP_NAME: str = "Personal AI Assistant API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "testing", "production"] = "development"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "dev-insecure-secret-key-change-in-production-32chars"

    # Database settings
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "personal_ai"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/personal_ai",
        description="Async SQLAlchemy database connection string",
    )

    # Redis settings
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_URL: str = "redis://localhost:6379/0"

    # LLM Provider Gateway defaults
    DEFAULT_MODEL_PROVIDER: str = "ollama"
    DEFAULT_MODEL_NAME: str = "llama3.2"
    DISABLE_CLOUD_MODELS: bool = False

    # Ollama Local Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Free Cloud Providers
    GEMINI_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""
    OPENAI_API_KEY: str = "disabled"

    # CORS Settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    """Return cached instance of application settings."""
    return Settings()


settings = get_settings()
