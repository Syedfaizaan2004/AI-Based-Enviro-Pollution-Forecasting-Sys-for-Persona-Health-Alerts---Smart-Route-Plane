import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.route import RouteRecommendRequest, RouteRecommendResponse, RouteHistoryResponse, RouteScoreSchema, RecommendedRoute, RouteWaypointSchema
from app.services.route_ranking_service import RouteRankingService
from app.services.exposure_history_service import ExposureHistoryService
from app.repositories.route import RouteRepository

def _map_route_to_response(r) -> RouteHistoryResponse:
    scores = []
    for s in r.scores:
        scores.append(RouteScoreSchema(
            pollution_score=s.pollution_score if hasattr(s, "pollution_score") else 0,
            exposure_score=s.exposure_score if hasattr(s, "exposure_score") else 0,
            travel_time_score=s.time_penalty_score,
            health_score=s.health_risk_score,
            smart_route_score=s.composite_score,
            average_aqi=s.avg_aqi,
            maximum_aqi=s.max_aqi,
            minimum_aqi=getattr(s, "min_aqi", 0.0),
            average_pm25=getattr(s, "avg_pm25", 0.0),
            average_pm10=getattr(s, "avg_pm10", 0.0),
            average_temperature=getattr(s, "avg_temp", 0.0),
            average_humidity=getattr(s, "avg_humidity", 0.0),
            average_wind_speed=getattr(s, "avg_wind_speed", 0.0),
            prediction_confidence=getattr(s, "prediction_confidence", 0.0),
            aqi_category_distribution=getattr(s, "aqi_category_distribution", {})
        ))
    
    waypoints = []
    for w in r.waypoints:
        waypoints.append(RouteWaypointSchema(
            latitude=w.latitude,
            longitude=w.longitude,
            predicted_aqi=w.predicted_aqi if w.predicted_aqi is not None else 0.0,
            aqi_category=w.aqi_category if w.aqi_category is not None else "Unknown",
            health_risk="Unknown",
            travel_time_from_start_min=0.0,
            city_name=w.city_name,
            temperature=w.temperature,
            pm25=w.pm25
        ))

    return RouteHistoryResponse(
        id=r.id,
        start_lat=r.start_lat,
        start_lng=r.start_lng,
        start_address=r.start_address,
        end_lat=r.end_lat,
        end_lng=r.end_lng,
        end_address=r.end_address,
        total_distance_km=r.total_distance_km,
        estimated_duration_min=r.estimated_duration_min,
        created_at=r.created_at,
        scores=scores,
        waypoints=waypoints
    )

router = APIRouter(prefix="/routes", tags=["Smart Routes"])

@router.post("/recommend", response_model=RouteRecommendResponse)
async def recommend_route(
    request: RouteRecommendRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = RouteRankingService(db)
    route_repo = RouteRepository(db)
    best_route, alternatives = await service.get_smart_routes(
        source=request.source,
        destination=request.destination,
        travel_dt=request.travel_datetime,
        health_condition=request.health_condition,
        user_id=current_user.id if current_user else None
    )
    return RouteRecommendResponse(
        best_route=best_route,
        alternative_routes=alternatives
    )

@router.post("/select", response_model=RecommendedRoute)
async def select_route(
    route_data: RecommendedRoute,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    route_repo = RouteRepository(db)
    route_record = await route_repo.save_route_history(user_id=current_user.id, route_data=route_data)
    
    # Assign the generated ID back to the Pydantic model so it's returned to the frontend
    route_data.route_id = route_record.id
    
    # Also log to exposure_history table
    exposure_service = ExposureHistoryService(db)
    await exposure_service.log_exposure(
        user_id=current_user.id,
        daily_avg_aqi=route_data.scores.average_aqi,
        peak_aqi=route_data.scores.maximum_aqi,
        duration_min=route_data.travel_time_min,
        pm25=route_data.scores.average_pm25 * (route_data.travel_time_min / 60.0) # Approx dose
    )
    
    return route_data

@router.get("/history", response_model=List[RouteHistoryResponse])
async def get_route_history(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    routes = await repo.get_user_routes(user_id=current_user.id)
    
    responses = [_map_route_to_response(r) for r in routes]
    return responses

@router.get("/history/{route_id}", response_model=RouteHistoryResponse)
async def get_route_details(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    route = await repo.get_route(route_id)
    if not route or route.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Route not found")
        
    return _map_route_to_response(route)

@router.get("/history/{route_id}/scores", response_model=List[RouteScoreSchema])
async def get_route_scores(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    route = await repo.get_route(route_id)
    if not route or route.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Route not found")
        
    response = _map_route_to_response(route)
    return response.scores

@router.delete("/history")
async def clear_route_history(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    success = await repo.delete_all_user_routes(user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear history")
    return {"message": "Route history cleared successfully"}
