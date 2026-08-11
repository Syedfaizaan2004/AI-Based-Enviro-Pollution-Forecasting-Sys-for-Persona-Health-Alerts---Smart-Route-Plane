from json import JSONDecodeError
from datetime import datetime, timedelta, timezone
from typing import Optional
import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.models.enums import UserRole
from app.schemas.user import UserCreate, UserRead, LoginRequest, LoginResponse
from app.schemas.admin import AdminRegister
from app.schemas.token import (
    AuthMessageResponse,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    Token,
    VerifyEmailRequest,
)
from app.services.auth_service import AuthService
from app.api.dependencies.auth import get_current_user, oauth2_scheme
from app.repositories.health_profile import HealthProfileRepository
from app.repositories.user import UserRepository
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, get_password_hash
from app.core.redis import redis_client

router = APIRouter(prefix="/auth", tags=["Authentication"])
GOOGLE_TOKEN_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


def _login_response_for_user(user: User) -> dict:
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user,
    }


def _google_username_base(name: Optional[str], email: str) -> str:
    username = " ".join((name or "").split()) or email.split("@")[0]
    username = username.strip()[:50]
    return username if len(username) >= 3 else f"{username} user".strip()[:50]


async def _unique_google_username(db: AsyncSession, name: Optional[str], email: str) -> str:
    base = _google_username_base(name, email)
    candidate = base
    suffix = 2

    while await db.scalar(select(User.id).where(User.username == candidate)):
        suffix_text = f" {suffix}"
        candidate = f"{base[:50 - len(suffix_text)]}{suffix_text}"
        suffix += 1

    return candidate


def _create_action_token(subject: uuid.UUID, token_type: str, expires_minutes: int = 30) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "exp": now + timedelta(minutes=expires_minutes),
        "iat": now,
        "sub": str(subject),
        "type": token_type,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_action_token(token: str, expected_type: str) -> uuid.UUID:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != expected_type:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        return uuid.UUID(user_id)
    except (JWTError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid or expired token")


async def _read_refresh_token_from_request(request: Request, query_token: Optional[str]) -> Optional[str]:
    if query_token:
        return query_token

    try:
        body = await request.json()
    except (JSONDecodeError, ValueError):
        body = {}

    if not isinstance(body, dict):
        return None

    token_request = RefreshTokenRequest.model_validate(body)
    return token_request.refresh_token or token_request.refreshToken

LOGIN_OPENAPI_EXTRA = {
    "requestBody": {
        "required": True,
        "content": {
            "application/json": {
                "schema": LoginRequest.model_json_schema(),
                "example": {
                    "email": "Enter Your Email",
                    "password": "Password",
                },
            },
            "application/x-www-form-urlencoded": {
                "schema": {
                    "type": "object",
                    "required": ["username", "password"],
                    "properties": {
                        "username": {
                            "type": "string",
                            "format": "email",
                            "description": "Registered email address. Swagger OAuth uses the field name `username`.",
                        },
                        "password": {
                            "type": "string",
                            "format": "password",
                        },
                    },
                },
            },
        },
    }
}


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    auth_service = AuthService()
    return await auth_service.register_user(db, user_in)

@router.post("/admin/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def admin_register(
    admin_in: AdminRegister,
    db: AsyncSession = Depends(get_db)
):
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis is not configured")
        
    # Check token in Redis
    stored_email = await redis_client.get(f"admin_invite:{admin_in.token}")
    if not stored_email:
        raise HTTPException(status_code=400, detail="Invalid or expired invite token")
        
    if stored_email != admin_in.email:
        raise HTTPException(status_code=400, detail="Email does not match the invite token")
        
    # Check if user exists
    existing_user = await UserRepository().get_by_email(db, admin_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
        
    # Create Admin user
    new_admin = User(
        email=admin_in.email,
        username=admin_in.username,
        hashed_password=get_password_hash(admin_in.password),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True
    )
    
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)
    
    # Delete token so it can't be reused
    await redis_client.delete(f"admin_invite:{admin_in.token}")
    
    return new_admin


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and obtain access tokens",
    description=(
        "Accepts JSON login from API clients and OAuth2 form login from Swagger UI. "
        "Use the registered email address in Swagger's `username` field."
    ),
    openapi_extra=LOGIN_OPENAPI_EXTRA,
)
async def login(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form = await request.form()
        email = form.get("username") or form.get("email")
        password = form.get("password")
    else:
        try:
            login_data = LoginRequest.model_validate(await request.json())
        except (JSONDecodeError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Valid email and password are required",
            )
        email = login_data.email
        password = login_data.password

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email/username and password are required",
        )

    auth_service = AuthService()
    return await auth_service.authenticate(db, email, password)


@router.post("/google", response_model=LoginResponse)
async def google_login(
    request_data: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google login is not configured")

    try:
        idinfo = google_id_token.verify_oauth2_token(
            request_data.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    if idinfo.get("iss") not in GOOGLE_TOKEN_ISSUERS:
        raise HTTPException(status_code=401, detail="Invalid Google token issuer")

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account email is required")

    if not idinfo.get("email_verified"):
        raise HTTPException(status_code=403, detail="Google account email is not verified")

    email = email.lower()
    user = await db.scalar(select(User).where(User.email == email))

    if user:
        if user.is_deleted:
            raise HTTPException(status_code=403, detail="Account has been deleted")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
        if not user.is_verified:
            user.is_verified = True
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return _login_response_for_user(user)

    username = await _unique_google_username(db, idinfo.get("name"), email)
    user = User(
        email=email,
        username=username,
        hashed_password=get_password_hash(secrets.token_urlsafe(32)),
        role=UserRole.USER,
        is_active=True,
        is_verified=True,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)
    await HealthProfileRepository().create(db, obj_in={"user_id": user.id})

    return _login_response_for_user(user)


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    refresh_token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    token_value = await _read_refresh_token_from_request(request, refresh_token)
    if not token_value:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Refresh token is required",
        )

    try:
        payload = jwt.decode(token_value, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_uuid = uuid.UUID(user_id)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await UserRepository().get_by_id(db, user_uuid)
    if not user or not user.is_active or user.is_deleted:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/forgot-password", response_model=AuthMessageResponse)
async def forgot_password(
    request_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await UserRepository().get_by_email(db, request_data.email)
    response = {
        "message": "If the email exists, a password reset link has been generated.",
    }
    if user and user.is_active and not user.is_deleted:
        # NOTE: token would be sent via email in production
        # reset_token = _create_action_token(user.id, "password_reset")
        # send_password_reset_email(user.email, reset_token)
        pass
    return response


@router.post("/reset-password", response_model=AuthMessageResponse)
async def reset_password(
    request_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = _decode_action_token(request_data.token, "password_reset")
    user = await UserRepository().get_by_id(db, user_id)
    if not user or not user.is_active or user.is_deleted:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.hashed_password = get_password_hash(request_data.newPassword)
    db.add(user)
    await db.commit()
    return {"message": "Password reset successfully"}


@router.post("/verify-email", response_model=AuthMessageResponse)
async def verify_email(
    request_data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id = _decode_action_token(request_data.token, "email_verification")
    user = await UserRepository().get_by_id(db, user_id)
    if not user or user.is_deleted:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user.is_verified = True
    db.add(user)
    await db.commit()
    return {"message": "Email verified successfully"}


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    auth_service = AuthService()
    await auth_service.logout(token)
    return {"message": "Successfully logged out"}
