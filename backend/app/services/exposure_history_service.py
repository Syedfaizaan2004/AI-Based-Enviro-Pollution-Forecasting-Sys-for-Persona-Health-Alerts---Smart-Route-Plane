import logging
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.exposure import ExposureHistoryRepository
from app.models.exposure import ExposureHistory

logger = logging.getLogger(__name__)

class ExposureHistoryService:
    def __init__(self, db: AsyncSession):
        self.repo = ExposureHistoryRepository(db)

    async def log_exposure(self, user_id: uuid.UUID, daily_avg_aqi: float, peak_aqi: float, duration_min: float, pm25: float) -> ExposureHistory:
        try:
            exposure = ExposureHistory(
                user_id=user_id,
                daily_avg_aqi=daily_avg_aqi,
                peak_aqi=peak_aqi,
                total_duration_outdoors_min=duration_min,
                cumulative_pm25=pm25
            )
            return await self.repo.save_exposure(exposure)
        except Exception as e:
            logger.error(f"Failed to log exposure: {str(e)}")
            raise e

    async def get_paginated_history(self, user_id: uuid.UUID, page: int, size: int, filters: dict = None) -> tuple[List[ExposureHistory], int]:
        skip = (page - 1) * size
        return await self.repo.get_history(user_id=user_id, skip=skip, limit=size, filters=filters)

    async def get_by_id(self, exposure_id: uuid.UUID) -> ExposureHistory:
        return await self.repo.get_exposure(exposure_id)

    async def delete_history(self, exposure_id: uuid.UUID) -> bool:
        return await self.repo.delete_exposure(exposure_id)
