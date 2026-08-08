from pydantic import BaseModel, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime
from app.models.enums import UserRole, APIStatus, NotificationType, HealthCondition

class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: UserRole
    is_active: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
    
class AdminUserListResponse(BaseModel):
    total: int
    users: List[AdminUserResponse]
    
class AdminSystemStatus(BaseModel):
    total_users: int
    active_users: int
    total_predictions: int
    total_routes: int
    total_notifications: int
    database_status: str
    redis_status: str

class AdminInviteCreate(BaseModel):
    email: EmailStr

class AdminRegister(BaseModel):
    token: str
    email: EmailStr
    username: str
    password: str

class AnalyticsDailyUsage(BaseModel):
    date: str
    predictions: int
    routes: int

class AnalyticsCityUsage(BaseModel):
    city_name: str
    count: int

class AdminAnalyticsResponse(BaseModel):
    daily_usage: List[AnalyticsDailyUsage]
    top_cities: List[AnalyticsCityUsage]

class ApiLogResponse(BaseModel):
    id: uuid.UUID
    endpoint: str
    method: str
    status_code: int
    response_time_ms: float
    client_ip: Optional[str]
    status: APIStatus
    error_message: Optional[str]
    created_at: datetime

class ApiLogListResponse(BaseModel):
    total: int
    logs: List[ApiLogResponse]

class AdminNotificationLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_email: str
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    created_at: datetime

class AdminNotificationLogListResponse(BaseModel):
    total: int
    notifications: List[AdminNotificationLogResponse]

class AdminHealthProfileResponse(BaseModel):
    primary_condition: HealthCondition
    has_asthma: bool
    has_copd: bool
    has_heart_disease: bool
    is_elderly: bool
    is_pregnant: bool
    is_child: bool

class AdminExposureHistoryResponse(BaseModel):
    daily_avg_aqi: float
    peak_aqi: float
    total_duration_outdoors_min: float
    cumulative_pm25: float
    created_at: datetime

class AdminRouteSummaryResponse(BaseModel):
    id: uuid.UUID
    start_address: Optional[str]
    end_address: Optional[str]
    total_distance_km: float
    created_at: datetime

class AdminUserDetailsResponse(BaseModel):
    user: AdminUserResponse
    health_profile: Optional[AdminHealthProfileResponse]
    recent_exposures: List[AdminExposureHistoryResponse]
    recent_routes: List[AdminRouteSummaryResponse]

class AdminHealthAdvisoryTemplateBase(BaseModel):
    aqi_category: str
    min_aqi: float
    max_aqi: float
    general_advice: str
    sensitive_group_advice: str

class AdminHealthAdvisoryTemplateCreate(AdminHealthAdvisoryTemplateBase):
    pass

class AdminHealthAdvisoryTemplateUpdate(BaseModel):
    general_advice: Optional[str] = None
    sensitive_group_advice: Optional[str] = None

class AdminHealthAdvisoryTemplateResponse(AdminHealthAdvisoryTemplateBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime



