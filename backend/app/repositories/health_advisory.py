from app.repositories.base import BaseRepository
from app.models.health_advisory import HealthAdvisoryLog

class HealthAdvisoryRepository(BaseRepository[HealthAdvisoryLog]):
    def __init__(self):
        super().__init__(HealthAdvisoryLog)
