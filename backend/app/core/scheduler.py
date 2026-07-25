from apscheduler.schedulers.asyncio import AsyncIOScheduler
from typing import Optional
import logging

logger = logging.getLogger(__name__)

scheduler: Optional[AsyncIOScheduler] = None

def init_scheduler():
    global scheduler
    scheduler = AsyncIOScheduler()
    logger.info("Scheduler initialized")

def start_scheduler():
    if scheduler and not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")

def stop_scheduler():
    if scheduler and scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shutdown gracefully")

def get_scheduler() -> AsyncIOScheduler:
    if not scheduler:
        raise RuntimeError("Scheduler is not initialized")
    return scheduler
