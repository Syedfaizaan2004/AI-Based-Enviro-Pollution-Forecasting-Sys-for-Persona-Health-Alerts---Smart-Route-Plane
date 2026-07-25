from fastapi import APIRouter, Depends
from app.schemas.preferences import UserPreferencesRead, UserPreferencesUpdate
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.services.preference_service import PreferenceService

router = APIRouter(prefix="/preferences", tags=["User Preferences"])

@router.get("", response_model=UserPreferencesRead)
async def get_preferences(current_user: User = Depends(get_current_user)):
    service = PreferenceService()
    return await service.get_preferences(current_user.id)

@router.patch("", response_model=UserPreferencesRead)
async def patch_preferences(
    pref_in: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user)
):
    service = PreferenceService()
    return await service.update_preferences(current_user.id, pref_in)
