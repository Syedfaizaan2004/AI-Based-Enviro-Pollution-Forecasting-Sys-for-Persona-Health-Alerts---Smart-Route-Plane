import time
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        # Pull correlation ID if set by CorrelationIdMiddleware
        correlation_id = request.state.correlation_id if hasattr(request.state, "correlation_id") else "unknown"
        
        response = await call_next(request)
        
        process_time = time.perf_counter() - start_time
        
        # Log payload
        log_payload = {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "execution_time_ms": round(process_time * 1000, 2),
            "ip_address": request.client.host if request.client else "127.0.0.1",
            "correlation_id": correlation_id
        }
        
        # Avoid logging noisy health checks
        if "health" not in request.url.path:
            if response.status_code >= 400:
                logger.error("http_request_failed", **log_payload)
            else:
                logger.info("http_request_success", **log_payload)
            
        # Bind the execution time header for client observability
        response.headers["X-Execution-Time"] = str(round(process_time, 4))
        return response
