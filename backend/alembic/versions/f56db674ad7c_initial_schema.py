"""Mark consolidated initial schema as current.

Revision ID: f56db674ad7c
Revises: d1597969bde6
Create Date: 2026-07-22 02:43:35.041208
"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "f56db674ad7c"
down_revision: Union[str, None] = "d1597969bde6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Schema is created by d1597969bde6_initial_migration."""


def downgrade() -> None:
    """No schema changes are introduced by this revision."""
