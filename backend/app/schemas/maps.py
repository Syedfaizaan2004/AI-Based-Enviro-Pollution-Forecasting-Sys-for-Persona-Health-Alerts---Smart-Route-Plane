from pydantic import BaseModel
from typing import List, Optional

class Coordinates(BaseModel):
    lat: float
    lng: float

class GeocodeResponse(BaseModel):
    address: str
    location: Coordinates

class ReverseGeocodeResponse(BaseModel):
    address: str

class AutocompleteSuggestion(BaseModel):
    formatted: str
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None

class AutocompleteResponse(BaseModel):
    suggestions: List[AutocompleteSuggestion]

class RouteWaypoint(BaseModel):
    lat: float
    lng: float

class DirectionsRoute(BaseModel):
    distance_text: str
    distance_value: int
    duration_text: str
    duration_value: int
    polyline: str
    waypoints: List[RouteWaypoint]

class DirectionsResponse(BaseModel):
    routes: List[DirectionsRoute]

class DistanceMatrixResponse(BaseModel):
    distance_text: str
    distance_value: int
    duration_text: str
    duration_value: int
