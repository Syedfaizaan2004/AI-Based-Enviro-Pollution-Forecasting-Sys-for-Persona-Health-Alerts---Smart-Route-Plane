from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
import uuid

from app.core.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.api.dependencies.auth import get_current_user, get_current_admin
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackUpdate, PaginatedFeedbackResponse
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Submit new feedback from a normal user."""
    service = FeedbackService(db)
    return await service.create_feedback(current_user.id, feedback_in)

@router.get("/me", response_model=PaginatedFeedbackResponse)
async def get_my_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve feedback submitted by the current user."""
    service = FeedbackService(db)
    items, total = await service.get_user_feedback(current_user.id, skip, limit)
    
    return {
        "items": items,
        "total_count": total,
        "page": (skip // limit) + 1,
        "size": limit,
    }

@router.get("/", response_model=PaginatedFeedbackResponse)
async def get_all_feedback(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all feedback (Admin only)."""
    service = FeedbackService(db)
    items, total = await service.get_all_feedback(skip, limit)
    
    return {
        "items": items,
        "total_count": total,
        "page": (skip // limit) + 1,
        "size": limit,
    }

@router.patch("/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback_status(
    feedback_id: uuid.UUID,
    feedback_update: FeedbackUpdate,
    current_user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """Update feedback status (Admin only)."""
    service = FeedbackService(db)
    return await service.update_feedback_status(feedback_id, feedback_update)
