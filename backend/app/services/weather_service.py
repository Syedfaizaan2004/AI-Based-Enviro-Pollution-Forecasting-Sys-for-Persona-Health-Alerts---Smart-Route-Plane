import logging
from fastapi import HTTPException
from app.api_clients.weather_client import OpenWeatherClient
from app.schemas.weather import WeatherResponse
from app.services.cache_service import CacheManager

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.client = OpenWeatherClient()

    async def get_current_weather(self, lat: float, lon: float) -> WeatherResponse:
        # Round coords to 3 decimal places for caching (~111m precision)
        cache_key = f"weather:{round(lat, 3)}:{round(lon, 3)}"
        cached = await CacheManager.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {cache_key}")
            return WeatherResponse(**cached)

        logger.info(f"Cache miss for {cache_key}")
        try:
            data = await self.client.get_current_weather(lat, lon)
        except Exception as e:
            logger.error(f"Weather API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Weather provider unavailable")
            
        if "main" not in data:
            raise HTTPException(status_code=400, detail="OpenWeather error")
            
        main = data["main"]
        wind = data.get("wind", {})
        clouds = data.get("clouds", {})
        weather_arr = data.get("weather", [{}])
        rain = data.get("rain", {}).get("1h")

        response = WeatherResponse(
            temperature=main.get("temp"),
            humidity=main.get("humidity"),
            wind_speed=wind.get("speed"),
            pressure=main.get("pressure"),
            visibility=data.get("visibility"),
            cloud_coverage=clouds.get("all"),
            rainfall=rain,
            description=weather_arr[0].get("description", "")
        )

        await CacheManager.set(cache_key, response.model_dump(), ttl_seconds=300)

        return response
