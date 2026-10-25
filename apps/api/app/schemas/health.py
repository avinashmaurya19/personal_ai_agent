"""Pydantic schemas for API health and diagnostics."""

from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Health check response payload."""

    status: str = Field(default="ok", description="Service status indicator")
    version: str = Field(..., description="API version string")
    environment: str = Field(..., description="Deployment environment")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current UTC timestamp",
    )
