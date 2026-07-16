from fastapi import APIRouter, Depends

from commerce_ai_api.core.config import Settings, get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(settings: Settings = Depends(get_settings)) -> dict[str, str]:
    return {
        "status": "healthy",
        "service": settings.api_name,
        "environment": settings.environment,
        "version": settings.api_version,
    }

