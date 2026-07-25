import os
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class MaintenanceModeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        maintenance_mode = os.environ.get("MAINTENANCE_MODE", "false").lower() == "true"
        
        # Allow health checks to bypass maintenance mode so Kubernetes doesn't kill the pods
        if maintenance_mode and not request.url.path.startswith("/api/v1/health"):
            return JSONResponse(
                status_code=503,
                content={"error": {"message": "Service is currently undergoing maintenance. Please try again later."}}
            )
            
        return await call_next(request)
