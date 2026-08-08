import logging
import polyline
from fastapi import HTTPException
from app.api_clients.maps_client import GoogleMapsClient
from app.api_clients.geoapify_client import GeoapifyClient
from app.schemas.maps import DirectionsResponse, DirectionsRoute, RouteWaypoint, DistanceMatrixResponse
from app.services.cache_service import CacheManager
from app.services.geocoding_service import GeocodingService

logger = logging.getLogger(__name__)

class MapsService:
    def __init__(self):
        self.client = GoogleMapsClient()
        self.geoapify_client = GeoapifyClient()

    async def get_directions(self, origin: str, destination: str) -> DirectionsResponse:
        cache_key = f"directions:{origin}:{destination}"
        cached = await CacheManager.get(cache_key)
        if cached:
            return DirectionsResponse(**cached)

        try:
            data = await self.client.directions(origin, destination, alternatives=True)
        except Exception as e:
            logger.error(f"Google Maps API error: {str(e)}")
            raise HTTPException(status_code=502, detail="Google Maps provider unavailable")
            
        if not data.get("routes"):
            raise HTTPException(status_code=404, detail="No routes found")

        routes = []
        for r in data.get("routes", []):
            enc_poly = r.get("polyline", {}).get("encodedPolyline", "")
            decoded = polyline.decode(enc_poly) if enc_poly else []
            waypoints = [RouteWaypoint(lat=p[0], lng=p[1]) for p in decoded]
            
            distance_m = int(r.get("distanceMeters", 0))
            duration_s = int(r.get("duration", "0s").replace("s", ""))
            
            routes.append(DirectionsRoute(
                distance_text=f"{distance_m / 1000:.1f} km",
                distance_value=distance_m,
                duration_text=f"{duration_s // 60} mins",
                duration_value=duration_s,
                polyline=enc_poly,
                waypoints=waypoints
            ))

        resp = DirectionsResponse(routes=routes)
        await CacheManager.set(cache_key, resp.model_dump(), ttl_seconds=1800)
        return resp

    async def get_distance_matrix(self, origins: str, destinations: str) -> DistanceMatrixResponse:
        try:
            geo_svc = GeocodingService()
            
            def parse_location(loc_str: str):
                parts = loc_str.split(",")
                if len(parts) == 2:
                    try:
                        lat, lng = float(parts[0].strip()), float(parts[1].strip())
                        return lat, lng
                    except ValueError:
                        pass
                return None
                
            orig = origins.split("|")[0]
            dest = destinations.split("|")[0]
            
            orig_coords = parse_location(orig)
            if orig_coords:
                o_lat, o_lng = orig_coords
            else:
                origin_geo = await geo_svc.geocode(orig)
                o_lat, o_lng = origin_geo.location.lat, origin_geo.location.lng
                
            dest_coords = parse_location(dest)
            if dest_coords:
                d_lat, d_lng = dest_coords
            else:
                dest_geo = await geo_svc.geocode(dest)
                d_lat, d_lng = dest_geo.location.lat, dest_geo.location.lng
            
            sources = [{"location": [o_lng, o_lat]}]
            targets = [{"location": [d_lng, d_lat]}]
            
            data = await self.geoapify_client.routing_matrix(sources, targets)
        except Exception as e:
            logger.error(f"Geoapify Distance Matrix API error: {str(e)}")
            raise HTTPException(status_code=502, detail=f"Routing provider unavailable: {str(e)}")
            
        if not data.get("sources_to_targets") or len(data["sources_to_targets"]) == 0 or len(data["sources_to_targets"][0]) == 0:
            raise HTTPException(status_code=404, detail="Route not found")
            
        # The result for 1 source and 1 target is a 1x1 matrix. Distance is at [0][0].
        el = data["sources_to_targets"][0][0]
        
        distance_m = int(el.get("distance", 0))
        duration_s = int(el.get("time", 0))
            
        return DistanceMatrixResponse(
            distance_text=f"{distance_m / 1000:.1f} km",
            distance_value=distance_m,
            duration_text=f"{duration_s // 60} mins",
            duration_value=duration_s
        )
