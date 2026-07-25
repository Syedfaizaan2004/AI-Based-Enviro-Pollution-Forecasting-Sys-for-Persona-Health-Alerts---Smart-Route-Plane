from pydantic import BaseModel
from typing import Optional
import uuid
from app.models.enums import HealthCondition

class HealthProfileRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    primary_condition: HealthCondition
    has_asthma: bool
    has_copd: bool
    has_heart_disease: bool
    is_elderly: bool
    is_pregnant: bool
    is_child: bool
    
    notif_email: bool
    notif_push: bool
    notif_sms: bool
    notif_daily_summary: bool
    notif_health_alerts: bool
    notif_route_recommendations: bool
    notif_weekly_summary: bool
    notif_emergency_only: bool

    model_config = {"from_attributes": True}

class HealthProfileUpdate(BaseModel):
    primary_condition: Optional[HealthCondition] = None
    has_asthma: Optional[bool] = None
    has_copd: Optional[bool] = None
    has_heart_disease: Optional[bool] = None
    is_elderly: Optional[bool] = None
    is_pregnant: Optional[bool] = None
    is_child: Optional[bool] = None

    notif_email: Optional[bool] = None
    notif_push: Optional[bool] = None
    notif_sms: Optional[bool] = None
    notif_daily_summary: Optional[bool] = None
    notif_health_alerts: Optional[bool] = None
    notif_route_recommendations: Optional[bool] = None
    notif_weekly_summary: Optional[bool] = None
    notif_emergency_only: Optional[bool] = None
