from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from app.models.enums import UserRole

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
