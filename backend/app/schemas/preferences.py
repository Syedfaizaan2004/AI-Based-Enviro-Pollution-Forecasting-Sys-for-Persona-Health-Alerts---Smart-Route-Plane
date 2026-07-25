from pydantic import BaseModel, Field
from typing import Optional

class UserPreferencesRead(BaseModel):
    preferred_language: str = "en"
    preferred_aqi_unit: str = "us-epa"
    preferred_notification_method: str = "push"
    preferred_dashboard_settings: str = "default"
    preferred_theme: str = "system"
    preferred_default_route_type: str = "balanced"
    travel_preference: str = "balanced" # fastest, safest, balanced
    aqi_threshold: Optional[int] = None # Overridden custom threshold
    notif_aqi_alerts: bool = True

class UserPreferencesUpdate(BaseModel):
    preferred_language: Optional[str] = None
    preferred_aqi_unit: Optional[str] = None
    preferred_notification_method: Optional[str] = None
    preferred_dashboard_settings: Optional[str] = None
    preferred_theme: Optional[str] = None
    preferred_default_route_type: Optional[str] = None
    travel_preference: Optional[str] = Field(None, pattern="^(fastest|safest|balanced)$")
    aqi_threshold: Optional[int] = Field(None, ge=0, le=500)
    notif_aqi_alerts: Optional[bool] = None
