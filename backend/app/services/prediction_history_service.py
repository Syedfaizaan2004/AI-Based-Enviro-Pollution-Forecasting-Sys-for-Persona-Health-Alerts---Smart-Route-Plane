import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.prediction import PredictionRepository
from app.models.prediction import PredictionHistory

logger = logging.getLogger(__name__)

class PredictionHistoryService:
    def __init__(self, db: AsyncSession):
        self.repo = PredictionRepository(db)

    async def record_prediction(self, db_model: PredictionHistory) -> PredictionHistory:
        try:
            return await self.repo.save_prediction(db_model)
        except Exception as e:
            logger.error(f"Failed to record prediction in history: {str(e)}")
            # Do not block the prediction API response if history saving fails, but return None
            return None
        return db_model

    async def get_recent_for_user(self, user_id: uuid.UUID, limit: int = 100) -> list[PredictionHistory]:
        recent = await self.repo.get_recent_predictions(limit)
        return [p for p in recent if str(p.user_id) == str(user_id)]

    async def get_history(self, user_id, skip, size, sort_by, sort_desc, filters):
        return await self.repo.get_history(user_id, skip, size, sort_by, sort_desc, filters)

    async def get_prediction_by_id(self, prediction_id):
        return await self.repo.get_prediction(prediction_id)

    async def delete_prediction_by_id(self, prediction_id):
        return await self.repo.delete_prediction(prediction_id)

    async def delete_all_user_predictions(self, user_id):
        return await self.repo.delete_all_predictions(user_id)
