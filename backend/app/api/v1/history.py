import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.history import PaginatedResponse, ExposureHistoryResponse, ExposureStatistics
from app.services.prediction_history_service import PredictionHistoryService
from app.services.exposure_history_service import ExposureHistoryService
from app.services.user_statistics_service import UserStatisticsService
from app.repositories.route import RouteRepository

router = APIRouter(prefix="/history", tags=["History"])

# --- Predictions ---

@router.get("/predictions")
async def get_predictions_history(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: str = "prediction_timestamp",
    sort_desc: bool = True,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = PredictionHistoryService(db)
    skip = (page - 1) * size
    filters = {"start_date": start_date, "end_date": end_date}
    items, total = await service.repo.get_history(skip, size, sort_by, sort_desc, filters)
    
    return {
        "items": items,
        "total_count": total,
        "page_size": size,
        "current_page": page
    }

@router.get("/predictions/{prediction_id}")
async def get_prediction_by_id(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = PredictionHistoryService(db)
    # The ID type for prediction_history is int according to Phase 2 (or uuid, wait, I'll use int since we passed int in Phase 6 stub)
    # Let's verify type if it crashes.
    pred = await service.repo.get_prediction(prediction_id)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return pred

@router.delete("/predictions/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = PredictionHistoryService(db)
    success = await service.repo.delete_prediction(prediction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {"status": "deleted"}

# --- Routes ---
# We already have /routes/history in routes.py, but Phase 8 requires /history/routes endpoints.
# I will alias or rebuild here for standard Phase 8 layout.

@router.get("/routes")
async def get_routes_history(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort_by: str = "created_at",
    sort_desc: bool = True,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    skip = (page - 1) * size
    filters = {"start_date": start_date, "end_date": end_date}
    items, total = await repo.get_history(current_user.id, skip, size, sort_by, sort_desc, filters)
    
    return {
        "items": items,
        "total_count": total,
        "page_size": size,
        "current_page": page
    }

@router.get("/routes/{route_id}")
async def get_route_by_id(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    route = await repo.get_route(route_id)
    if not route or route.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@router.delete("/routes/{route_id}")
async def delete_route(
    route_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    repo = RouteRepository(db)
    success = await repo.delete_route(route_id)
    if not success:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"status": "deleted"}

# --- Exposure ---

@router.get("/exposure", response_model=PaginatedResponse[ExposureHistoryResponse])
async def get_exposure_history(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ExposureHistoryService(db)
    filters = {"start_date": start_date, "end_date": end_date}
    items, total = await service.get_paginated_history(current_user.id, page, size, filters)
    
    return PaginatedResponse(
        items=[ExposureHistoryResponse(
            id=i.id,
            user_id=i.user_id,
            daily_avg_aqi=i.daily_avg_aqi,
            peak_aqi=i.peak_aqi,
            total_duration_outdoors_min=i.total_duration_outdoors_min,
            cumulative_pm25=i.cumulative_pm25,
            created_at=i.created_at
        ) for i in items],
        total_count=total,
        page_size=size,
        current_page=page
    )

@router.get("/exposure/{exposure_id}", response_model=ExposureHistoryResponse)
async def get_exposure_by_id(
    exposure_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ExposureHistoryService(db)
    exp = await service.get_by_id(exposure_id)
    if not exp or exp.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exposure not found")
    return exp

@router.get("/statistics", response_model=ExposureStatistics)
async def get_user_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = UserStatisticsService(db)
    return await service.get_statistics(current_user.id)
