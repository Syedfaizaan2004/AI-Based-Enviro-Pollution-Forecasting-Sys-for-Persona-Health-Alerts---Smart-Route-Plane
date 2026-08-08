from fastapi import APIRouter, Query
from app.schemas.weather import WeatherResponse, DailyForecastResponse
from app.services.weather_service import WeatherService

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180)
):
    service = WeatherService()
    return await service.get_current_weather(latitude, longitude)

@router.get("/forecast", response_model=DailyForecastResponse)
async def get_daily_forecast(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180)
):
    service = WeatherService()
    return await service.get_daily_forecast(latitude, longitude)
