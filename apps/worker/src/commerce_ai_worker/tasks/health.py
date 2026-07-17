from commerce_ai_worker.celery_app import celery_app
from commerce_ai_worker.core.config import get_worker_settings


@celery_app.task(name="commerce_ai_worker.health_check")
def health_check() -> dict[str, str]:
    settings = get_worker_settings()
    return {
        "status": "healthy",
        "service": "Commerce AI Worker",
        "environment": settings.environment,
    }
