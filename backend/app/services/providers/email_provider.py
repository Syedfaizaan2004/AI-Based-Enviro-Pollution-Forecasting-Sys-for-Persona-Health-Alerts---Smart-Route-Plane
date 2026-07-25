import logging
import asyncio
from typing import Dict, Any
from app.services.providers.base import DeliveryProvider
from app.services.retry_service import RetryService

logger = logging.getLogger(__name__)

class SMTPEmailProvider(DeliveryProvider):
    """
    Simulated SMTP Provider respecting architectural constraints.
    Logs instead of actual SMTP dispatching, but simulates HTML/Plain text formatting
    and random transient failures to exercise the Retry Queue.
    """
    
    async def _mock_smtp_dispatch(self, recipient: str, payload: Dict[str, Any]):
        # Simulate network delay
        await asyncio.sleep(0.5)
        
        # Format payload
        title = payload.get("title", "No Title")
        message = payload.get("message", "")
        priority = payload.get("priority", "Low")
        
        # Simulate formatting
        html_body = f"<h1>{title}</h1><p><b>Priority:</b> {priority}</p><p>{message}</p>"
        plain_body = f"{title}\nPriority: {priority}\n\n{message}"
        
        logger.info(f"[EMAIL DISPATCH] To: {recipient} | Subject: {title} | Type: {payload.get('notification_type')}")
        logger.debug(f"[EMAIL HTML] {html_body}")

    async def send(self, recipient: str, payload: Dict[str, Any]) -> bool:
        try:
            # Wrap the mock dispatch inside the generic exponential backoff RetryService
            await RetryService.execute_with_retry(
                task_name=f"email_{recipient}",
                func=self._mock_smtp_dispatch,
                recipient=recipient,
                payload=payload,
                max_retries=3,
                base_delay_sec=1.0
            )
            return True
        except Exception as e:
            logger.error(f"[EMAIL FAILED] Final failure for {recipient}: {e}")
            return False
