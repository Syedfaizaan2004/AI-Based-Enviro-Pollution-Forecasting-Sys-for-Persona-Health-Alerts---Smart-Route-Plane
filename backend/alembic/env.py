"""
Alembic environment configuration.

Key responsibilities:
  1. Load DATABASE_URL from the application's Settings (not from alembic.ini)
     so credentials live in exactly one place (.env).
  2. Import all ORM models so Alembic can auto-generate accurate migrations.
  3. Support both online (live DB) and offline (SQL script) migration modes.
"""

import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

# ── Make `app` importable ─────────────────────────────────────────────────────
# alembic is run from backend/, so we add backend/ to sys.path.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# ── Application imports ───────────────────────────────────────────────────────
from app.core.config import get_settings  # noqa: E402
from app.db.base import Base  # noqa: E402

# Import all ORM models here so Alembic registers them with Base.metadata.
# Add new model imports below as the application grows.
from app.db.models.user import User  # noqa: F401

# ── Alembic Config object ─────────────────────────────────────────────────────
config = context.config

# Inject DATABASE_URL from Settings so alembic.ini stays credential-free.
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Configure logging from alembic.ini.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata target for auto-generation.
target_metadata = Base.metadata


# ── Offline mode ──────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    """
    Generate SQL migration scripts without a live database connection.

    Useful for reviewing migrations before applying them, or for DBAs
    who apply scripts manually in production.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


# ── Online mode ───────────────────────────────────────────────────────────────
def run_migrations_online() -> None:
    """
    Apply migrations to a live database.

    Uses NullPool to avoid connection leaks in migration scripts.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,  # Detect column type changes.
        )

        with context.begin_transaction():
            context.run_migrations()


# ── Entry point ───────────────────────────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
