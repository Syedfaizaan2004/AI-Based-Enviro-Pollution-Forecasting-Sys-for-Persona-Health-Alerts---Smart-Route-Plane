from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.repositories.health_profile import HealthProfileRepository
from app.schemas.health_profile import HealthProfileUpdate
from app.models.health_profile import HealthProfile
import uuid

class HealthProfileService:
    def __init__(self):
        self.hp_repo = HealthProfileRepository()

    async def get_profile(self, db: AsyncSession, user_id: uuid.UUID) -> HealthProfile:
        profile = await self.hp_repo.get_by_user_id(db, user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Health profile not found")
        return profile

    async def update_profile(self, db: AsyncSession, user_id: uuid.UUID, profile_in: HealthProfileUpdate) -> HealthProfile:
        profile = await self.get_profile(db, user_id)
        return await self.hp_repo.update(db, db_obj=profile, obj_in=profile_in.model_dump(exclude_unset=True))
        
    async def delete_profile(self, db: AsyncSession, user_id: uuid.UUID) -> None:
        await self.hp_repo.delete_profile(db, user_id)
