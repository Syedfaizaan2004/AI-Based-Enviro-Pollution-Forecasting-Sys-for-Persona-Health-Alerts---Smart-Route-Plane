from app.repositories.base import BaseRepository
from app.models.city import CityAQISnapshot, CityMaster


class CityRepository(BaseRepository[CityMaster]):
    def __init__(self):
        super().__init__(CityMaster)


class CityAQIRepository(BaseRepository[CityAQISnapshot]):
    def __init__(self):
        super().__init__(CityAQISnapshot)
