# ORM models package.
# Import every model here so SQLAlchemy registers it with Base.metadata
# and Alembic can auto-generate accurate migrations.
from app.db.models.user import User  # noqa: F401

__all__ = ["User"]
