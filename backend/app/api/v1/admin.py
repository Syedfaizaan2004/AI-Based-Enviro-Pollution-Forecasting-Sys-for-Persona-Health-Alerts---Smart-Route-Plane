from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import List
from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.services.admin_service import AdminService
from app.schemas.admin import (
    AdminUserListResponse, AdminUserResponse, AdminSystemStatus, AdminInviteCreate,
    AdminAnalyticsResponse, ApiLogListResponse, ApiLogResponse,
    AdminNotificationLogListResponse, AdminNotificationLogResponse,
    AdminUserDetailsResponse, AdminHealthAdvisoryTemplateResponse, AdminHealthAdvisoryTemplateUpdate
)
from app.schemas.notification import NotificationCreate
from app.services.notification_service import NotificationService
from app.services.email_service import send_email
from app.models.user import User
from app.models.enums import UserRole
import secrets
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(get_current_admin)])

@router.get("/users", response_model=AdminUserListResponse)
async def list_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    total, users = await AdminService.get_users_paginated(db, skip, limit)
    
    user_responses = [
        AdminUserResponse(
            id=u.id, email=u.email, role=u.role, 
            is_active=u.is_active, is_deleted=u.is_deleted,
            created_at=u.created_at, updated_at=u.updated_at
        )
        for u in users
    ]
    return AdminUserListResponse(total=total, users=user_responses)

@router.post("/users/{user_id}/activate")
async def activate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    try:
        success = await AdminService.toggle_user_activation(db, user_id, True, current_admin)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"User {user_id} activated"}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    try:
        success = await AdminService.toggle_user_activation(db, user_id, False, current_admin)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"User {user_id} deactivated"}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.delete("/users/{user_id}")
async def soft_delete_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    try:
        success = await AdminService.delete_user(db, user_id, current_admin)
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": f"User {user_id} soft deleted"}
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/users/{user_id}/notify")
async def send_notification(user_id: uuid.UUID, notification: NotificationCreate, db: AsyncSession = Depends(get_db)):
    service = NotificationService(db)
    # Bypass user preferences for admin-forced notifications
    notif = await service.repo.create_notification(user_id, notification)
    if not notif:
        raise HTTPException(status_code=404, detail="User not found or notification failed")
    return {"message": "Notification sent successfully"}

@router.post("/notifications/broadcast")
async def broadcast_notification(notification: NotificationCreate, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.enums import UserRole
    
    # Get all active normal users
    query = select(User).where(
        User.role == UserRole.USER,
        User.is_active == True,
        User.is_deleted == False
    )
    
    if notification.target_regions and len(notification.target_regions) > 0 and "all" not in [r.lower() for r in notification.target_regions]:
        query = query.where(User.region.in_(notification.target_regions))
        
    users = (await db.scalars(query)).all()
    
    service = NotificationService(db)
    count = 0
    for user in users:
        await service.repo.create_notification(user.id, notification)
        count += 1
        
    return {"message": f"Broadcast sent successfully to {count} users"}

@router.get("/system/status", response_model=AdminSystemStatus)
async def system_status(db: AsyncSession = Depends(get_db)):
    return await AdminService.get_system_status(db)

@router.post("/invites")
async def create_admin_invite(invite: AdminInviteCreate, db: AsyncSession = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    if current_admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admins can generate invites")
        
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=1)
    
    try:
        await AdminService.create_invitation(db, invite.email, token, current_admin.id, expires_at)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create invite in database: {str(e)}")
        
    signup_link = f"http://localhost:5173/signup?invite_token={token}"
    
    email_body = f"""
    <h2>AirGuard Admin Invitation</h2>
    <p>You have been invited to become an Admin on the AirGuard platform.</p>
    <p>Please click the link below to create your account. This link will expire in 24 hours.</p>
    <a href="{signup_link}" style="display:inline-block;padding:10px 20px;background-color:#10b981;color:white;text-decoration:none;border-radius:5px;">Accept Invitation</a>
    <p>Or copy this URL: {signup_link}</p>
    """
    
    email_sent = await send_email(
        to_email=invite.email,
        subject="AirGuard Admin Invitation",
        body=email_body,
        is_html=True
    )
    
    if not email_sent:
        print(f"SMTP error, but invite generated: {signup_link}")
        
    return {
        "message": "Admin invite generated successfully. Email queued for sending.",
        "email": invite.email,
        "invite_token": token,
        "invite_link": signup_link
    }

@router.get("/invites")
async def get_admin_invites(db: AsyncSession = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    if current_admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Only Super Admins can view invitations")
        
    invites = await AdminService.get_invitations(db)
    return [
        {
            "id": inv.id,
            "email": inv.email,
            "status": inv.status,
            "created_at": inv.created_at,
            "expires_at": inv.expires_at
        }
        for inv in invites
    ]

@router.get("/analytics", response_model=AdminAnalyticsResponse)
async def get_analytics(db: AsyncSession = Depends(get_db)):
    return await AdminService.get_analytics(db)

@router.get("/logs/api", response_model=ApiLogListResponse)
async def get_api_logs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    total, logs = await AdminService.get_api_logs(db, skip, limit)
    
    log_responses = [
        ApiLogResponse(
            id=log.id,
            endpoint=log.endpoint,
            method=log.method,
            status_code=log.status_code,
            response_time_ms=log.response_time_ms,
            client_ip=log.client_ip,
            status=log.status,
            error_message=log.error_message,
            created_at=log.created_at
        )
        for log in logs
    ]
    return ApiLogListResponse(total=total, logs=log_responses)

@router.get("/notifications/delivery", response_model=AdminNotificationLogListResponse)
async def get_notification_logs(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    total, logs = await AdminService.get_notification_logs(db, skip, limit)
    
    responses = [
        AdminNotificationLogResponse(
            id=notif.id,
            user_id=notif.user_id,
            user_email=email,
            title=notif.title,
            message=notif.message,
            notification_type=notif.notification_type,
            is_read=notif.is_read,
            created_at=notif.created_at
        )
        for notif, email in logs
    ]
    return AdminNotificationLogListResponse(total=total, notifications=responses)

@router.get("/users/{user_id}/details", response_model=AdminUserDetailsResponse)
async def get_user_details(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    details = await AdminService.get_user_details(db, user_id)
    if not details:
        raise HTTPException(status_code=404, detail="User not found")
    return details

@router.get("/cms/health-advisories", response_model=List[AdminHealthAdvisoryTemplateResponse])
async def get_health_advisories(db: AsyncSession = Depends(get_db)):
    return await AdminService.get_health_advisory_templates(db)

@router.put("/cms/health-advisories/{template_id}", response_model=AdminHealthAdvisoryTemplateResponse)
async def update_health_advisory(template_id: uuid.UUID, data: AdminHealthAdvisoryTemplateUpdate, db: AsyncSession = Depends(get_db)):
    template = await AdminService.update_health_advisory_template(db, template_id, data)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template
