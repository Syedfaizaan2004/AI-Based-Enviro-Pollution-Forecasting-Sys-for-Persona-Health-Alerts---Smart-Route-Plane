from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.middleware.request_id import RequestIDMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import AppException, app_exception_handler, global_exception_handler
from app.api.v1.router import api_router
from app.core.database import engine
from app.core.redis import check_redis_connection
import structlog
from contextlib import asynccontextmanager

# Setup structured logging
setup_logging()
logger = structlog.get_logger(__name__)

from app.core.scheduler import init_scheduler, start_scheduler, stop_scheduler
from app.services.background_tasks import BackgroundTaskService

import os
import sys

async def validate_deployment():
    logger.info("Running pre-flight deployment checks...")
    if not settings.DATABASE_URL:
        logger.critical("DATABASE_URL is missing!")
        sys.exit(1)
    if not settings.REDIS_URL:
        logger.critical("REDIS_URL is missing!")
        sys.exit(1)
    if not settings.SECRET_KEY:
        logger.critical("SECRET_KEY is missing! Cannot sign JWT tokens.")
        sys.exit(1)
        
    db_healthy = False
    try:
        async with engine.connect() as conn:
            db_healthy = True
    except Exception as e:
        logger.critical(f"FATAL: Could not connect to Database on startup: {e}")
        sys.exit(1)
        
    logger.info("Deployment validation passed.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up backend...")
    await validate_deployment()
    init_scheduler()
    BackgroundTaskService.register_jobs()
    start_scheduler()
    yield
    logger.info("Shutting down backend...")
    stop_scheduler()
    await engine.dispose()

app = FastAPI(
    title="AI-Based Environmental Pollution Forecasting API",
    description="Production-grade API for AQI Forecasting, Health Advisories, and Smart Route Planning.",
    version="1.0.0",
    contact={
        "name": "Backend Team",
        "email": "support@example.com",
    },
    license_info={
        "name": "Proprietary",
    },
    openapi_tags=[
        {"name": "System Health", "description": "Liveness and Readiness Probes"},
        {"name": "Admin Operations", "description": "Secured administrative endpoints for system management"}
    ],
    lifespan=lifespan
)

from app.middleware.rate_limiter import RateLimitingMiddleware
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.middleware.maintenance import MaintenanceModeMiddleware
from app.middleware.correlation_id import CorrelationIdMiddleware

# Middleware (Order matters - outermost first)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(MaintenanceModeMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitingMiddleware, max_requests=200, window_seconds=60)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Exception Handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Routers
app.include_router(api_router, prefix=f"/api/{settings.API_VERSION}")

@app.get("/")
async def root():
    return {"message": "Backend Running"}
