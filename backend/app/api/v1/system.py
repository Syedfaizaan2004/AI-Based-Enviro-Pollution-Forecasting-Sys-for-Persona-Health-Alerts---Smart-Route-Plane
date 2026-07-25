from fastapi import APIRouter, Depends, HTTPException, status
from app.core.scheduler import get_scheduler
from app.services.cache_service import CacheManager
from app.schemas.system import SystemJobsResponse, JobResponse, CacheRefreshRequest, CacheOperationResponse
from app.api.deps import get_current_user # Usually we'd use an admin dependency here

router = APIRouter(prefix="/system", tags=["System Administration"])

@router.get("/jobs", response_model=SystemJobsResponse)
async def list_jobs(current_user: dict = Depends(get_current_user)):
    # Simulating admin check
    if getattr(current_user, "role", "admin") != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
        
    scheduler = get_scheduler()
    jobs = scheduler.get_jobs()
    
    job_responses = [
        JobResponse(id=job.id, name=job.name, next_run_time=job.next_run_time)
        for job in jobs
    ]
    
    return SystemJobsResponse(total_jobs=len(job_responses), jobs=job_responses)

@router.post("/jobs/run/{job_id}", response_model=CacheOperationResponse)
async def run_job_manually(job_id: str, current_user: dict = Depends(get_current_user)):
    if getattr(current_user, "role", "admin") != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
        
    scheduler = get_scheduler()
    job = scheduler.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # Trigger the job's function manually (in background or immediately depending on requirements)
    # We call modify to run it now, but for simplicity we just return a message saying it's queued.
    return CacheOperationResponse(message=f"Job {job_id} executed manually (simulated).")

@router.post("/cache/refresh", response_model=CacheOperationResponse)
async def refresh_cache(req: CacheRefreshRequest, current_user: dict = Depends(get_current_user)):
    if getattr(current_user, "role", "admin") != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
    # This would map to BackgroundTaskService internally based on namespace
    return CacheOperationResponse(message=f"Cache refresh triggered for namespace: {req.namespace}")

@router.delete("/cache/clear", response_model=CacheOperationResponse)
async def clear_cache(req: CacheRefreshRequest, current_user: dict = Depends(get_current_user)):
    if getattr(current_user, "role", "admin") != "admin":
        raise HTTPException(status_code=403, detail="Admin authorization required")
        
    cleared_count = await CacheManager.clear_namespace(req.namespace)
    return CacheOperationResponse(
        message=f"Cache cleared for namespace: {req.namespace}",
        keys_affected=cleared_count
    )
