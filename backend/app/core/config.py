from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Any, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Environmental Pollution Forecasting System"
    API_VERSION: str = "v1"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GOOGLE_MAPS_API_KEY: Optional[str] = None
    OPENWEATHER_API_KEY: Optional[str] = None
    WAQI_API_KEY: Optional[str] = None
    GEOAPIFY_API_KEY: Optional[str] = None
    SARVAM_AI_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None

    CORS_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore")

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> Any:
        if isinstance(v, bool) or v is None:
            return v

        if isinstance(v, str):
            normalized = v.strip().lower()
            if normalized in {"1", "true", "t", "yes", "y", "on", "debug", "development", "dev"}:
                return True
            if normalized in {"0", "false", "f", "no", "n", "off", "release", "production", "prod"}:
                return False

        return v

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str) -> str:
        if v and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

settings = Settings()
