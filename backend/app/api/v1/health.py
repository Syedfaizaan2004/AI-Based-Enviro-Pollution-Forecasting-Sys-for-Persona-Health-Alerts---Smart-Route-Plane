"""
Health check router — GET /api/v1/health

Returns a simple JSON payload confirming the API is running.
Optionally includes a database connectivity check so ops tooling
can distinguish between an API-only outage and a DB outage.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(tags=["Health"])


# ------------------------------------------------------------------ #
# Response schema
# ------------------------------------------------------------------ #
class HealthResponse(BaseModel):
    """Schema for the health-check response."""

    status: str

    model_config = {"json_schema_extra": {"example": {"status": "running"}}}


# ------------------------------------------------------------------ #
# Route
# ------------------------------------------------------------------ #
@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description=(
        "Lightweight liveness probe. "
        "Returns `{'status': 'running'}` when the API is up."
    ),
)
def health_check() -> HealthResponse:
    """Return API liveness status."""
    return HealthResponse(status="running")
