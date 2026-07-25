from app.repositories.base import BaseRepository
from app.models.api_log import ApiLog

class APILogRepository(BaseRepository[ApiLog]):
    def __init__(self):
        super().__init__(ApiLog)
