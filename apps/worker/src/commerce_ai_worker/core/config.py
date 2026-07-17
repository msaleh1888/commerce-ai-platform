from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class WorkerSettings(BaseSettings):
    environment: str = "local"
    broker_url: str = "redis://localhost:6379/0"
    result_backend: str = "redis://localhost:6379/1"
    task_default_queue: str = "commerce_ai"
    task_always_eager: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="COMMERCE_AI_WORKER_",
        extra="ignore",
    )


@lru_cache
def get_worker_settings() -> WorkerSettings:
    return WorkerSettings()
