from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.config import settings

def get_settings():
    return settings

async def get_current_user():
    # Placeholder for authentication
    return {"user_id": "placeholder_user"}

async def get_current_admin(user = Depends(get_current_user)):
    # Placeholder for admin check
    return {"user_id": "placeholder_admin", "is_admin": True}

def get_pagination(skip: int = 0, limit: int = 100):
    return {"skip": skip, "limit": limit}
