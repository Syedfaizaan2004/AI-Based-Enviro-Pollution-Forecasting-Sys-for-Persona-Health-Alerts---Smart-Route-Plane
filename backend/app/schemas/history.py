from pydantic import BaseModel
from typing import List, Generic, TypeVar, Optional
from datetime import datetime
import uuid

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total_count: int
    page_size: int
    current_page: int

class ExposureHistoryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    daily_avg_aqi: float
    peak_aqi: float
    total_duration_outdoors_min: float
    cumulative_pm25: float
    created_at: datetime
    
class ExposureStatistics(BaseModel):
    daily_exposure: float
    weekly_exposure: float
    monthly_exposure: float
    yearly_exposure: float
    average_aqi: float
    highest_aqi: float
    lowest_aqi: float
    average_travel_time: float
    average_exposure_score: float
    average_smart_route_score: float
    most_polluted_route_id: Optional[uuid.UUID] = None
    safest_route_id: Optional[uuid.UUID] = None

class PredictionHistoryResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    aqi_value: float
    aqi_category: str
    pm25: float
    pm10: float
    temperature: float
    humidity: float
    prediction_timestamp: datetime
    prediction_source: str
