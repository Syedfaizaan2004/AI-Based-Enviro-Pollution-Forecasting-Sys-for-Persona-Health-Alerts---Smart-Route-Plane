from pydantic import BaseModel
from typing import Dict, Any, Optional

class AQILiveResponse(BaseModel):
    aqi: int
    city: str
    station_lat: Optional[float] = None
    station_lon: Optional[float] = None
    dominant_pollutant: Optional[str]
    pollutants: Dict[str, Any]
    category: str
    timestamp: str
