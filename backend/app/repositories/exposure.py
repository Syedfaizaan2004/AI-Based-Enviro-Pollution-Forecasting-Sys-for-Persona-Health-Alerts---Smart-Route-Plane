import logging
import uuid
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exposure import ExposureHistory

logger = logging.getLogger(__name__)

class ExposureHistoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_exposure(self, exposure: ExposureHistory) -> ExposureHistory:
        try:
            self.db.add(exposure)
            await self.db.commit()
            await self.db.refresh(exposure)
            return exposure
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save exposure: {str(e)}")
            raise e

    async def get_history(self, user_id: uuid.UUID, skip: int = 0, limit: int = 20, sort_by: str = "created_at", sort_desc: bool = True, filters: dict = None) -> tuple[List[ExposureHistory], int]:
        stmt = select(ExposureHistory).where(ExposureHistory.user_id == user_id)
        
        if filters:
            if "start_date" in filters and filters["start_date"]:
                stmt = stmt.where(ExposureHistory.created_at >= filters["start_date"])
            if "end_date" in filters and filters["end_date"]:
                stmt = stmt.where(ExposureHistory.created_at <= filters["end_date"])
                
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = await self.db.scalar(count_stmt)
        
        order_col = getattr(ExposureHistory, sort_by, ExposureHistory.created_at)
        if sort_desc:
            stmt = stmt.order_by(order_col.desc())
        else:
            stmt = stmt.order_by(order_col.asc())
            
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total_count or 0

    async def get_exposure(self, exposure_id: uuid.UUID) -> Optional[ExposureHistory]:
        stmt = select(ExposureHistory).where(ExposureHistory.id == exposure_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def delete_exposure(self, exposure_id: uuid.UUID) -> bool:
        exposure = await self.get_exposure(exposure_id)
        if not exposure:
            return False
        try:
            self.db.delete(exposure)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete exposure: {str(e)}")
            raise e