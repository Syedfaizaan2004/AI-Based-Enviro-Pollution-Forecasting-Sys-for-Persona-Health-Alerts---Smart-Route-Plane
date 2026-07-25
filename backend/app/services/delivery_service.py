import uuid
import logging
from typing import Dict, Any, Optional
from app.services.providers.email_provider import SMTPEmailProvider
from app.services.providers.push_provider import PushNotificationProvider
from app.repositories.health_profile import HealthProfileRepository
from app.schemas.notification import NotificationResponse
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

class NotificationDeliveryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.profile_repo = HealthProfileRepository()
        self.email_provider = SMTPEmailProvider()
        self.push_provider = PushNotificationProvider()

    async def deliver(self, user_id: uuid.UUID, notification: NotificationResponse, user_email: Optional[str] = None, device_token: Optional[str] = None) -> bool:
        """
        Routes the constructed NotificationResponse to the appropriate Provider
        based on the user's HealthProfile preferences.
        """
        profile = await self.profile_repo.get_by_user_id(self.db, user_id)
        if not profile:
            logger.warning(f"No HealthProfile found for user {user_id}. Skipping delivery.")
            return False

        payload = {
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "priority": notification.priority
        }

        success = True

        # Email Delivery
        if profile.notif_email and user_email:
            email_success = await self.email_provider.send(user_email, payload)
            success = success and email_success
            
        # Push Delivery
        if profile.notif_push and device_token:
            push_success = await self.push_provider.send(device_token, payload)
            success = success and push_success
            
        return success
