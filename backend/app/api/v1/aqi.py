from fastapi import APIRouter, Query
from typing import Optional
from app.schemas.aqi import AQILiveResponse
from app.services.aqi_service import AQIService

router = APIRouter(prefix="/aqi", tags=["AQI"])

@router.get("/live", response_model=AQILiveResponse)
async def get_live_aqi(
    city: Optional[str] = None,
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lon: Optional[float] = Query(None, ge=-180, le=180)
):
    service = AQIService()
    if lat is not None and lon is not None:
        return await service.get_live_aqi_by_geo(lat, lon)
    if city:
        return await service.get_live_aqi(city)
    from fastapi import HTTPException
    raise HTTPException(status_code=400, detail="Must provide either city or lat/lon")
