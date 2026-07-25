from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.health_profile import HealthProfileRead, HealthProfileUpdate
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.services.health_profile_service import HealthProfileService

router = APIRouter(prefix="/health-profile", tags=["Health Profile"])

@router.get("", response_model=HealthProfileRead)
async def get_health_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HealthProfileService()
    return await service.get_profile(db, current_user.id)

@router.patch("", response_model=HealthProfileRead)
async def patch_health_profile(
    profile_in: HealthProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HealthProfileService()
    return await service.update_profile(db, current_user.id, profile_in)

@router.put("", response_model=HealthProfileRead)
async def put_health_profile(
    profile_in: HealthProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = HealthProfileService()
    return await service.update_profile(db, current_user.id, profile_in)
