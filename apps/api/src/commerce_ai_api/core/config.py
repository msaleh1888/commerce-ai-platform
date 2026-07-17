from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "local"
    api_name: str = "Commerce AI API"
    api_version: str = "0.1.0"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://commerce_ai:commerce_ai@localhost:5432/commerce_ai"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="COMMERCE_AI_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

