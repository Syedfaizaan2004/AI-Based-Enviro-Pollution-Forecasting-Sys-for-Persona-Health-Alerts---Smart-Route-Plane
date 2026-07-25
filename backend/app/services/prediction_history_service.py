import logging
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
            # Do not block the prediction API response if history saving fails
            pass
        return db_model

    async def get_recent(self, limit: int = 100) -> list[PredictionHistory]:
        return await self.repo.get_recent_predictions(limit)
