import time
import logging
from sqlalchemy import text
from app.core.database import engine
from app.core.redis import check_redis_connection
from app.core.scheduler import get_scheduler

logger = logging.getLogger(__name__)

class HealthService:
    @staticmethod
    async def check_database() -> dict:
        start = time.perf_counter()
        status = "down"
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                status = "up"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
        latency = round((time.perf_counter() - start) * 1000, 2)
        return {"status": status, "latency_ms": latency}

    @staticmethod
    async def check_redis() -> dict:
        start = time.perf_counter()
        status = "up" if await check_redis_connection() else "down"
        latency = round((time.perf_counter() - start) * 1000, 2)
        return {"status": status, "latency_ms": latency}

    @staticmethod
    def check_scheduler() -> dict:
        try:
            scheduler = get_scheduler()
            running = scheduler.running
            jobs_count = len(scheduler.get_jobs())
            return {"status": "up" if running else "down", "active_jobs": jobs_count}
        except Exception as e:
            logger.error(f"Scheduler health check failed: {e}")
            return {"status": "down", "active_jobs": 0}

    @staticmethod
    async def get_system_health() -> dict:
        db_health = await HealthService.check_database()
        redis_health = await HealthService.check_redis()
        scheduler_health = HealthService.check_scheduler()
        
        is_ready = db_health["status"] == "up" and redis_health["status"] == "up"
        
        return {
            "status": "ready" if is_ready else "degraded",
            "components": {
                "database": db_health,
                "redis": redis_health,
                "scheduler": scheduler_health
            }
        }
