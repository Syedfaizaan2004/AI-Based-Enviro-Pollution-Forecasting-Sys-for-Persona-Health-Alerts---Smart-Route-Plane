import logging
from fastapi import HTTPException
from app.api_clients.waqi_client import WAQIClient
from app.schemas.aqi import AQILiveResponse
from app.services.cache_service import CacheManager

logger = logging.getLogger(__name__)

class AQIService:
    def __init__(self):
        self.client = WAQIClient()

    async def get_live_aqi(self, city: str) -> AQILiveResponse:
        cache_key = f"waqi:city:{city.lower()}"
        cached = await CacheManager.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {cache_key}")
            return AQILiveResponse(**cached)

        logger.info(f"Cache miss for {cache_key}")
        data = await self.client.get_city_feed(city)
        if data.get("status") != "ok":
            error_reason = data.get("data", "Unknown error")
            raise HTTPException(status_code=404, detail=f"City not found or WAQI error: {error_reason}")
            
        result = data["data"]
        
        # Determine category based on Phase 0 guidelines
        aqi_val = result.get("aqi", 0)
        if aqi_val <= 50: cat = "Good"
        elif aqi_val <= 100: cat = "Moderate"
        elif aqi_val <= 150: cat = "Unhealthy for Sensitive Groups"
        elif aqi_val <= 200: cat = "Unhealthy"
        elif aqi_val <= 300: cat = "Very Unhealthy"
        else: cat = "Hazardous"

        response = AQILiveResponse(
            aqi=aqi_val,
            city=result.get("city", {}).get("name", city),
            dominant_pollutant=result.get("dominentpol"),
            pollutants=result.get("iaqi", {}),
            category=cat,
            timestamp=result.get("time", {}).get("iso")
        )

        await CacheManager.set(cache_key, response.model_dump(), ttl_seconds=600)

        return response
