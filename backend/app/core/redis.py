import redis.asyncio as redis
from typing import AsyncGenerator
from app.core.config import settings
import structlog

logger = structlog.get_logger(__name__)

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    try:
        yield redis_client
    finally:
        pass  # Redis connection pool handles cleanup

async def check_redis_connection():
    try:
        await redis_client.ping()
        return True
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        return False
