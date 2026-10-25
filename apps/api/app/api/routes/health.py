"""Health and diagnostics route handlers."""

from fastapi import APIRouter
from app.config import settings
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse, summary="Service health status")
async def get_health() -> HealthResponse:
    """Return current API status, version, and environment."""
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
    )
