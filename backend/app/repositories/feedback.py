import uuid
from typing import List, Optional, Tuple
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate
from app.models.enums import FeedbackStatus

class FeedbackRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: uuid.UUID, feedback_in: FeedbackCreate) -> Feedback:
        feedback = Feedback(
            user_id=user_id,
            category=feedback_in.category,
            subject=feedback_in.subject,
            message=feedback_in.message,
            rating=feedback_in.rating,
        )
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        return feedback

    async def get_by_id(self, feedback_id: uuid.UUID) -> Optional[Feedback]:
        stmt = select(Feedback).where(Feedback.id == feedback_id).options(selectinload(Feedback.user))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> Tuple[List[Feedback], int]:
        stmt = select(Feedback).options(selectinload(Feedback.user)).order_by(Feedback.created_at.desc())
        count_stmt = select(func.count()).select_from(Feedback)

        total_count = await self.db.scalar(count_stmt)
        
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        feedbacks = result.scalars().all()

        return list(feedbacks), total_count or 0

    async def get_by_user(self, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Tuple[List[Feedback], int]:
        stmt = select(Feedback).where(Feedback.user_id == user_id).order_by(Feedback.created_at.desc())
        count_stmt = select(func.count()).select_from(Feedback).where(Feedback.user_id == user_id)

        total_count = await self.db.scalar(count_stmt)

        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        feedbacks = result.scalars().all()

        return list(feedbacks), total_count or 0

    async def update_status(self, feedback_id: uuid.UUID, update_data) -> Optional[Feedback]:
        feedback = await self.get_by_id(feedback_id)
        if not feedback:
            return None
        
        feedback.status = update_data.status
        if update_data.admin_response is not None:
            feedback.admin_response = update_data.admin_response
            
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        return feedback
