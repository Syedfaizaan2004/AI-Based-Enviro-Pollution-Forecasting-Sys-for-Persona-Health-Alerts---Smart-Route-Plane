from app.schemas.preferences import UserPreferencesRead, UserPreferencesUpdate
from app.services.cache_service import CacheManager
import uuid

class PreferenceService:
    async def get_preferences(self, user_id: uuid.UUID) -> UserPreferencesRead:
        key = f"user:{user_id}:preferences"
        data = await CacheManager.get(key)
        if not data:
            return UserPreferencesRead()
            
        return UserPreferencesRead(**data)

    async def update_preferences(self, user_id: uuid.UUID, pref_in: UserPreferencesUpdate) -> UserPreferencesRead:
        current = await self.get_preferences(user_id)
        updated_dict = current.model_dump()
        
        for k, v in pref_in.model_dump(exclude_unset=True).items():
            updated_dict[k] = v
            
        new_prefs = UserPreferencesRead(**updated_dict)
        
        key = f"user:{user_id}:preferences"
        await CacheManager.set(key, new_prefs.model_dump(), ttl_seconds=None)
            
        return new_prefs
