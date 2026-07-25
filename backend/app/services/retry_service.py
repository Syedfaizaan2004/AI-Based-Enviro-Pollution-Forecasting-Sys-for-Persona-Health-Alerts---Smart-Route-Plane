import asyncio
import logging
from typing import Callable, Any

logger = logging.getLogger(__name__)

class RetryService:
    @staticmethod
    async def execute_with_retry(
        task_name: str,
        func: Callable,
        *args,
        max_retries: int = 3,
        base_delay_sec: float = 1.0,
        **kwargs
    ) -> Any:
        attempt = 0
        while attempt < max_retries:
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                attempt += 1
                logger.warning(f"Task '{task_name}' failed on attempt {attempt}/{max_retries}. Error: {e}")
                
                if attempt >= max_retries:
                    logger.error(f"Task '{task_name}' completely failed after {max_retries} retries. Sending to Dead Letter Queue.")
                    await RetryService._send_to_dlq(task_name, str(e))
                    raise
                
                # Exponential backoff
                delay = base_delay_sec * (2 ** (attempt - 1))
                await asyncio.sleep(delay)

    @staticmethod
    async def _send_to_dlq(task_name: str, error_msg: str):
        # In a real system, this would push to a Redis/RabbitMQ DLQ list.
        # For this Phase, we simulate the queue abstraction via logging/cache block.
        from app.services.cache_service import CacheManager
        dlq_key = CacheManager.build_key("dlq", task_name)
        await CacheManager.set(dlq_key, {"error": error_msg, "status": "failed"}, ttl_seconds=86400 * 7)
        logger.error(f"DLQ Entry Created for {task_name}")
