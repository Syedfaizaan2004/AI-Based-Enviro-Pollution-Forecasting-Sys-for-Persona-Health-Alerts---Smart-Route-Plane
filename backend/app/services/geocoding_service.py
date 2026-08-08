import logging
from fastapi import HTTPException
from app.api_clients.geoapify_client import GeoapifyClient
from app.schemas.maps import GeocodeResponse, ReverseGeocodeResponse, AutocompleteResponse, AutocompleteSuggestion
from app.services.cache_service import CacheManager

logger = logging.getLogger(__name__)

class GeocodingService:
    def __init__(self):
        self.client = GeoapifyClient()

    async def geocode(self, address: str) -> GeocodeResponse:
        cache_key = f"geocode:{address.lower()}"
        cached = await CacheManager.get(cache_key)
        if cached:
            return GeocodeResponse(**cached)

        try:
            data = await self.client.geocode(address)
        except Exception as e:
            logger.error(f"Geocoding API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Geocoding provider unavailable")

        if not data.get("features"):
            raise HTTPException(status_code=404, detail="Address not found")

        feature = data["features"][0]
        lng, lat = feature["geometry"]["coordinates"]
        formatted = feature["properties"].get("formatted", address)
        
        resp = GeocodeResponse(address=formatted, location={"lat": lat, "lng": lng})

        await CacheManager.set(cache_key, resp.model_dump(), ttl_seconds=86400)
        return resp

    async def autocomplete(self, text: str) -> AutocompleteResponse:
        cache_key = f"autocomplete:{text.lower()}"
        cached = await CacheManager.get(cache_key)
        if cached:
            return AutocompleteResponse(**cached)

        try:
            data = await self.client.autocomplete(text)
        except Exception as e:
            logger.error(f"Autocomplete API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Autocomplete provider unavailable")

        suggestions = []
        for feature in data.get("features", []):
            props = feature.get("properties", {})
            suggestions.append(
                AutocompleteSuggestion(
                    formatted=props.get("formatted", ""),
                    city=props.get("city"),
                    state=props.get("state"),
                    country=props.get("country")
                )
            )

        resp = AutocompleteResponse(suggestions=suggestions)
        await CacheManager.set(cache_key, resp.model_dump(), ttl_seconds=3600)
        return resp

    async def reverse_geocode(self, lat: float, lng: float) -> ReverseGeocodeResponse:
        cache_key = f"rgeocode:{round(lat, 4)}:{round(lng, 4)}"
        cached = await CacheManager.get(cache_key)
        if cached:
            return ReverseGeocodeResponse(**cached)

        try:
            data = await self.client.reverse_geocode(lat, lng)
        except Exception as e:
            logger.error(f"Geocoding API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Geocoding provider unavailable")
            
        if not data.get("features"):
            raise HTTPException(status_code=404, detail="Location not found")

        feature = data["features"][0]
        formatted = feature["properties"].get("formatted", "Unknown Location")
        resp = ReverseGeocodeResponse(address=formatted)

        await CacheManager.set(cache_key, resp.model_dump(), ttl_seconds=86400)
        return resp
