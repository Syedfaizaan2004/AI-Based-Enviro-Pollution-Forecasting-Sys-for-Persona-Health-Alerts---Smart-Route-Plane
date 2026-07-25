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
