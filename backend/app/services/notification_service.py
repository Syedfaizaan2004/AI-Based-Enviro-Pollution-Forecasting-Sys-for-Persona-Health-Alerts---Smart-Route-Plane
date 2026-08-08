import logging
import uuid
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import NotificationType, HealthCondition, AQICategory
from app.models.health_profile import HealthProfile
from app.repositories.notification import NotificationRepository
from app.repositories.health_profile import HealthProfileRepository
from app.schemas.notification import NotificationCreate, NotificationResponse, HealthAdvisoryResponse

logger = logging.getLogger(__name__)

class AlertEngine:
    @staticmethod
    def calculate_priority(notification_type: NotificationType, aqi: Optional[float] = None, health_risk: Optional[str] = None) -> str:
        if notification_type == NotificationType.EMERGENCY:
            return "Critical"
        if notification_type == NotificationType.SYSTEM_ALERT or notification_type in (NotificationType.DAILY_SUMMARY, NotificationType.WEEKLY_SUMMARY):
            return "Low"
            
        if aqi and aqi > 200:
            return "High"
        if aqi and aqi > 100:
            return "Medium"
            
        if health_risk in ("High", "Critical"):
            return "High"
        
        return "Medium"

class HealthAdvisoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)
        
    def generate_advisory_text(self, profile: Optional[HealthProfile], aqi_category: AQICategory, duration_min: float = 0) -> str:
        condition = profile.primary_condition if profile else HealthCondition.NONE
        
        if aqi_category in (AQICategory.SEVERE, AQICategory.VERY_POOR):
            if condition in (HealthCondition.ASTHMA, HealthCondition.COPD, HealthCondition.HEART_DISEASE, HealthCondition.ELDERLY):
                return "CRITICAL: Stay indoors. Keep windows closed. Run air purifiers. Avoid all outdoor activity."
            return "Avoid outdoor exercise. Wear an N95 mask if you must go out. Reduce travel."
            
        if aqi_category == AQICategory.POOR:
            if condition != HealthCondition.NONE:
                return "Limit outdoor exposure. Wear a mask. Keep rescue inhaler nearby."
            return "Consider reducing prolonged outdoor exertion."
            
        if aqi_category == AQICategory.MODERATE:
            if condition in (HealthCondition.ASTHMA, HealthCondition.COPD):
                return "Unusually sensitive individuals should consider reducing prolonged outdoor exertion."
            return "Suitable for healthy adults, but sensitive groups should be aware."
            
        return "Air quality is good. Enjoy outdoor activities."

    def determine_risk_level(self, profile: Optional[HealthProfile], aqi_category: AQICategory) -> str:
        if aqi_category in (AQICategory.SEVERE, AQICategory.VERY_POOR):
            return "Critical" if profile and profile.primary_condition != HealthCondition.NONE else "High"
        if aqi_category == AQICategory.POOR:
            return "High" if profile and profile.primary_condition != HealthCondition.NONE else "Moderate"
        if aqi_category == AQICategory.MODERATE:
            return "Moderate" if profile and profile.primary_condition != HealthCondition.NONE else "Low"
        return "Low"

    async def generate_and_log_advisory(self, user_id: uuid.UUID, aqi_category: AQICategory, duration_min: float = 0, prediction_id: Optional[uuid.UUID] = None, route_id: Optional[uuid.UUID] = None) -> HealthAdvisoryResponse:
        profile_repo = HealthProfileRepository()
        profile = await profile_repo.get_by_user_id(self.db, user_id)
        
        advisory_text = self.generate_advisory_text(profile, aqi_category, duration_min)
        risk_level = self.determine_risk_level(profile, aqi_category)
        
        adv = await self.repo.create_advisory(
            user_id=user_id,
            advisory_text=advisory_text,
            risk_level=risk_level,
            prediction_id=prediction_id,
            route_id=route_id
        )
        return HealthAdvisoryResponse(
            id=adv.id,
            advisory_text=adv.advisory_text,
            risk_level=adv.risk_level,
            created_at=adv.created_at,
            prediction_id=adv.prediction_id,
            route_id=adv.route_id
        )

    async def get_latest_advisories(self, user_id: uuid.UUID, limit: int = 10) -> List[HealthAdvisoryResponse]:
        advs = await self.repo.get_latest_advisories(user_id, limit)
        return [
            HealthAdvisoryResponse(
                id=a.id,
                advisory_text=a.advisory_text,
                risk_level=a.risk_level,
                created_at=a.created_at,
                prediction_id=a.prediction_id,
                route_id=a.route_id
            ) for a in advs
        ]

class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)
        self.profile_repo = HealthProfileRepository()
        
    async def should_notify(self, user_id: uuid.UUID, notif_type: NotificationType) -> bool:
        profile = await self.profile_repo.get_by_user_id(self.db, user_id)
        if not profile:
            return True # default to sending if no profile configured
            
        if profile.notif_emergency_only and notif_type != NotificationType.EMERGENCY:
            return False
            
        if notif_type == NotificationType.HEALTH_ALERT and not profile.notif_health_alerts:
            return False
        if notif_type == NotificationType.ROUTE_RECOMMENDATION and not profile.notif_route_recommendations:
            return False
        if notif_type == NotificationType.DAILY_SUMMARY and not profile.notif_daily_summary:
            return False
        if notif_type == NotificationType.WEEKLY_SUMMARY and not profile.notif_weekly_summary:
            return False
            
        return True

    async def trigger_notification(self, user_id: uuid.UUID, title: str, message: str, notif_type: NotificationType, aqi: Optional[float] = None, health_risk: Optional[str] = None) -> Optional[NotificationResponse]:
        if not await self.should_notify(user_id, notif_type):
            return None
            
        create_dto = NotificationCreate(
            title=title,
            message=message,
            notification_type=notif_type
        )
        notif = await self.repo.create_notification(user_id, create_dto)
        
        priority = AlertEngine.calculate_priority(notif_type, aqi, health_risk)
        
        return NotificationResponse(
            id=notif.id,
            title=notif.title,
            message=notif.message,
            notification_type=notif.notification_type,
            is_read=notif.is_read,
            created_at=notif.created_at,
            priority=priority,
            health_risk=health_risk,
            aqi=aqi
        )

    def _map_to_response(self, notif) -> NotificationResponse:
        # Priority inference for historical reads
        priority = AlertEngine.calculate_priority(notif.notification_type)
        return NotificationResponse(
            id=notif.id,
            title=notif.title,
            message=notif.message,
            notification_type=notif.notification_type,
            is_read=notif.is_read,
            created_at=notif.created_at,
            priority=priority
        )

    async def get_notifications(self, user_id: uuid.UUID, unread_only: bool = False) -> List[NotificationResponse]:
        if unread_only:
            notifs = await self.repo.get_unread(user_id)
        else:
            notifs = await self.repo.get_notifications(user_id)
            
        return [self._map_to_response(n) for n in notifs]

    async def get_notification(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> Optional[NotificationResponse]:
        notif = await self.repo.get_notification(notif_id, user_id)
        return self._map_to_response(notif) if notif else None

    async def mark_as_read(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> Optional[NotificationResponse]:
        notif = await self.repo.mark_as_read(notif_id, user_id)
        return self._map_to_response(notif) if notif else None

    async def mark_all_read(self, user_id: uuid.UUID):
        await self.repo.mark_all_read(user_id)

    async def delete_notification(self, notif_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        return await self.repo.delete_notification(notif_id, user_id)
