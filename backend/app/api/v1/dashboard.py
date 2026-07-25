import logging
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.schemas.dashboard import (DashboardSummaryResponse, DashboardCards, ExposureAnalytics, PredictionAnalytics, RouteAnalytics, HealthAnalytics, TrendDataPoint, ChartDataResponse, FavoriteRouteResponse)
from app.services.dashboard_service import DashboardService, TrendService, ChartService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    return await service.get_summary(current_user.id)

@router.get("/cards", response_model=DashboardCards)
async def get_dashboard_cards(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    summary = await service.get_summary(current_user.id)
    return summary.cards

@router.get("/predictions", response_model=PredictionAnalytics)
async def get_dashboard_predictions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    summary = await service.get_summary(current_user.id)
    return summary.predictions

@router.get("/routes", response_model=RouteAnalytics)
async def get_dashboard_routes(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    summary = await service.get_summary(current_user.id)
    return summary.routes

@router.get("/exposure", response_model=ExposureAnalytics)
async def get_dashboard_exposure(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    summary = await service.get_summary(current_user.id)
    return summary.exposure

@router.get("/health", response_model=HealthAnalytics)
async def get_dashboard_health(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    summary = await service.get_summary(current_user.id)
    return summary.health

@router.get("/recent-activity")
async def get_recent_activity(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    return await service.get_recent_activity(current_user.id)

@router.get("/favorites", response_model=List[FavoriteRouteResponse])
async def get_favorite_routes(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DashboardService(db)
    return await service.get_favorite_routes(current_user.id)

@router.get("/trends", response_model=List[TrendDataPoint])
async def get_trends(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
        
    service = TrendService(db)
    return await service.get_trends(current_user.id, start_date, end_date)

@router.get("/charts", response_model=ChartDataResponse)
async def get_charts(
    chart_type: str = Query("line", description="line, bar, pie, area"),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    city: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
        
    trend_service = TrendService(db)
    trends = await trend_service.get_trends(current_user.id, start_date, end_date)
    
    if chart_type == "bar":
        return ChartService.format_bar_chart(trends)
    elif chart_type == "area":
        return ChartService.format_area_chart(trends)
    elif chart_type == "pie":
        # Pie needs distribution data, not time-series trends
        dashboard_service = DashboardService(db)
        summary = await dashboard_service.get_summary(current_user.id)
        return ChartService.format_pie_chart(summary.predictions.aqi_category_distribution)
    
    return ChartService.format_line_chart(trends)
