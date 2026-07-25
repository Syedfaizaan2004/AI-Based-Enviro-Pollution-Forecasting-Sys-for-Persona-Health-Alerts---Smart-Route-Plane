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
