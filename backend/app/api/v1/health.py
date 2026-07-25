from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.services.health_service import HealthService

router = APIRouter(prefix="/health", tags=["System Health"])

@router.get("/live")
async def liveness_probe():
    """Kubernetes Liveness Probe - Fast, no dependencies."""
    return {"status": "alive"}

@router.get("/ready")
async def readiness_probe():
    """Kubernetes Readiness Probe - Checks deep dependencies."""
    health_data = await HealthService.get_system_health()
    if health_data["status"] != "ready":
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=health_data)
    return health_data

@router.get("/details")
async def detailed_health():
    """Detailed JSON payload of latencies and stats for Monitoring tools."""
    return await HealthService.get_system_health()

@router.get("")
async def basic_health():
    """Standard health endpoint."""
    return {"status": "ok"}
