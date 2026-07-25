import redis.asyncio as aioredis
from typing import Optional
from app.core.config import settings

redis_client: Optional[aioredis.Redis] = None

async def init_redis():
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL, 
        encoding="utf-8", 
        decode_responses=True,
        max_connections=10
    )

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()

def get_redis() -> aioredis.Redis:
    if not redis_client:
        raise RuntimeError("Redis is not initialized")
    return redis_client
