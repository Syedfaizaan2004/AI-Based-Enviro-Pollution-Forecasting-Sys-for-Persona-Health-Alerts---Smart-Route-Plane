import uuid
from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, cast, Date, desc
from app.models.user import User
from app.models.prediction import PredictionHistory
from app.models.route import RouteHistory
from app.models.notification import Notification
from app.models.api_log import ApiLog
from app.models.exposure import ExposureHistory
from app.models.health_profile import HealthProfile
from app.models.health_advisory import HealthAdvisoryTemplate
from app.services.health_service import HealthService
from app.schemas.admin import AdminSystemStatus, AdminHealthAdvisoryTemplateUpdate

class AdminService:
    @staticmethod
    async def get_users_paginated(db: AsyncSession, skip: int = 0, limit: int = 100) -> Tuple[int, List[User]]:
        count_query = select(func.count(User.id))
        total = await db.scalar(count_query)
        
        users_query = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
        users = (await db.scalars(users_query)).all()
        
        return total, users

    @staticmethod
    async def toggle_user_activation(db: AsyncSession, user_id: uuid.UUID, is_active: bool) -> bool:
        stmt = update(User).where(User.id == user_id).values(is_active=is_active)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0
        
    @staticmethod
    async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> bool:
        stmt = update(User).where(User.id == user_id).values(is_deleted=True, is_active=False)
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def get_system_status(db: AsyncSession) -> AdminSystemStatus:
        total_users = await db.scalar(select(func.count(User.id)))
        active_users = await db.scalar(select(func.count(User.id)).where(User.is_active == True))
        total_preds = await db.scalar(select(func.count(PredictionHistory.id)))
        total_routes = await db.scalar(select(func.count(RouteHistory.id)))
        total_notifs = await db.scalar(select(func.count(Notification.id)))
        
        health = await HealthService.get_system_health()
        
        return AdminSystemStatus(
            total_users=total_users,
            active_users=active_users,
            total_predictions=total_preds,
            total_routes=total_routes,
            total_notifications=total_notifs,
            database_status=health["components"]["database"]["status"],
            redis_status=health["components"]["redis"]["status"]
        )

    @staticmethod
    async def get_analytics(db: AsyncSession):
        # Daily Usage (Predictions & Routes) over last 7 days
        # Just getting general counts grouped by date
        pred_stmt = select(
            cast(PredictionHistory.created_at, Date).label("date"),
            func.count(PredictionHistory.id).label("count")
        ).group_by("date").order_by(desc("date")).limit(7)
        
        pred_res = await db.execute(pred_stmt)
        preds_by_date = {str(r.date): r.count for r in pred_res.all()}
        
        route_stmt = select(
            cast(RouteHistory.created_at, Date).label("date"),
            func.count(RouteHistory.id).label("count")
        ).group_by("date").order_by(desc("date")).limit(7)
        
        route_res = await db.execute(route_stmt)
        routes_by_date = {str(r.date): r.count for r in route_res.all()}
        
        # Merge dates
        all_dates = sorted(list(set(preds_by_date.keys()) | set(routes_by_date.keys())))
        
        daily_usage = [
            {
                "date": d, 
                "predictions": preds_by_date.get(d, 0),
                "routes": routes_by_date.get(d, 0)
            }
            for d in all_dates
        ]
        
        # Top Cities
        city_stmt = select(
            PredictionHistory.city,
            func.count(PredictionHistory.id).label("count")
        ).group_by(PredictionHistory.city).order_by(desc("count")).limit(5)
        
        city_res = await db.execute(city_stmt)
        top_cities = [
            {"city_name": r.city, "count": r.count}
            for r in city_res.all()
        ]
        
        return {
            "daily_usage": daily_usage,
            "top_cities": top_cities
        }

    @staticmethod
    async def get_api_logs(db: AsyncSession, skip: int = 0, limit: int = 100):
        count_query = select(func.count(ApiLog.id))
        total = await db.scalar(count_query)
        
        logs_query = select(ApiLog).offset(skip).limit(limit).order_by(desc(ApiLog.created_at))
        logs = (await db.scalars(logs_query)).all()
        return total, logs

    @staticmethod
    async def get_notification_logs(db: AsyncSession, skip: int = 0, limit: int = 100):
        # Join with User to get email
        count_query = select(func.count(Notification.id))
        total = await db.scalar(count_query)
        
        # Need to return both notification and user email
        logs_query = (
            select(Notification, User.email)
            .join(User, Notification.user_id == User.id)
            .order_by(desc(Notification.created_at))
            .offset(skip)
            .limit(limit)
        )
        
        result = await db.execute(logs_query)
        # Returns tuple of (Notification, email)
        logs = result.all()
        
        return total, logs

    @staticmethod
    async def get_user_details(db: AsyncSession, user_id: uuid.UUID):
        user = await db.scalar(select(User).where(User.id == user_id))
        if not user:
            return None
            
        health_profile = await db.scalar(select(HealthProfile).where(HealthProfile.user_id == user_id))
        
        exposures_query = select(ExposureHistory).where(ExposureHistory.user_id == user_id).order_by(desc(ExposureHistory.created_at)).limit(5)
        exposures = (await db.scalars(exposures_query)).all()
        
        routes_query = select(RouteHistory).where(RouteHistory.user_id == user_id).order_by(desc(RouteHistory.created_at)).limit(5)
        routes = (await db.scalars(routes_query)).all()
        
        return {
            "user": user,
            "health_profile": health_profile,
            "recent_exposures": exposures,
            "recent_routes": routes
        }

    @staticmethod
    async def get_health_advisory_templates(db: AsyncSession):
        query = select(HealthAdvisoryTemplate).order_by(HealthAdvisoryTemplate.min_aqi)
        result = await db.scalars(query)
        return result.all()

    @staticmethod
    async def update_health_advisory_template(db: AsyncSession, template_id: uuid.UUID, data: AdminHealthAdvisoryTemplateUpdate):
        template = await db.scalar(select(HealthAdvisoryTemplate).where(HealthAdvisoryTemplate.id == template_id))
        if not template:
            return None
            
        if data.general_advice is not None:
            template.general_advice = data.general_advice
        if data.sensitive_group_advice is not None:
            template.sensitive_group_advice = data.sensitive_group_advice
            
        await db.commit()
        await db.refresh(template)
        return template
