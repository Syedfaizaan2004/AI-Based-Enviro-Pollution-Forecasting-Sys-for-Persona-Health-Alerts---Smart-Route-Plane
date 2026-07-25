from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class JobResponse(BaseModel):
    id: str
    name: str
    next_run_time: Optional[datetime] = None

class SystemJobsResponse(BaseModel):
    total_jobs: int
    jobs: List[JobResponse]

class CacheRefreshRequest(BaseModel):
    namespace: str

class CacheOperationResponse(BaseModel):
    message: str
    keys_affected: Optional[int] = None
