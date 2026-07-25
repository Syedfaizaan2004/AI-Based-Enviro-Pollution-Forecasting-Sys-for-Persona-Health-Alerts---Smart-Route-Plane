import asyncio
import logging
from typing import List, Dict, Any
import polyline
from datetime import datetime, timedelta
from fastapi import HTTPException

from app.services.ml_service import MLService
from app.services.maps_service import MapsService
from app.services.exposure_service import ExposureService
from app.services.route_score_service import RouteScoreService
from app.api_clients.geoapify_client import GeoapifyClient
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.schemas.route import RouteWaypointSchema, RouteScoreSchema, RecommendedRoute
from app.models.enums import HealthCondition

logger = logging.getLogger(__name__)

class RouteRankingService:
    def __init__(self, db_session=None):
        self.ml_service = MLService(db_session)
        self.maps_service = MapsService()
        self.geoapify_client = GeoapifyClient()
        self.db_session = db_session
        self.geocode_cache = {}

    def _sample_waypoints(self, decoded_poly: List[tuple], num_samples: int = 10) -> List[tuple]:
        if not decoded_poly:
            return []
        if len(decoded_poly) <= num_samples:
            return decoded_poly
        
        indices = [int(i) for i in range(0, len(decoded_poly), len(decoded_poly) // num_samples)][:num_samples]
        if len(decoded_poly) - 1 not in indices:
            indices[-1] = len(decoded_poly) - 1 # Always include destination
            
        return [decoded_poly[i] for i in indices]
        
    async def _resolve_city(self, lat: float, lng: float) -> str:
        # Avoid duplicate geocoding using a local grid-based or strict coordinate cache
        # For a simple cache, round coordinates to 2 decimal places (approx 1.1km grid)
        cache_key = f"{round(lat, 2)},{round(lng, 2)}"
        if cache_key in self.geocode_cache:
            return self.geocode_cache[cache_key]
            
        try:
            res = await self.geoapify_client.reverse_geocode(lat, lng)
            city = "Unknown"
            if res and res.get("features"):
                properties = res["features"][0].get("properties", {})
                city = properties.get("city", properties.get("town", properties.get("village", properties.get("county", "Unknown"))))
            self.geocode_cache[cache_key] = city
            return city
        except Exception as e:
            logger.warning(f"Geocoding failed for {lat}, {lng}: {str(e)}")
            return "Unknown"

    async def _process_waypoint(self, lat: float, lng: float, time_offset_min: float, travel_dt: datetime, health_condition: HealthCondition, sem: asyncio.Semaphore) -> tuple[RouteWaypointSchema, PredictionResponse, str]:
        async with sem:
            prediction_dt = travel_dt + timedelta(minutes=time_offset_min)
            city = await self._resolve_city(lat, lng)
            req = PredictionRequest(
                latitude=lat,
                longitude=lng,
                prediction_time=prediction_dt,
                city=city,
                health_condition=health_condition
            )
            try:
                prediction = await self.ml_service.predict_aqi(req)
                wp = RouteWaypointSchema(
                    latitude=lat,
                    longitude=lng,
                    predicted_aqi=prediction.predicted_aqi,
                    aqi_category=prediction.aqi_category.value,
                    health_risk=prediction.health_risk_level,
                    travel_time_from_start_min=time_offset_min
                )
                return wp, prediction, city
            except Exception as e:
                logger.error(f"Failed to process waypoint {lat}, {lng}: {str(e)}")
                # Return dummy
                from app.models.enums import AQICategory
                dummy_pred = PredictionResponse(
                    predicted_aqi=100.0,
                    aqi_category=AQICategory.MODERATE,
                    catboost_prediction=100.0,
                    lightgbm_prediction=100.0,
                    xgboost_prediction=100.0,
                    ensemble_prediction=100.0,
                    confidence_score=0.0,
                    prediction_latency_ms=0.0,
                    model_version="1",
                    ensemble_version="1",
                    prediction_timestamp=prediction_dt,
                    prediction_source="system",
                    health_risk_level="Moderate",
                    pm25=0.0, pm10=0.0, temperature=20.0, humidity=50.0, wind_speed=0.0
                )
                wp = RouteWaypointSchema(
                    latitude=lat, longitude=lng, predicted_aqi=100.0,
                    aqi_category="Moderate", health_risk="Moderate", travel_time_from_start_min=time_offset_min
                )
                return wp, dummy_pred, "Unknown"

    async def process_route(self, route: Dict[str, Any], travel_dt: datetime, health_condition: HealthCondition) -> RecommendedRoute:
        distance_km = route.get("distanceMeters", 0) / 1000.0
        duration_str = route.get("duration", "0s")
        duration_min = float(duration_str.replace("s", "")) / 60.0
        poly_str = route.get("polyline", {}).get("encodedPolyline", "")
        
        if not poly_str:
            raise HTTPException(status_code=400, detail="Invalid route polyline")
            
        decoded_poly = polyline.decode(poly_str)
        waypoints_latlng = self._sample_waypoints(decoded_poly, num_samples=5)
        
        sem = asyncio.Semaphore(5)
        tasks = []
        for i, (lat, lng) in enumerate(waypoints_latlng):
            time_offset = (i / max(1, len(waypoints_latlng) - 1)) * duration_min
            tasks.append(self._process_waypoint(lat, lng, time_offset, travel_dt, health_condition, sem))
            
        results = await asyncio.gather(*tasks)
        
        processed_waypoints = []
        predictions = []
        cities = set()
        
        for wp, pred, city in results:
            processed_waypoints.append(wp)
            predictions.append(pred)
            if city != "Unknown":
                cities.add(city)
        
        # Calculate Detailed Metrics
        aqis = [p.predicted_aqi for p in predictions]
        avg_aqi = sum(aqis) / len(aqis) if aqis else 0
        max_aqi = max(aqis) if aqis else 0
        min_aqi = min(aqis) if aqis else 0
        
        avg_pm25 = sum(p.pm25 for p in predictions) / len(predictions) if predictions else 0
        avg_pm10 = sum(p.pm10 for p in predictions) / len(predictions) if predictions else 0
        avg_temp = sum(p.temperature for p in predictions) / len(predictions) if predictions else 0
        avg_hum = sum(p.humidity for p in predictions) / len(predictions) if predictions else 0
        avg_wind = sum(p.wind_speed for p in predictions) / len(predictions) if predictions else 0
        avg_conf = sum(p.confidence_score for p in predictions) / len(predictions) if predictions else 0
        
        cat_dist = {}
        for p in predictions:
            cat = p.aqi_category.value
            cat_dist[cat] = cat_dist.get(cat, 0) + 1
        
        # Scoring using Services
        pollution_score = min(100.0, avg_aqi / 3.0)
        exposure_score = ExposureService.calculate_exposure_score(avg_aqi, duration_min, health_condition)
        time_score = min(100.0, duration_min / 2.0)
        health_score = 50.0 if health_condition else 10.0
        
        smart_score = RouteScoreService.calculate_smart_route_score(pollution_score, exposure_score, time_score, health_score)
        
        scores = RouteScoreSchema(
            pollution_score=pollution_score,
            exposure_score=exposure_score,
            travel_time_score=time_score,
            health_score=health_score,
            smart_route_score=smart_score,
            average_aqi=avg_aqi,
            maximum_aqi=max_aqi,
            minimum_aqi=min_aqi,
            average_pm25=avg_pm25,
            average_pm10=avg_pm10,
            average_temperature=avg_temp,
            average_humidity=avg_hum,
            average_wind_speed=avg_wind,
            prediction_confidence=avg_conf,
            aqi_category_distribution=cat_dist
        )
        
        # Pass unique cities in reason logic or logs if desired
        logger.info(f"Processed route passing through {len(cities)} unique cities: {list(cities)}")
        
        return RecommendedRoute(
            rank=0,
            recommendation_reason="",
            health_recommendation_level="Safe",
            travel_time_min=duration_min,
            distance_km=distance_km,
            scores=scores,
            waypoints=processed_waypoints,
            polyline=poly_str
        )

    async def get_smart_routes(self, source: str, destination: str, travel_dt: datetime, health_condition: HealthCondition) -> tuple[RecommendedRoute, List[RecommendedRoute]]:
        try:
            raw_data = await self.maps_service.client.directions(source, destination, alternatives=True)
            routes = raw_data.get("routes", [])
        except Exception as e:
            logger.error(f"Google Maps API failed for routing: {str(e)}")
            raise HTTPException(status_code=502, detail="Routing provider unavailable")
            
        if not routes:
            raise HTTPException(status_code=404, detail="No routes found")
            
        route_tasks = [self.process_route(r, travel_dt, health_condition) for r in routes]
        processed_routes = await asyncio.gather(*route_tasks)
        
        processed_routes.sort(key=lambda r: r.scores.smart_route_score)
        
        for i, r in enumerate(processed_routes):
            r.rank = i + 1
            if i == 0:
                r.recommendation_reason = "Best balance of AQI exposure and travel time."
                r.health_recommendation_level = "Recommended"
            else:
                r.recommendation_reason = "Alternative route."
                r.health_recommendation_level = "Acceptable"
                
        best_route = processed_routes[0]
        alternatives = processed_routes[1:]
        
        return best_route, alternatives
