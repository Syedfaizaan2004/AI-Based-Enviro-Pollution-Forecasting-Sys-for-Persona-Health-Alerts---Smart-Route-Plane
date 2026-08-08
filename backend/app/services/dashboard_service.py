import logging
import uuid
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.dashboard import DashboardRepository, AnalyticsRepository
from app.services.user_statistics_service import UserStatisticsService
from app.schemas.dashboard import (
    DashboardSummaryResponse, 
    DashboardMetadata, 
    DashboardCards,
    ExposureAnalytics,
    PredictionAnalytics,
    RouteAnalytics,
    HealthAnalytics,
    TrendDataPoint,
    ChartDataResponse
)

logger = logging.getLogger(__name__)

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.dash_repo = DashboardRepository(db)
        self.analytics_repo = AnalyticsRepository(db)
        self.stats_service = UserStatisticsService(db)

    async def get_summary(self, user_id: uuid.UUID) -> DashboardSummaryResponse:
        cards_raw = await self.dash_repo.get_dashboard_summary(user_id)
        pred_raw = await self.analytics_repo.get_prediction_analytics(user_id)
        route_raw = await self.analytics_repo.get_route_analytics(user_id)
        health_raw = await self.analytics_repo.get_health_analytics(user_id)
        stats = await self.stats_service.get_statistics(user_id)
        
        cards = DashboardCards(
            current_aqi=cards_raw["avg_predicted_aqi"],
            latest_aqi_category=cards_raw["latest_aqi_category"],
            latest_prediction=cards_raw["avg_predicted_aqi"],
            average_predicted_aqi=cards_raw["avg_predicted_aqi"],
            today_predictions_count=cards_raw["today_predictions"],
            this_week_predictions_count=pred_raw["weekly_predictions"],
            this_month_predictions_count=pred_raw["monthly_predictions"],
            total_routes=cards_raw["total_routes"],
            favorite_routes_count=0,
            average_exposure_score=cards_raw["avg_exposure_score"],
            average_smart_route_score=cards_raw["avg_smart_score"],
            highest_aqi_encountered=cards_raw["highest_aqi"],
            lowest_aqi_encountered=cards_raw["lowest_aqi"]
        )
        
        exposure = ExposureAnalytics(
            daily_exposure=stats.daily_exposure,
            weekly_exposure=stats.weekly_exposure,
            monthly_exposure=stats.monthly_exposure,
            yearly_exposure=stats.yearly_exposure,
            average_exposure_score=stats.average_exposure_score,
            highest_exposure=stats.highest_aqi,
            lowest_exposure=stats.lowest_aqi,
            most_polluted_day=None,
            safest_day=None,
            exposure_trend="Stable"
        )
        
        predictions = PredictionAnalytics(**pred_raw)
        routes = RouteAnalytics(**route_raw)
        health = HealthAnalytics(**health_raw)
        
        meta = DashboardMetadata(
            timestamp=datetime.utcnow(),
            total_records_processed=100 # Mock generic
        )
        
        return DashboardSummaryResponse(
            metadata=meta,
            cards=cards,
            exposure=exposure,
            predictions=predictions,
            routes=routes,
            health=health
        )

    async def get_recent_activity(self, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        return await self.dash_repo.get_recent_activity(user_id)

    async def get_favorite_routes(self, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        return await self.dash_repo.get_favorite_routes(user_id)

class TrendService:
    def __init__(self, db: AsyncSession):
        self.repo = AnalyticsRepository(db)

    async def get_trends(self, user_id: uuid.UUID, start_date: datetime, end_date: datetime) -> List[TrendDataPoint]:
        raw_trends = await self.repo.get_trends(user_id, start_date, end_date)
        
        # Convert date back to datetime
        return [
            TrendDataPoint(
                timestamp=datetime.combine(r["timestamp"], datetime.min.time()),
                average_aqi=r["average_aqi"],
                total_exposure=r["total_exposure"],
                prediction_count=r["prediction_count"],
                travel_distance_km=r["travel_distance_km"],
                travel_time_min=r["travel_time_min"]
            )
            for r in raw_trends
        ]

class ChartService:
    @staticmethod
    def format_line_chart(trends: List[TrendDataPoint]) -> ChartDataResponse:
        labels = [t.timestamp.strftime("%Y-%m-%d") for t in trends]
        aqi_data = [t.average_aqi for t in trends]
        exp_data = [t.total_exposure for t in trends]
        
        return ChartDataResponse(
            chart_type="line",
            labels=labels,
            datasets=[
                {"label": "Average AQI", "data": aqi_data, "borderColor": "red"},
                {"label": "Exposure Dose", "data": exp_data, "borderColor": "purple"}
            ]
        )

    @staticmethod
    def format_bar_chart(trends: List[TrendDataPoint]) -> ChartDataResponse:
        labels = [t.timestamp.strftime("%Y-%m-%d") for t in trends]
        return ChartDataResponse(
            chart_type="bar",
            labels=labels,
            datasets=[
                {"label": "Total Routes", "data": [t.prediction_count for t in trends], "backgroundColor": "blue"}
            ]
        )

    @staticmethod
    def format_pie_chart(analytics: Dict[str, int]) -> ChartDataResponse:
        labels = list(analytics.keys())
        data = list(analytics.values())
        return ChartDataResponse(
            chart_type="pie",
            labels=labels,
            datasets=[
                {"label": "AQI Categories", "data": data, "backgroundColor": ["green", "yellow", "orange", "red", "purple", "maroon"]}
            ]
        )

    @staticmethod
    def format_area_chart(trends: List[TrendDataPoint]) -> ChartDataResponse:
        labels = [t.timestamp.strftime("%Y-%m-%d") for t in trends]
        return ChartDataResponse(
            chart_type="area",
            labels=labels,
            datasets=[
                {"label": "Cumulative Exposure", "data": [t.total_exposure for t in trends], "fill": True, "backgroundColor": "rgba(128,0,128,0.2)"}
            ]
        )
