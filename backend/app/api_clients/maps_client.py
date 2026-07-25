from app.api_clients.base_client import BaseClient, APIClientError
from app.core.config import settings

class GoogleMapsClient(BaseClient):
    def __init__(self):
        super().__init__(base_url="https://maps.googleapis.com/maps/api/")
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        if not self.api_key:
            raise APIClientError("GOOGLE_MAPS_API_KEY is not configured")

    async def geocode(self, address: str) -> dict:
        endpoint = "geocode/json"
        params = {"address": address, "key": self.api_key}
        response = await self.get(endpoint, params=params)
        return response.json()

    async def reverse_geocode(self, lat: float, lng: float) -> dict:
        endpoint = "geocode/json"
        params = {"latlng": f"{lat},{lng}", "key": self.api_key}
        response = await self.get(endpoint, params=params)
        return response.json()

    async def directions(self, origin: str, destination: str, alternatives: bool = True) -> dict:
        endpoint = "https://routes.googleapis.com/directions/v2:computeRoutes"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.routeLabels"
        }
        payload = {
            "origin": {
                "address": origin
            },
            "destination": {
                "address": destination
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "computeAlternativeRoutes": alternatives
        }
        response = await self.post(endpoint, json=payload, headers=headers)
        return response.json()

    async def distance_matrix(self, origins: str, destinations: str) -> dict | list:
        endpoint = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "originIndex,destinationIndex,duration,distanceMeters,status"
        }
        origins_list = origins.split("|")
        destinations_list = destinations.split("|")
        payload = {
            "origins": [{"waypoint": {"address": o}} for o in origins_list],
            "destinations": [{"waypoint": {"address": d}} for d in destinations_list],
            "travelMode": "DRIVE"
        }
        response = await self.post(endpoint, json=payload, headers=headers)
        return response.json()
