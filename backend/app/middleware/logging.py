import time
import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.database import AsyncSessionLocal
from app.models.api_log import ApiLog

logger = structlog.get_logger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()
        
        # Pull correlation ID if set by CorrelationIdMiddleware
        correlation_id = request.state.correlation_id if hasattr(request.state, "correlation_id") else "unknown"
        
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            process_time = time.perf_counter() - start_time
            execution_time_ms = round(process_time * 1000, 2)
            
            # Avoid logging noisy health checks
            if "health" not in request.url.path:
                try:
                    async with AsyncSessionLocal() as session:
                        db_log = ApiLog(
                            endpoint=request.url.path,
                            method=request.method,
                            status_code=status_code,
                            response_time_ms=execution_time_ms,
                            client_ip=request.client.host if request.client else "127.0.0.1",
                            status="error" if status_code >= 400 else "success",
                            error_message=None # We don't have the exact error string here without intercepting the body
                        )
                        session.add(db_log)
                        await session.commit()
                except Exception as db_err:
                    logger.error(f"Failed to write API Log to database: {db_err}")

        # Bind the execution time header for client observability
        try:
            response.headers["X-Execution-Time"] = str(round(process_time, 4))
            return response
        except UnboundLocalError:
            # If an exception was raised, response might not exist
            pass
