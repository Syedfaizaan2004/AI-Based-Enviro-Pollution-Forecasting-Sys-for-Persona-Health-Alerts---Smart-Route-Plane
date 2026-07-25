from app.api_clients.base_client import BaseClient, APIClientError
from app.core.config import settings

class GeoapifyClient(BaseClient):
    def __init__(self):
        super().__init__(base_url="https://api.geoapify.com/v1/")
        self.api_key = settings.GEOAPIFY_API_KEY
        if not self.api_key:
            raise APIClientError("GEOAPIFY_API_KEY is not configured")

    async def geocode(self, address: str) -> dict:
        endpoint = "geocode/search"
        params = {"text": address, "apiKey": self.api_key}
        response = await self.get(endpoint, params=params)
        return response.json()

    async def reverse_geocode(self, lat: float, lng: float) -> dict:
        endpoint = "geocode/reverse"
        params = {"lat": lat, "lon": lng, "apiKey": self.api_key}
        response = await self.get(endpoint, params=params)
        return response.json()

    async def routing_matrix(self, sources: list, targets: list) -> dict:
        # sources and targets should be lists of dicts: [{"location": [lng, lat]}]
        payload = {
            "mode": "drive",
            "sources": sources,
            "targets": targets
        }
        endpoint = f"routematrix?apiKey={self.api_key}"
        response = await self.post(endpoint, json=payload, headers={"Content-Type": "application/json"})
        return response.json()
