import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.notification import NotificationResponse, HealthAdvisoryResponse, NotificationSummary
from app.services.notification_service import NotificationService, HealthAdvisoryService

router = APIRouter(prefix="/notifications", tags=["Notifications"])
advisory_router = APIRouter(prefix="/health-advisories", tags=["Health Advisories"])

# NOTIFICATIONS ENDPOINTS

@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = NotificationService(db)
    return await service.get_notifications(current_user.id, unread_only=False)

@router.get("/unread", response_model=List[NotificationResponse])
async def get_unread_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = NotificationService(db)
    return await service.get_notifications(current_user.id, unread_only=True)

@router.patch("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = NotificationService(db)
    await service.mark_all_read(current_user.id)
    return {"message": "All notifications marked as read"}

@router.get("/{id}", response_model=NotificationResponse)
async def get_notification(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = NotificationService(db)
    notif = await service.get_notification(id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.patch("/{id}/read", response_model=NotificationResponse)
async def mark_as_read(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = NotificationService(db)
    notif = await service.mark_as_read(id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notif

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = NotificationService(db)
    success = await service.delete_notification(id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None

# HEALTH ADVISORIES ENDPOINTS

@advisory_router.get("/latest", response_model=List[HealthAdvisoryResponse])
async def get_latest_advisories(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = HealthAdvisoryService(db)
    return await service.get_latest_advisories(current_user.id, limit=5)

@advisory_router.get("/history", response_model=List[HealthAdvisoryResponse])
async def get_advisory_history(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = HealthAdvisoryService(db)
    return await service.get_latest_advisories(current_user.id, limit=50)

@advisory_router.get("/current", response_model=HealthAdvisoryResponse)
async def get_current_advisory(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = HealthAdvisoryService(db)
    advs = await service.get_latest_advisories(current_user.id, limit=1)
    if not advs:
        raise HTTPException(status_code=404, detail="No current advisory found")
    return advs[0]
