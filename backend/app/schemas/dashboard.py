from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid

class DashboardMetadata(BaseModel):
    timestamp: datetime
    response_version: str = "1.0"
    total_records_processed: int

class DashboardCards(BaseModel):
    current_aqi: float
    latest_aqi_category: str
    latest_prediction: float
    average_predicted_aqi: float
    today_predictions_count: int
    this_week_predictions_count: int
    this_month_predictions_count: int
    total_routes: int
    favorite_routes_count: int
    average_exposure_score: float
    average_smart_route_score: float
    highest_aqi_encountered: float
    lowest_aqi_encountered: float

class ExposureAnalytics(BaseModel):
    daily_exposure: float
    weekly_exposure: float
    monthly_exposure: float
    yearly_exposure: float
    average_exposure_score: float
    highest_exposure: float
    lowest_exposure: float
    most_polluted_day: Optional[datetime] = None
    safest_day: Optional[datetime] = None
    exposure_trend: str

class PredictionAnalytics(BaseModel):
    daily_predictions: int
    weekly_predictions: int
    monthly_predictions: int
    prediction_accuracy: float
    prediction_distribution: Dict[str, int]
    aqi_category_distribution: Dict[str, int]
    average_prediction_latency_ms: float

class RouteAnalytics(BaseModel):
    total_routes: int
    average_travel_time_min: float
    average_distance_km: float
    average_smart_route_score: float
    average_aqi: float
    average_exposure_score: float
    preferred_travel_preference: str
    most_frequently_used_route_id: Optional[uuid.UUID] = None
    safest_route_id: Optional[uuid.UUID] = None

class HealthAnalytics(BaseModel):
    current_health_profile: str
    configured_aqi_threshold: float
    health_risk_distribution: Dict[str, int]
    high_risk_predictions: int
    critical_exposure_count: int

class TrendDataPoint(BaseModel):
    timestamp: datetime
    average_aqi: float
    total_exposure: float
    prediction_count: int
    travel_distance_km: float
    travel_time_min: float

class ChartDataResponse(BaseModel):
    chart_type: str
    labels: List[str]
    datasets: List[Dict[str, Any]]

class FavoriteRouteResponse(BaseModel):
    id: uuid.UUID
    name: str
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    start_address: Optional[str] = None
    end_address: Optional[str] = None

class DashboardSummaryResponse(BaseModel):
    metadata: DashboardMetadata
    cards: Optional[DashboardCards] = None
    exposure: Optional[ExposureAnalytics] = None
    predictions: Optional[PredictionAnalytics] = None
    routes: Optional[RouteAnalytics] = None
    health: Optional[HealthAnalytics] = None

class RecentActivityResponse(BaseModel):
    metadata: DashboardMetadata
    activities: List[Dict[str, Any]]
