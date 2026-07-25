from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import uuid
from app.models.enums import HealthCondition, RecommendationType

class RouteRecommendRequest(BaseModel):
    source: str
    destination: str
    travel_datetime: datetime
    health_condition: Optional[HealthCondition] = None
    # Add other preferences if needed

class RouteWaypointSchema(BaseModel):
    latitude: float
    longitude: float
    predicted_aqi: float
    aqi_category: str
    health_risk: str
    travel_time_from_start_min: float

class RouteScoreSchema(BaseModel):
    pollution_score: float
    exposure_score: float
    travel_time_score: float
    health_score: float
    smart_route_score: float
    average_aqi: float
    maximum_aqi: float
    minimum_aqi: float = 0.0
    average_pm25: float = 0.0
    average_pm10: float = 0.0
    average_temperature: float = 0.0
    average_humidity: float = 0.0
    average_wind_speed: float = 0.0
    prediction_confidence: float = 0.0
    aqi_category_distribution: dict = {}

class RecommendedRoute(BaseModel):
    route_id: Optional[uuid.UUID] = None
    rank: int
    recommendation_reason: str
    health_recommendation_level: str
    travel_time_min: float
    distance_km: float
    scores: RouteScoreSchema
    waypoints: List[RouteWaypointSchema]
    polyline: str

class RouteRecommendResponse(BaseModel):
    best_route: RecommendedRoute
    alternative_routes: List[RecommendedRoute]

class RouteHistoryResponse(BaseModel):
    id: uuid.UUID
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    total_distance_km: float
    estimated_duration_min: float
    created_at: datetime
    scores: Optional[List[RouteScoreSchema]] = None
