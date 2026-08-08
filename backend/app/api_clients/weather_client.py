from app.api_clients.base_client import BaseClient, APIClientError
from app.core.config import settings

class OpenWeatherClient(BaseClient):
    def __init__(self):
        super().__init__(base_url="https://api.openweathermap.org/data/2.5/")
        self.api_key = settings.OPENWEATHER_API_KEY
        if not self.api_key:
            raise APIClientError("OPENWEATHER_API_KEY is not configured")

    async def get_current_weather(self, lat: float, lon: float) -> dict:
        endpoint = "weather"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }
        response = await self.get(endpoint, params=params)
        return response.json()

    async def get_air_pollution(self, lat: float, lon: float) -> dict:
        endpoint = "air_pollution"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key
        }
        response = await self.get(endpoint, params=params)
        return response.json()

    async def get_weather_forecast(self, lat: float, lon: float) -> dict:
        endpoint = "forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric"
        }
        response = await self.get(endpoint, params=params)
        return response.json()

    async def get_air_pollution_forecast(self, lat: float, lon: float) -> dict:
        endpoint = "air_pollution/forecast"
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key
        }
        response = await self.get(endpoint, params=params)
        return response.json()

    async def geocode_city(self, city: str) -> dict:
        # Note: using geo/1.0/ which is a different base URL, so we construct it manually
        import httpx
        url = f"http://api.openweathermap.org/geo/1.0/direct"
        params = {
            "q": city,
            "limit": 1,
            "appid": self.api_key
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            if not data:
                return {}
            return data[0]
