from fastapi import APIRouter
from app.schemas.aqi import AQILiveResponse
from app.services.aqi_service import AQIService

router = APIRouter(prefix="/aqi", tags=["AQI"])

@router.get("/live", response_model=AQILiveResponse)
async def get_live_aqi(city: str):
    service = AQIService()
    return await service.get_live_aqi(city)
