import uuid
from typing import List, Optional
from sqlalchemy import select, update, delete, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.health_advisory import HealthAdvisoryLog
from app.schemas.notification import NotificationCreate

class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(self, user_id: uuid.UUID, notif: NotificationCreate) -> Notification:
        new_notif = Notification(
            user_id=user_id,
            title=notif.title,
            message=notif.message,
            notification_type=notif.notification_type,
            is_read=False
        )
        self.db.add(new_notif)
        await self.db.commit()
        await self.db.refresh(new_notif)
        return new_notif

    async def get_notifications(self, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> List[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id).order_by(desc(Notification.created_at)).offset(offset).limit(limit)
        res = await self.db.execute(stmt)
        return res.scalars().all()

    async def get_unread(self, user_id: uuid.UUID) -> List[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id, Notification.is_read == False).order_by(desc(Notification.created_at))
        res = await self.db.execute(stmt)
        return res.scalars().all()

    async def get_notification(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        stmt = select(Notification).where(Notification.id == notif_id, Notification.user_id == user_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def mark_as_read(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> Optional[Notification]:
        stmt = update(Notification).where(Notification.id == notif_id, Notification.user_id == user_id).values(is_read=True).returning(Notification)
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.scalar_one_or_none()

    async def mark_all_read(self, user_id: uuid.UUID):
        stmt = update(Notification).where(Notification.user_id == user_id, Notification.is_read == False).values(is_read=True)
        await self.db.execute(stmt)
        await self.db.commit()

    async def delete_notification(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        stmt = delete(Notification).where(Notification.id == notif_id, Notification.user_id == user_id).returning(Notification.id)
        res = await self.db.execute(stmt)
        await self.db.commit()
        return res.scalar_one_or_none() is not None

    # Advisories
    async def create_advisory(self, user_id: uuid.UUID, advisory_text: str, risk_level: str, prediction_id: Optional[uuid.UUID] = None, route_id: Optional[uuid.UUID] = None) -> HealthAdvisoryLog:
        adv = HealthAdvisoryLog(
            user_id=user_id,
            advisory_text=advisory_text,
            risk_level=risk_level,
            prediction_id=prediction_id,
            route_id=route_id
        )
        self.db.add(adv)
        await self.db.commit()
        await self.db.refresh(adv)
        return adv

    async def get_latest_advisories(self, user_id: uuid.UUID, limit: int = 10) -> List[HealthAdvisoryLog]:
        stmt = select(HealthAdvisoryLog).where(HealthAdvisoryLog.user_id == user_id).order_by(desc(HealthAdvisoryLog.created_at)).limit(limit)
        res = await self.db.execute(stmt)
        return res.scalars().all()