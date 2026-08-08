from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional
from app.models.enums import AQICategory, HealthCondition

class PredictionRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    prediction_time: datetime
    city: Optional[str] = None
    health_condition: Optional[HealthCondition] = None
    skip_history: bool = False
    user_id: Optional[str] = None

class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    predicted_aqi: float
    aqi_category: AQICategory
    catboost_prediction: float
    lightgbm_prediction: float
    xgboost_prediction: float
    ensemble_prediction: float
    confidence_score: float
    prediction_latency_ms: float
    model_version: str
    ensemble_version: str
    prediction_timestamp: datetime
    prediction_source: str
    health_risk_level: str
    pm25: float = 0.0
    pm10: float = 0.0
    no2: float = 0.0
    so2: float = 0.0
    o3: float = 0.0
    co: float = 0.0
    temperature: float = 0.0
    humidity: float = 0.0
    wind_speed: float = 0.0
