import uuid
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.models.enums import NotificationType

class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: NotificationType
    
class NotificationCreate(NotificationBase):
    target_regions: Optional[List[str]] = None

class NotificationResponse(NotificationBase):
    id: uuid.UUID
    is_read: bool
    created_at: datetime
    priority: str = "Low"  # Inferred since not in DB
    health_risk: Optional[str] = None
    aqi: Optional[float] = None
    related_prediction_id: Optional[uuid.UUID] = None
    related_route_id: Optional[uuid.UUID] = None

class HealthAdvisoryResponse(BaseModel):
    id: uuid.UUID
    advisory_text: str
    risk_level: str
    created_at: datetime
    prediction_id: Optional[uuid.UUID] = None
    route_id: Optional[uuid.UUID] = None

class NotificationSummary(BaseModel):
    total_unread: int
    latest_notifications: List[NotificationResponse]
