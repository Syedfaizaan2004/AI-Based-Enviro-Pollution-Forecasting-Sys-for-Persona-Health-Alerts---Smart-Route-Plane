from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.schemas.maps import GeocodeResponse, ReverseGeocodeResponse, DirectionsResponse, DistanceMatrixResponse
from app.services.maps_service import MapsService
from app.services.geocoding_service import GeocodingService

router = APIRouter(prefix="/maps", tags=["Maps"])

class GeocodeRequest(BaseModel):
    address: str

class ReverseGeocodeRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class DirectionsRequest(BaseModel):
    source: str
    destination: str

class DistanceMatrixRequest(BaseModel):
    origins: str
    destinations: str

@router.post("/geocode", response_model=GeocodeResponse)
async def geocode(req: GeocodeRequest):
    return await GeocodingService().geocode(req.address)

@router.post("/reverse-geocode", response_model=ReverseGeocodeResponse)
async def reverse_geocode(req: ReverseGeocodeRequest):
    return await GeocodingService().reverse_geocode(req.latitude, req.longitude)

@router.post("/directions", response_model=DirectionsResponse)
async def directions(req: DirectionsRequest):
    return await MapsService().get_directions(req.source, req.destination)

@router.post("/distance-matrix", response_model=DistanceMatrixResponse)
async def distance_matrix(req: DistanceMatrixRequest):
    return await MapsService().get_distance_matrix(req.origins, req.destinations)
