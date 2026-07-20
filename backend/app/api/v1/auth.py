"""
Auth router — user registration, login, and authenticated profile retrieval.

Endpoints:
  POST /api/v1/auth/register  → Create a new user account.  (201)
  POST /api/v1/auth/login     → Authenticate and receive a JWT. (200)
  GET  /api/v1/auth/me        → Return the currently authenticated user. (200)

All routes live under the /api/v1/auth prefix defined in main.py.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, decode_access_token
from app.db.models.user import User
from app.schemas.user import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services import user_service

router = APIRouter(tags=["Authentication"])

# ── OAuth2 scheme — extracts the Bearer token from the Authorization header ──
# tokenUrl is used solely by the Swagger UI "Authorize" button; it is
# NOT the real login endpoint (which accepts JSON, not a form).
_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ========================================================================== #
# Shared dependency — get the currently authenticated user
# ========================================================================== #

def get_current_user(
    token: Annotated[str, Depends(_oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """
    FastAPI dependency that:
      1. Extracts the Bearer token from the Authorization header.
      2. Decodes and validates the JWT (raises 401 on failure).
      3. Fetches the user from the database (raises 401 if not found).

    Inject with:  current_user: Annotated[User, Depends(get_current_user)]
    """
    token_payload = decode_access_token(token)   # Raises 401 on invalid token.

    try:
        user_id = uuid.UUID(token_payload.sub)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# ========================================================================== #
# POST /register
# ========================================================================== #

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Create a new user account. "
        "The password is hashed with bcrypt before storage. "
        "Returns the created user profile (without the password hash)."
    ),
)
def register(
    payload: UserRegisterRequest,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Register a new user account."""
    try:
        user = user_service.create_user(db, payload)
    except ValueError as exc:
        error_code = str(exc)
        if error_code == "email_taken":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email address already exists.",
            )
        if error_code == "username_taken":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already taken. Please choose another.",
            )
        raise  # Re-raise unexpected errors.

    return UserResponse.model_validate(user)


# ========================================================================== #
# POST /login
# ========================================================================== #

@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login and obtain a JWT",
    description=(
        "Authenticate with email and password. "
        "Returns a JWT Bearer token valid for the configured expiry duration. "
        "Include this token in the `Authorization: Bearer <token>` header for protected routes."
    ),
)
def login(
    payload: UserLoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> TokenResponse:
    """Authenticate a user and return a JWT access token."""
    user = user_service.authenticate_user(db, payload.email, payload.password)

    # Return the same generic 401 for both "user not found" and "wrong password"
    # to prevent user enumeration attacks.
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=access_token, token_type="bearer")


# ========================================================================== #
# GET /me
# ========================================================================== #

@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description=(
        "Return the profile of the currently authenticated user. "
        "Requires a valid JWT Bearer token in the Authorization header."
    ),
)
def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Return the authenticated user's profile."""
    return UserResponse.model_validate(current_user)
