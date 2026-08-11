import uuid
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.repositories.feedback import FeedbackRepository
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate
from app.models.feedback import Feedback
from app.models.enums import FeedbackStatus

class FeedbackService:
    def __init__(self, db: AsyncSession):
        self.repo = FeedbackRepository(db)

    async def create_feedback(self, user_id: uuid.UUID, feedback_in: FeedbackCreate) -> Feedback:
        try:
            return await self.repo.create(user_id, feedback_in)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create feedback: {str(e)}")

    async def get_all_feedback(self, skip: int = 0, limit: int = 100) -> Tuple[List[Feedback], int]:
        return await self.repo.get_all(skip, limit)

    async def get_user_feedback(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Tuple[List[Feedback], int]:
        return await self.repo.get_by_user(user_id, skip, limit)

    async def update_feedback_status(self, feedback_id: uuid.UUID, feedback_update: FeedbackUpdate) -> Feedback:
        feedback = await self.repo.update_status(feedback_id, feedback_update)
        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")
        return feedback
