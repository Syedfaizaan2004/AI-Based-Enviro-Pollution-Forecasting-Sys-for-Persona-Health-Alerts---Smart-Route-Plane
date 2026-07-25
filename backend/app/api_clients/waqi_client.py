from app.api_clients.base_client import BaseClient, APIClientError
from app.core.config import settings

class WAQIClient(BaseClient):
    def __init__(self):
        super().__init__(base_url="https://api.waqi.info/")
        self.token = settings.WAQI_API_KEY
        if not self.token:
            raise APIClientError("WAQI_API_KEY is not configured")

    async def get_city_feed(self, city: str) -> dict:
        endpoint = f"feed/{city}/"
        params = {"token": self.token}
        response = await self.get(endpoint, params=params)
        return response.json()
        
    async def get_geo_feed(self, lat: float, lng: float) -> dict:
        endpoint = f"feed/geo:{lat};{lng}/"
        params = {"token": self.token}
        response = await self.get(endpoint, params=params)
        return response.json()
