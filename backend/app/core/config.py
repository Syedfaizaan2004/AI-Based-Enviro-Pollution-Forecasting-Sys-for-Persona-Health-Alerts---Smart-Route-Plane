"""
Application configuration.

Reads environment variables from the project-root .env file using
Pydantic BaseSettings so every setting has a type, a default, and
is validated at startup rather than failing silently at runtime.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the .env path relative to this file so the config works correctly
# regardless of which directory the process is launched from
# (uvicorn from backend/, alembic from backend/, pytest, etc.).
# __file__ = backend/app/core/config.py  → parent×3 = project root
_ENV_FILE = Path(__file__).resolve().parent.parent.parent.parent / ".env"


class Settings(BaseSettings):
    """Centralised application settings loaded from environment variables."""

    # ------------------------------------------------------------------ #
    # Database
    # ------------------------------------------------------------------ #
    DATABASE_URL: str

    # ------------------------------------------------------------------ #
    # JWT / Security  (not used in Week 1 but loaded so .env is complete)
    # ------------------------------------------------------------------ #
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ------------------------------------------------------------------ #
    # Application meta
    # ------------------------------------------------------------------ #
    APP_TITLE: str = "AI Environmental Pollution Forecasting API"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = (
        "REST API for AI-Based Environmental Pollution Forecasting, "
        "Personal Health Alerts and Smart Route Planning."
    )

    # ------------------------------------------------------------------ #
    # CORS — comma-separated list of allowed origins
    # ------------------------------------------------------------------ #
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        # Absolute path — works from any working directory.
        env_file=_ENV_FILE,
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance (loaded once at startup)."""
    return Settings()
