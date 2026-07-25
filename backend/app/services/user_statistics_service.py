import logging
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.exposure import ExposureHistory
from app.models.route import RouteHistory, RouteScore
from app.schemas.history import ExposureStatistics

logger = logging.getLogger(__name__)

class UserStatisticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_statistics(self, user_id: uuid.UUID) -> ExposureStatistics:
        # Get Exposure aggregations
        stmt_exposure = select(
            func.sum(ExposureHistory.cumulative_pm25).label("total_pm25"),
            func.avg(ExposureHistory.daily_avg_aqi).label("avg_aqi"),
            func.max(ExposureHistory.peak_aqi).label("max_aqi"),
            func.min(ExposureHistory.daily_avg_aqi).label("min_aqi"),
        ).where(ExposureHistory.user_id == user_id)
        
        res_exp = await self.db.execute(stmt_exposure)
        exp_row = res_exp.fetchone()
        
        # Calculate daily, weekly, monthly based on dates (using basic approximations for total sum)
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        year_ago = now - timedelta(days=365)
        
        # Helper to get sum for a period
        async def get_period_sum(start_dt):
            stmt = select(func.sum(ExposureHistory.cumulative_pm25)).where(
                ExposureHistory.user_id == user_id,
                ExposureHistory.created_at >= start_dt
            )
            return await self.db.scalar(stmt) or 0.0

        weekly_exp = await get_period_sum(week_ago)
        monthly_exp = await get_period_sum(month_ago)
        yearly_exp = await get_period_sum(year_ago)
        # Daily average approximation
        daily_exp = weekly_exp / 7.0 if weekly_exp > 0 else 0.0
        
        # Get Route aggregations
        stmt_route = select(
            func.avg(RouteHistory.estimated_duration_min).label("avg_time"),
            func.avg(RouteScore.composite_score).label("avg_smart_score"),
            func.avg(RouteScore.health_risk_score).label("avg_exposure_score") 
        ).select_from(RouteHistory).join(RouteScore).where(RouteHistory.user_id == user_id)
        
        res_route = await self.db.execute(stmt_route)
        route_row = res_route.fetchone()

        # Get safest and most polluted route
        stmt_extremes = select(RouteHistory.id, RouteScore.composite_score).select_from(RouteHistory).join(RouteScore).where(RouteHistory.user_id == user_id)
        res_extremes = await self.db.execute(stmt_extremes)
        extremes = res_extremes.all()
        
        most_polluted_id = None
        safest_id = None
        if extremes:
            # lower score is safer
            safest = min(extremes, key=lambda x: x.composite_score)
            most_polluted = max(extremes, key=lambda x: x.composite_score)
            safest_id = safest.id
            most_polluted_id = most_polluted.id

        return ExposureStatistics(
            daily_exposure=round(daily_exp, 2),
            weekly_exposure=round(weekly_exp, 2),
            monthly_exposure=round(monthly_exp, 2),
            yearly_exposure=round(yearly_exp, 2),
            average_aqi=round(exp_row.avg_aqi or 0.0, 2),
            highest_aqi=round(exp_row.max_aqi or 0.0, 2),
            lowest_aqi=round(exp_row.min_aqi or 0.0, 2),
            average_travel_time=round(route_row.avg_time or 0.0, 2),
            average_exposure_score=round(route_row.avg_exposure_score or 0.0, 2),
            average_smart_route_score=round(route_row.avg_smart_score or 0.0, 2),
            most_polluted_route_id=most_polluted_id,
            safest_route_id=safest_id
        )
