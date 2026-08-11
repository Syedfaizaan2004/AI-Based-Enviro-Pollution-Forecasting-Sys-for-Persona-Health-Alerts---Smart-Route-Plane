from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from app.models.enums import FeedbackCategory, FeedbackStatus
from app.schemas.user import UserRead

class FeedbackBase(BaseModel):
    category: FeedbackCategory
    subject: str = Field(..., max_length=255)
    message: str
    rating: Optional[int] = Field(None, ge=1, le=5)

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    status: FeedbackStatus
    admin_response: Optional[str] = None

class FeedbackResponse(FeedbackBase):
    id: UUID
    user_id: UUID
    status: FeedbackStatus
    created_at: datetime
    updated_at: datetime
    
    # We optionally include the user information so the admin can see who sent it
    user: Optional[UserRead] = None
    admin_response: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedFeedbackResponse(BaseModel):
    items: List[FeedbackResponse]
    total_count: int
    page: int
    size: int
