from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.base import BaseRepository
from app.models.health_profile import HealthProfile
import uuid

class HealthProfileRepository(BaseRepository[HealthProfile]):
    def __init__(self):
        super().__init__(HealthProfile)

    async def get_by_user_id(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[HealthProfile]:
        result = await db.execute(select(HealthProfile).filter(HealthProfile.user_id == user_id))
        return result.scalars().first()
        
    async def delete_profile(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        profile = await self.get_by_user_id(db, user_id)
        if profile:
            await self.delete(db, id=profile.id)
