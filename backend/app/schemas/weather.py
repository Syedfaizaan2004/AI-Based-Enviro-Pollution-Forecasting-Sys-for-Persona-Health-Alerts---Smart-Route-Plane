from pydantic import BaseModel
from typing import Optional

class WeatherResponse(BaseModel):
    temperature: float
    humidity: int
    wind_speed: float
    pressure: int
    visibility: Optional[int]
    cloud_coverage: int
    rainfall: Optional[float] = None
    description: str
    location_name: Optional[str] = None

class WeatherForecastPoint(BaseModel):
    time: str
    temp: int
    weather: str

class AQIForecastPoint(BaseModel):
    time: str
    aqi: int

class DailyForecastResponse(BaseModel):
    weather: list[WeatherForecastPoint]
    aqi: list[AQIForecastPoint]
