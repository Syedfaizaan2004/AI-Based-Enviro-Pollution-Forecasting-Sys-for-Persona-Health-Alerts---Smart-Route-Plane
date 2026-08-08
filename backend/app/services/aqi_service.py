import logging
import datetime
from fastapi import HTTPException
from app.api_clients.weather_client import OpenWeatherClient
from app.schemas.aqi import AQILiveResponse
from app.services.cache_service import CacheManager

logger = logging.getLogger(__name__)

def _get_aqi_category(aqi_val: float) -> str:
    if aqi_val <= 50: return "Good"
    elif aqi_val <= 100: return "Moderate"
    elif aqi_val <= 150: return "Unhealthy for Sensitive Groups"
    elif aqi_val <= 200: return "Unhealthy"
    elif aqi_val <= 300: return "Very Unhealthy"
    else: return "Hazardous"

def _map_owm_aqi_to_standard(owm_aqi: int) -> int:
    if owm_aqi == 1: return 35
    elif owm_aqi == 2: return 75
    elif owm_aqi == 3: return 125
    elif owm_aqi == 4: return 175
    elif owm_aqi == 5: return 250
    return 25

class AQIService:
    def __init__(self):
        self.client = OpenWeatherClient()

    async def get_live_aqi(self, city: str) -> AQILiveResponse:
        cache_key = f"owm:city:{city.lower()}"
        cached = await CacheManager.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {cache_key}")
            return AQILiveResponse(**cached)

        logger.info(f"Cache miss for {cache_key}")
        try:
            geo_data = await self.client.geocode_city(city)
            if not geo_data or "lat" not in geo_data:
                raise HTTPException(status_code=404, detail=f"City not found: {city}")
                
            lat = geo_data["lat"]
            lon = geo_data["lon"]
            city_name = geo_data.get("name", city)
            
            # Now reuse the geo method
            response = await self.get_live_aqi_by_geo(lat, lon, city_name=city_name)
            
            # Also cache it under the city key
            await CacheManager.set(cache_key, response.model_dump(), ttl_seconds=600)
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"OpenWeather geocoding error: {str(e)}")
            raise HTTPException(status_code=502, detail="Weather provider unavailable")

    async def get_live_aqi_by_geo(self, lat: float, lng: float, city_name: str = "Unknown") -> AQILiveResponse:
        cache_key = f"owm:geo:{round(lat,2)}:{round(lng,2)}"
        cached = await CacheManager.get(cache_key)
        if cached:
            logger.info(f"Cache hit for {cache_key}")
            # If city_name was provided and cached was "Unknown", we could override it, but this is fine
            return AQILiveResponse(**cached)

        logger.info(f"Cache miss for {cache_key}")
        try:
            data = await self.client.get_air_pollution(lat, lng)
        except Exception as e:
            logger.error(f"OpenWeather API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Weather provider unavailable")
            
        if "list" not in data or not data["list"]:
            raise HTTPException(status_code=404, detail="No pollution data available for this location")
            
        current_data = data["list"][0]
        
        owm_aqi = current_data.get("main", {}).get("aqi", 0)
        standard_aqi = _map_owm_aqi_to_standard(owm_aqi)
        cat = _get_aqi_category(standard_aqi)

        components = current_data.get("components", {})
        
        # Find dominant pollutant (highest value)
        dominant_pollutant = ""
        highest_val = -1
        for pol, val in components.items():
            if val > highest_val:
                highest_val = val
                dominant_pollutant = pol
                
        timestamp = None
        if "dt" in current_data:
            timestamp = datetime.datetime.fromtimestamp(current_data["dt"]).isoformat() + "Z"

        response = AQILiveResponse(
            aqi=standard_aqi,
            city=city_name,
            station_lat=lat,
            station_lon=lng,
            dominant_pollutant=dominant_pollutant,
            pollutants={k: {"v": v} for k, v in components.items()},
            category=cat,
            timestamp=timestamp
        )

        await CacheManager.set(cache_key, response.model_dump(), ttl_seconds=600)

        return response
