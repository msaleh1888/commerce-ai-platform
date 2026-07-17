from fastapi import FastAPI

from commerce_ai_api.api.routes.health import router as health_router
from commerce_ai_api.api.routes.readiness import router as readiness_router
from commerce_ai_api.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.api_name, version=settings.api_version)
    app.include_router(health_router)
    app.include_router(readiness_router)
    return app


app = create_app()

