import uuid
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from app.models.user import User
from app.models.prediction import PredictionHistory
from app.models.route import RouteHistory
from app.models.notification import Notification
from app.services.health_service import HealthService
from app.schemas.admin import AdminSystemStatus

class AdminService:
    @staticmethod
    async def get_users_paginated(db: AsyncSession, skip: int = 0, limit: int = 100) -> Tuple[int, List[User]]:
        count_query = select(func.count(User.id))
        total = await db.scalar(count_query)
        
        users_query = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
        users = (await db.scalars(users_query)).all()
        
        return total, users

    @staticmethod
    async def toggle_user_activation(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> bool:
        stmt = update(User).where(User.id == user_id).values(is_active=is_active)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
        
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> bool:
        stmt = update(User).where(User.id == user_id).values(is_deleted=True, is_active=False)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_system_status(db: AsyncSession) -> AdminSystemStatus:
        total_users = await db.scalar(select(func.count(User.id)))
        active_users = await db.scalar(select(func.count(User.id)).where(User.is_active == True))
        total_preds = await db.scalar(select(func.count(PredictionHistory.id)))
        total_routes = await db.scalar(select(func.count(RouteHistory.id)))
        total_notifs = await db.scalar(select(func.count(Notification.id)))
        
        health = await HealthService.get_system_health()
        
        return AdminSystemStatus(
            total_users=total_users,
            active_users=active_users,
            total_predictions=total_preds,
            total_routes=total_routes,
            total_notifications=total_notifs,
            database_status=health["components"]["database"]["status"],
            redis_status=health["components"]["redis"]["status"]
        )
