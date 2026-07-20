"""
SQLAlchemy database engine and session management.

Pattern:
  - Engine is created once using the DATABASE_URL from Settings.
  - SessionLocal is a session factory used via the `get_db` dependency.
  - `get_db` is an async-generator dependency injected into route handlers.
"""

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# ------------------------------------------------------------------ #
# Engine — synchronous (psycopg2)
# ------------------------------------------------------------------ #
engine = create_engine(
    settings.DATABASE_URL,
    # Keep a small pool; scale up in production via env vars.
    pool_pre_ping=True,       # Recycle stale connections automatically.
    pool_size=5,
    max_overflow=10,
    echo=False,               # Set True locally to log SQL for debugging.
)

# ------------------------------------------------------------------ #
# Session factory
# ------------------------------------------------------------------ #
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,   # Prevent lazy-loading errors after commit.
)


# ------------------------------------------------------------------ #
# FastAPI dependency
# ------------------------------------------------------------------ #
def get_db() -> Generator[Session, None, None]:
    """
    Yield a SQLAlchemy Session for the duration of a single request.

    Usage in route handlers:
        db: Session = Depends(get_db)
    """
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Perform a lightweight liveness check against the database.
    Returns True if the database is reachable, False otherwise.
    Called during application startup.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
