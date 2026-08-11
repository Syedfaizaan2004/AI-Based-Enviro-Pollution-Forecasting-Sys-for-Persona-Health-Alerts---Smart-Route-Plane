from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.health_profile import router as health_profile_router
from app.api.v1.aqi import router as aqi_router
from app.api.v1.weather import router as weather_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.routes import router as routes_router
from app.api.v1.notifications import router as notifications_router, advisory_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.history import router as history_router
from app.api.v1.admin import router as admin_router
from app.api.v1.preferences import router as preferences_router
from app.api.v1.maps import router as maps_router
from app.api.v1.system import router as system_router
from app.api.v1.translation import router as translation_router
from app.api.v1.chat import router as chat_router
from app.api.v1.feedback import router as feedback_router

api_router = APIRouter()

api_router.include_router(system_router)

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(health_profile_router)
api_router.include_router(preferences_router)
api_router.include_router(aqi_router)
api_router.include_router(weather_router)
api_router.include_router(predictions_router)
api_router.include_router(routes_router)
api_router.include_router(maps_router)
api_router.include_router(notifications_router)
api_router.include_router(advisory_router)
api_router.include_router(dashboard_router)
api_router.include_router(history_router)
api_router.include_router(admin_router)
api_router.include_router(translation_router)
api_router.include_router(chat_router)
api_router.include_router(feedback_router)
