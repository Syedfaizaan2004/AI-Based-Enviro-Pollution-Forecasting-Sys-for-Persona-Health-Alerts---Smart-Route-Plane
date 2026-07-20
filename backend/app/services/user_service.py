"""
User service — database operations for user management.

Architecture:
  - All DB queries live here, not in route handlers.
  - Route handlers call service functions and translate results to HTTP responses.
  - Services are unaware of HTTP — they raise ValueError for business-rule
    violations and return None for "not found" cases.
"""

import uuid
from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.db.models.user import User
from app.schemas.user import UserRegisterRequest


# ========================================================================== #
# Queries
# ========================================================================== #

def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
    """Return the User with the given UUID, or None if not found."""
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return the User with the given email (case-insensitive), or None."""
    return (
        db.query(User)
        .filter(User.email == email.lower())
        .first()
    )


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Return the User with the given username (case-insensitive), or None."""
    return (
        db.query(User)
        .filter(User.username == username.lower())
        .first()
    )


# ========================================================================== #
# Mutations
# ========================================================================== #

def create_user(db: Session, payload: UserRegisterRequest) -> User:
    """
    Persist a new User to the database.

    Raises:
        ValueError("email_taken")    — if the email is already registered.
        ValueError("username_taken") — if the username is already taken.

    The password is hashed before being stored — plain text is never persisted.
    """
    # ── Uniqueness checks ──────────────────────────────────────────── #
    if get_user_by_email(db, payload.email):
        raise ValueError("email_taken")

    if get_user_by_username(db, payload.username):
        raise ValueError("username_taken")

    # ── Build ORM instance ─────────────────────────────────────────── #
    new_user = User(
        first_name=payload.first_name,
        middle_name=payload.middle_name,
        last_name=payload.last_name,
        username=payload.username,       # Already normalised to lowercase by schema.
        email=payload.email,             # Already normalised to lowercase by schema.
        password_hash=hash_password(payload.password),
        date_of_birth=payload.date_of_birth,
        health_issue=payload.health_issue,
        place_to_visit=payload.place_to_visit,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)   # Populate server-side defaults (id, created_at, updated_at).
    return new_user


# ========================================================================== #
# Authentication
# ========================================================================== #

def authenticate_user(
    db: Session,
    email: str,
    password: str,
) -> Optional[User]:
    """
    Validate credentials and return the User on success, or None on failure.

    Deliberately returns None (not a raised exception) so the caller controls
    the HTTP response, keeping the service layer HTTP-agnostic.
    """
    user = get_user_by_email(db, email)
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
