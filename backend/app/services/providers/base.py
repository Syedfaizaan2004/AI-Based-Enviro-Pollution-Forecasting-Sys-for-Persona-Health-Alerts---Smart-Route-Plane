from typing import Dict, Any, Optional

class DeliveryProvider:
    """Abstract Base Class for Notification Providers"""
    
    async def send(self, recipient: str, payload: Dict[str, Any]) -> bool:
        """
        Sends the payload to the recipient.
        Must return True on success, False on failure.
        """
        raise NotImplementedError
