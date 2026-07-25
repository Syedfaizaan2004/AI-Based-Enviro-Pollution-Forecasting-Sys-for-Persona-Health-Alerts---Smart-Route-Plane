from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from typing import List
from app.repositories.route import FavoriteRouteRepository
from app.schemas.route import FavoriteRouteCreate, FavoriteRouteUpdate
from app.models.route import FavoriteRoute
import uuid

class FavoriteRouteService:
    def __init__(self):
        self.repo = FavoriteRouteRepository()

    async def get_routes(self, db: AsyncSession, user_id: uuid.UUID) -> List[FavoriteRoute]:
        return await self.repo.get_user_favorites(db, user_id)

    async def add_route(self, db: AsyncSession, user_id: uuid.UUID, route_in: FavoriteRouteCreate) -> FavoriteRoute:
        dup = await self.repo.find_duplicate_route(
            db, user_id, route_in.start_lat, route_in.start_lng, route_in.end_lat, route_in.end_lng
        )
        if dup:
            raise HTTPException(status_code=400, detail="Duplicate favorite route")
            
        obj_in = route_in.model_dump()
        obj_in["user_id"] = user_id
        return await self.repo.create(db, obj_in=obj_in)

    async def update_route(self, db: AsyncSession, user_id: uuid.UUID, route_id: uuid.UUID, route_in: FavoriteRouteUpdate) -> FavoriteRoute:
        route = await self.repo.get_by_id(db, route_id)
        if not route or route.user_id != user_id:
            raise HTTPException(status_code=404, detail="Route not found")
            
        return await self.repo.update(db, db_obj=route, obj_in=route_in.model_dump(exclude_unset=True))

    async def delete_route(self, db: AsyncSession, user_id: uuid.UUID, route_id: uuid.UUID):
        route = await self.repo.get_by_id(db, route_id)
        if not route or route.user_id != user_id:
            raise HTTPException(status_code=404, detail="Route not found")
            
        await self.repo.delete(db, id=route_id)
