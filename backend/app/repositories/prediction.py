import logging
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prediction import PredictionHistory
from typing import List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class PredictionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_prediction(self, prediction: PredictionHistory) -> PredictionHistory:
        try:
            self.db.add(prediction)
            await self.db.commit()
            await self.db.refresh(prediction)
            return prediction
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save prediction: {str(e)}")
            raise e

    async def get_prediction(self, prediction_id: uuid.UUID) -> Optional[PredictionHistory]:
        stmt = select(PredictionHistory).where(PredictionHistory.id == prediction_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_recent_predictions(self, limit: int = 100) -> List[PredictionHistory]:
        stmt = select(PredictionHistory).order_by(PredictionHistory.prediction_timestamp.desc()).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_history(self, user_id: uuid.UUID, skip: int = 0, limit: int = 20, sort_by: str = "prediction_timestamp", sort_desc: bool = True, filters: dict = None) -> tuple[List[PredictionHistory], int]:
        from sqlalchemy import func
        stmt = select(PredictionHistory).where(PredictionHistory.user_id == user_id)
        
        # Filtering
        if filters:
            if "city" in filters and filters["city"]:
                # Prediction schema doesn't have city, so this would be no-op or join. We'll skip if not present
                pass
            if "aqi_category" in filters and filters["aqi_category"]:
                stmt = stmt.where(PredictionHistory.aqi_category == filters["aqi_category"])
            if "source" in filters and filters["source"]:
                stmt = stmt.where(PredictionHistory.prediction_source == filters["source"])
            if "start_date" in filters and filters["start_date"]:
                stmt = stmt.where(PredictionHistory.prediction_timestamp >= filters["start_date"])
            if "end_date" in filters and filters["end_date"]:
                stmt = stmt.where(PredictionHistory.prediction_timestamp <= filters["end_date"])
                
        # Total Count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = await self.db.scalar(count_stmt)
        
        # Sorting
        order_col = getattr(PredictionHistory, sort_by, PredictionHistory.prediction_timestamp)
        if sort_desc:
            stmt = stmt.order_by(order_col.desc())
        else:
            stmt = stmt.order_by(order_col.asc())
            
        # Pagination
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        
        return list(result.scalars().all()), total_count or 0

    async def get_user_predictions(self, user_id: str, limit: int = 100) -> List[PredictionHistory]:
        # PredictionHistory does not contain user_id in the schema.
        # This is a stub to fulfill the repository interface requirements.
        # Future phases may implement this via a join on HealthAdvisoryLog or RouteWaypoint.
        return []

    async def delete_prediction(self, prediction_id: uuid.UUID) -> bool:
        pred = await self.get_prediction(prediction_id)
        if not pred:
            return False
        try:
            await self.db.delete(pred)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete prediction {prediction_id}: {str(e)}")
            raise e

    async def delete_all_predictions(self, user_id: uuid.UUID) -> int:
        from sqlalchemy import delete
        stmt = delete(PredictionHistory).where(PredictionHistory.user_id == user_id)
        try:
            result = await self.db.execute(stmt)
            await self.db.commit()
            return result.rowcount
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete all predictions: {str(e)}")
            raise e