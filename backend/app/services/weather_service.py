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
            description=weather_arr[0].get("description", ""),
            location_name=data.get("name", "Unknown Location")
        )

        await CacheManager.set(cache_key, response.model_dump(), ttl_seconds=300)

        return response

    async def get_daily_forecast(self, lat: float, lon: float) -> dict:
        cache_key = f"forecast:{round(lat, 3)}:{round(lon, 3)}"
        cached = await CacheManager.get(cache_key)
        if cached:
            return cached

        try:
            weather_data = await self.client.get_weather_forecast(lat, lon)
            aqi_data = await self.client.get_air_pollution_forecast(lat, lon)
        except Exception as e:
            logger.error(f"Forecast API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Forecast provider unavailable")

        # Parse Weather (8 points = 24h, since it's 3h interval)
        weather_list = []
        import datetime
        
        for item in weather_data.get("list", [])[:8]:
            dt = datetime.datetime.fromtimestamp(item["dt"])
            hour = dt.hour
            time_str = "12 AM" if hour == 0 else f"{hour} AM" if hour < 12 else "12 PM" if hour == 12 else f"{hour - 12} PM"
            weather_list.append({
                "time": time_str,
                "temp": round(item["main"]["temp"]),
                "weather": item["weather"][0]["main"]
            })

        # Parse AQI (24 points = 24h, since it's 1h interval)
        aqi_list = []
        for item in aqi_data.get("list", [])[:24]:
            dt = datetime.datetime.fromtimestamp(item["dt"])
            hour = dt.hour
            time_str = "12 AM" if hour == 0 else f"{hour} AM" if hour < 12 else "12 PM" if hour == 12 else f"{hour - 12} PM"
            
            # OpenWeather AQI index is 1-5, we'll map it to a realistic 0-500 scale for UI matching
            # 1 = Good (0-50), 2 = Fair (51-100), 3 = Moderate (101-150), 4 = Poor (151-200), 5 = Very Poor (201-300)
            owm_aqi = item["main"]["aqi"]
            simulated_aqi = 25
            if owm_aqi == 1: simulated_aqi = 35
            elif owm_aqi == 2: simulated_aqi = 75
            elif owm_aqi == 3: simulated_aqi = 125
            elif owm_aqi == 4: simulated_aqi = 175
            elif owm_aqi == 5: simulated_aqi = 250

            aqi_list.append({
                "time": time_str,
                "aqi": simulated_aqi
            })

        response_data = {
            "weather": weather_list,
            "aqi": aqi_list
        }

        await CacheManager.set(cache_key, response_data, ttl_seconds=3600)
        return response_data
