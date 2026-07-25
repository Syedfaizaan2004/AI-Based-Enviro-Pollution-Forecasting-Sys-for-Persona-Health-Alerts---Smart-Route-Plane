from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from app.core.database import get_db
from app.api.dependencies.auth import get_current_admin
from app.services.admin_service import AdminService
from app.schemas.admin import AdminUserListResponse, AdminUserResponse, AdminSystemStatus
from app.models.user import User

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
async def activate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    success = await AdminService.toggle_user_activation(db, user_id, True)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} activated"}

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    success = await AdminService.toggle_user_activation(db, user_id, False)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} deactivated"}

@router.delete("/users/{user_id}")
async def soft_delete_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    success = await AdminService.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {user_id} soft deleted"}

@router.get("/system/status", response_model=AdminSystemStatus)
async def system_status(db: AsyncSession = Depends(get_db)):
    return await AdminService.get_system_status(db)
