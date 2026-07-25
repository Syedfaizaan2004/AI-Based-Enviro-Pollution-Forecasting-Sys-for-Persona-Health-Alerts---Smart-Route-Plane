from pydantic import BaseModel
from typing import Dict, Any, Optional

class AQILiveResponse(BaseModel):
    aqi: int
    city: str
    dominant_pollutant: Optional[str]
    pollutants: Dict[str, Any]
    category: str
    timestamp: str
