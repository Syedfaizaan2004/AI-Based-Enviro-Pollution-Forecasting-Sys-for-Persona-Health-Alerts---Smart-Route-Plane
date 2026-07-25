from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user import UserRepository
from app.models.user import User
import uuid

class UserService:
    def __init__(self):
        self.user_repo = UserRepository()

    async def get_user_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> User:
        return await self.user_repo.get_by_id(db, user_id)
        
    async def soft_delete_user(self, db: AsyncSession, user: User) -> User:
        return await self.user_repo.update(db, db_obj=user, obj_in={"is_deleted": True, "is_active": False})
