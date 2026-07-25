import logging
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.models.route import RouteHistory, RouteScore, RouteWaypoint

logger = logging.getLogger(__name__)

class RouteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_route(self, route: RouteHistory) -> RouteHistory:
        try:
            self.db.add(route)
            await self.db.commit()
            await self.db.refresh(route)
            return route
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save route: {str(e)}")
            raise e

    async def save_route_history(self, user_id: uuid.UUID, route_data: "RecommendedRoute") -> RouteHistory:
        from app.models.enums import RouteStatus, RecommendationType
        
        # Determine recommendation type
        rec_type = RecommendationType.BALANCED if route_data.rank == 1 else RecommendationType.SAFEST
        
        # Create route history
        route_history = RouteHistory(
            user_id=user_id,
            start_lat=route_data.waypoints[0].latitude if route_data.waypoints else 0.0,
            start_lng=route_data.waypoints[0].longitude if route_data.waypoints else 0.0,
            end_lat=route_data.waypoints[-1].latitude if route_data.waypoints else 0.0,
            end_lng=route_data.waypoints[-1].longitude if route_data.waypoints else 0.0,
            total_distance_km=route_data.distance_km,
            estimated_duration_min=route_data.travel_time_min,
            status=RouteStatus.COMPLETED
        )
        
        # Create score
        score = RouteScore(
            avg_aqi=route_data.scores.average_aqi,
            max_aqi=route_data.scores.maximum_aqi,
            min_aqi=route_data.scores.minimum_aqi,
            health_risk_score=route_data.scores.health_score,
            distance_penalty_score=0.0, # Not provided in RouteScoreSchema directly
            time_penalty_score=route_data.scores.travel_time_score,
            composite_score=route_data.scores.smart_route_score,
            route_rank=route_data.rank,
            recommendation_type=rec_type
        )
        
        # Associate score with route
        route_history.scores = [score]
        
        # Create waypoints
        waypoints = []
        for i, wp_data in enumerate(route_data.waypoints):
            wp = RouteWaypoint(
                sequence_order=i,
                latitude=wp_data.latitude,
                longitude=wp_data.longitude
            )
            waypoints.append(wp)
            
        route_history.waypoints = waypoints
        
        return await self.save_route(route_history)

    async def save_waypoints(self, waypoints: List[RouteWaypoint]) -> None:
        try:
            self.db.add_all(waypoints)
            await self.db.commit()
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save waypoints: {str(e)}")
            raise e

    async def get_route(self, route_id: uuid.UUID) -> Optional[RouteHistory]:
        stmt = (
            select(RouteHistory)
            .where(RouteHistory.id == route_id)
            .options(
                selectinload(RouteHistory.waypoints),
                selectinload(RouteHistory.scores)
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_routes(self, user_id: uuid.UUID, limit: int = 50) -> List[RouteHistory]:
        stmt = (
            select(RouteHistory)
            .where(RouteHistory.user_id == user_id)
            .order_by(RouteHistory.created_at.desc())
            .limit(limit)
            .options(selectinload(RouteHistory.scores))
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def delete_route(self, route_id: uuid.UUID) -> bool:
        route = await self.get_route(route_id)
        if not route:
            return False
        try:
            await self.db.delete(route)
            await self.db.commit()
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to delete route: {str(e)}")
            raise e

    async def get_history(self, user_id: uuid.UUID, skip: int = 0, limit: int = 20, sort_by: str = "created_at", sort_desc: bool = True, filters: dict = None) -> tuple[List[RouteHistory], int]:
        from sqlalchemy import func
        stmt = select(RouteHistory).where(RouteHistory.user_id == user_id)
        
        if filters:
            if "start_date" in filters and filters["start_date"]:
                stmt = stmt.where(RouteHistory.created_at >= filters["start_date"])
            if "end_date" in filters and filters["end_date"]:
                stmt = stmt.where(RouteHistory.created_at <= filters["end_date"])
                
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = await self.db.scalar(count_stmt)
        
        order_col = getattr(RouteHistory, sort_by, RouteHistory.created_at)
        if sort_desc:
            stmt = stmt.order_by(order_col.desc())
        else:
            stmt = stmt.order_by(order_col.asc())
            
        stmt = stmt.offset(skip).limit(limit).options(selectinload(RouteHistory.scores))
        result = await self.db.execute(stmt)
        return list(result.scalars().all()), total_count or 0

class RouteScoreRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_route_score(self, score: RouteScore) -> RouteScore:
        try:
            self.db.add(score)
            await self.db.commit()
            await self.db.refresh(score)
            return score
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save route score: {str(e)}")
            raise e

class RouteHistoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_route_history(self, route: RouteHistory) -> RouteHistory:
        # Essentially aliases save_route for semantic clarity
        try:
            self.db.add(route)
            await self.db.commit()
            await self.db.refresh(route)
            return route
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Failed to save route history: {str(e)}")
            raise e
