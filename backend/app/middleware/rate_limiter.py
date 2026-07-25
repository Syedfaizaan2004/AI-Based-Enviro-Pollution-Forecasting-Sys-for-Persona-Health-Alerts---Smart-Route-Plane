import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.core.redis import redis_client
import logging

logger = logging.getLogger(__name__)

class RateLimitExceeded(Exception):
    pass

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """
    Sliding/Fixed window rate limiter backed by Redis.
    Limits requests based on Client IP.
    """
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "127.0.0.1"
        current_minute = int(time.time() // self.window_seconds)
        redis_key = f"rate_limit:{client_ip}:{current_minute}"

        try:
            # Atomic increment
            count = await redis_client.incr(redis_key)
            if count == 1:
                # Set expiry on first request of the window
                await redis_client.expire(redis_key, self.window_seconds + 5)
                
            if count > self.max_requests:
                logger.warning(f"Rate limit exceeded for IP {client_ip} on path {request.url.path}")
                return JSONResponse(
                    status_code=429,
                    content={"error": {"message": "Too many requests. Please try again later."}}
                )
                
        except Exception as e:
            # Fail open if Redis is down
            logger.error(f"Rate Limiter Redis Error: {e}")
            
        response = await call_next(request)
        return response
