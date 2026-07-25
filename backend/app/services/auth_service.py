from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from redis.exceptions import RedisError
from app.repositories.user import UserRepository
from app.repositories.health_profile import HealthProfileRepository
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.models.user import User
from app.core.redis import redis_client
from app.core.config import settings

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.hp_repo = HealthProfileRepository()

    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> User:
        user_by_email = await self.user_repo.get_by_email(db, user_in.email)
        if user_by_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_by_username = await self.user_repo.get_by_username(db, user_in.username)
        if user_by_username:
            raise HTTPException(status_code=400, detail="Username already taken")

        hashed_password = get_password_hash(user_in.password)
        user = await self.user_repo.create(db, obj_in={
            "email": user_in.email,
            "username": user_in.username,
            "hashed_password": hashed_password
        })

        # Create default health profile
        await self.hp_repo.create(db, obj_in={"user_id": user.id})

        return user

    async def authenticate(self, db: AsyncSession, email: str, password: str):
        user = await self.user_repo.get_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
        
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }

    async def logout(self, token: str):
        if redis_client is not None:
            # Add token to blacklist in redis, expire it based on settings
            try:
                await redis_client.setex(f"blacklist:{token}", settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "true")
            except RedisError:
                return
