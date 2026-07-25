import logging
from datetime import datetime, timedelta
from app.services.cache_service import CacheManager
from app.core.scheduler import get_scheduler

logger = logging.getLogger(__name__)

class BackgroundTaskService:
    @staticmethod
    async def refresh_aqi_cache():
        """Refreshes the AQI cache. In a real system, hits WAQI."""
        logger.info("[BACKGROUND] Executing AQI Cache Refresh...")
        # Simulate business logic fetch and cache update
        await CacheManager.set(CacheManager.build_key("aqi", "global_refresh"), {"status": "refreshed"}, ttl_seconds=3600)

    @staticmethod
    async def daily_summary_generation():
        """Generates Daily Summaries for users."""
        logger.info("[BACKGROUND] Executing Daily Summary Generation...")
        # Here we would normally query users and use NotificationService to generate.
        await CacheManager.set(CacheManager.build_key("summary", "daily_last_run"), datetime.utcnow().isoformat())

    @staticmethod
    async def notification_cleanup():
        """Cleans up old notifications to save DB space."""
        logger.info("[BACKGROUND] Executing Notification Cleanup...")
        # Placeholder for delete(Notification).where(created_at < 30_days_ago)
        
    @staticmethod
    def register_jobs():
        scheduler = get_scheduler()
        
        # AQI Cache Refresh every 30 minutes
        scheduler.add_job(
            BackgroundTaskService.refresh_aqi_cache,
            'interval',
            minutes=30,
            id='refresh_aqi_cache',
            replace_existing=True
        )
        
        # Daily Summary at 8 AM
        scheduler.add_job(
            BackgroundTaskService.daily_summary_generation,
            'cron',
            hour=8,
            minute=0,
            id='daily_summary_generation',
            replace_existing=True
        )
        
        # Notification cleanup every Sunday at 3 AM
        scheduler.add_job(
            BackgroundTaskService.notification_cleanup,
            'cron',
            day_of_week='sun',
            hour=3,
            minute=0,
            id='notification_cleanup',
            replace_existing=True
        )
        logger.info("Background jobs successfully registered with APScheduler.")
