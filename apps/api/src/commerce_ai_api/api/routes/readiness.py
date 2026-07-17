from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse

from commerce_ai_api.core.config import Settings, get_settings
from commerce_ai_api.core.readiness import collect_readiness_checks

router = APIRouter(tags=["readiness"])


@router.get("/ready")
def readiness_check(settings: Settings = Depends(get_settings)) -> JSONResponse:
    checks, is_ready = collect_readiness_checks(settings)
    status_code = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if is_ready else "not_ready",
            "checks": checks,
        },
    )
