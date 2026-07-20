"""
FastAPI application factory.

Responsibilities:
  - Create the FastAPI instance with metadata.
  - Register CORS middleware.
  - Mount all versioned API routers.
  - Verify database connectivity at startup (warn only — does not block boot).
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, health
from app.core.config import get_settings
from app.core.database import check_db_connection

logger = logging.getLogger(__name__)
settings = get_settings()


# ------------------------------------------------------------------ #
# Lifespan — startup / shutdown hooks
# ------------------------------------------------------------------ #
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Run startup tasks before serving and cleanup tasks on shutdown."""
    # ── Startup ──────────────────────────────────────────────────── #
    logger.info("Starting %s v%s", settings.APP_TITLE, settings.APP_VERSION)

    db_ok = check_db_connection()
    if db_ok:
        logger.info("✅  Database connection verified.")
    else:
        logger.warning(
            "⚠️   Could not reach the database at startup. "
            "Ensure PostgreSQL is running and DATABASE_URL is correct."
        )

    yield  # Application is now running and serving requests.

    # ── Shutdown ─────────────────────────────────────────────────── #
    logger.info("Shutting down %s.", settings.APP_TITLE)


# ------------------------------------------------------------------ #
# Application instance
# ------------------------------------------------------------------ #
def create_application() -> FastAPI:
    """Construct and configure the FastAPI application."""
    application = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ─────────────────────────────────────────────────────── #
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ──────────────────────────────────────────────────── #
    # All routes are versioned under /api/v1.
    application.include_router(health.router, prefix="/api/v1")
    application.include_router(auth.router, prefix="/api/v1/auth")

    return application


app = create_application()
