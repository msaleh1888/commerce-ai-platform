from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: str = "local"
    api_name: str = "Commerce AI API"
    api_version: str = "0.1.0"
    log_level: str = "INFO"
    database_url: str = "postgresql+psycopg://commerce_ai:commerce_ai@localhost:5432/commerce_ai"
    redis_url: str = "redis://localhost:6379/0"
    qdrant_url: str = "http://localhost:6333"
    import_artifact_endpoint_url: str = "http://localhost:9000"
    import_artifact_bucket: str = "commerce-ai-import-artifacts"
    import_artifact_region: str = "us-east-1"
    import_artifact_access_key: str = "commerce_ai"
    import_artifact_secret_key: str = "commerce_ai_minio_password"
    import_artifact_use_tls: bool = False
    web_origin: str = "http://localhost:3000"
    session_cookie_name: str = "commerce_ai_session"

    @property
    def session_cookie_secure(self) -> bool:
        local_http_origins = ("http://localhost", "http://127.0.0.1")
        is_local_http = self.environment in {"local", "development", "test"} and self.web_origin.startswith(
            local_http_origins
        )
        return not is_local_http

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="COMMERCE_AI_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()

