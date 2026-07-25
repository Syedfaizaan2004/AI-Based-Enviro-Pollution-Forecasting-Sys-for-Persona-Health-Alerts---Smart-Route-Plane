import json
from typing import Any, Optional, Dict
from redis.exceptions import RedisError
from app.core.redis import redis_client
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    CACHE_VERSION = "v1"
    
    @staticmethod
    def build_key(namespace: str, identifier: str) -> str:
        return f"{CacheManager.CACHE_VERSION}:{namespace}:{identifier}"

    @staticmethod
    async def get(key: str) -> Optional[Any]:
        if redis_client is None:
            return None

        try:
            data = await redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except (RedisError, json.JSONDecodeError) as e:
            logger.error(f"Cache GET error for {key}: {e}")
            return None

    @staticmethod
    async def set(key: str, value: Any, ttl_seconds: Optional[int] = 3600) -> bool:
        if redis_client is None:
            return False

        try:
            serialized_value = json.dumps(value, default=str)
            if ttl_seconds is None:
                await redis_client.set(key, serialized_value)
            else:
                await redis_client.setex(key, ttl_seconds, serialized_value)
            return True
        except (RedisError, TypeError, ValueError) as e:
            logger.error(f"Cache SET error for {key}: {e}")
            return False

    @staticmethod
    async def delete(key: str) -> bool:
        if redis_client is None:
            return False

        try:
            await redis_client.delete(key)
            return True
        except RedisError as e:
            logger.error(f"Cache DELETE error for {key}: {e}")
            return False

    @staticmethod
    async def set_batch(mapping: Dict[str, Any], ttl_seconds: int = 3600) -> bool:
        if redis_client is None:
            return False

        try:
            async with redis_client.pipeline(transaction=True) as pipe:
                for k, v in mapping.items():
                    pipe.setex(k, ttl_seconds, json.dumps(v, default=str))
                await pipe.execute()
            return True
        except (RedisError, TypeError, ValueError) as e:
            logger.error(f"Cache BATCH SET error: {e}")
            return False

    @staticmethod
    async def clear_namespace(namespace: str) -> int:
        if redis_client is None:
            return 0

        try:
            pattern = f"{CacheManager.CACHE_VERSION}:{namespace}:*"
            keys = await redis_client.keys(pattern)
            if keys:
                await redis_client.delete(*keys)
                return len(keys)
            return 0
        except RedisError as e:
            logger.error(f"Cache CLEAR NAMESPACE error for {namespace}: {e}")
            return 0
