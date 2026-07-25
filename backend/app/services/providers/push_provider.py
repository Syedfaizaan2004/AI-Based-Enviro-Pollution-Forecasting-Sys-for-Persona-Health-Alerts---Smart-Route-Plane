import logging
import asyncio
from typing import Dict, Any
from app.services.providers.base import DeliveryProvider
from app.services.retry_service import RetryService

logger = logging.getLogger(__name__)

class PushNotificationProvider(DeliveryProvider):
    """
    Simulated Push Provider (e.g., Firebase FCM / OneSignal).
    Logs the payload delivery for APNs / FCM formatted structures.
    """
    
    async def _mock_push_dispatch(self, device_token: str, payload: Dict[str, Any]):
        await asyncio.sleep(0.3)
        
        fcm_payload = {
            "to": device_token,
            "notification": {
                "title": payload.get("title"),
                "body": payload.get("message"),
                "sound": "default",
                "badge": 1
            },
            "data": {
                "type": payload.get("notification_type"),
                "priority": payload.get("priority", "Low")
            }
        }
        
        logger.info(f"[PUSH DISPATCH] Token: {device_token[:8]}... | FCM Payload Formatted")
        logger.debug(f"[PUSH DATA] {fcm_payload}")

    async def send(self, recipient: str, payload: Dict[str, Any]) -> bool:
        try:
            await RetryService.execute_with_retry(
                task_name=f"push_{recipient}",
                func=self._mock_push_dispatch,
                device_token=recipient,
                payload=payload,
                max_retries=3,
                base_delay_sec=0.5
            )
            return True
        except Exception as e:
            logger.error(f"[PUSH FAILED] Final failure for {recipient}: {e}")
            return False
