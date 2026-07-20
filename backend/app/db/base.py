"""
SQLAlchemy declarative base.

All ORM models must inherit from `Base` so Alembic can discover them
for migration generation.  Import models alongside this module in
alembic/env.py to ensure auto-generation works correctly.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Shared declarative base for all SQLAlchemy ORM models.

    Subclass this in every model file, e.g.:

        from app.db.base import Base

        class User(Base):
            __tablename__ = "users"
            ...
    """
    pass
