from json import JSONDecodeError

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, LoginRequest, LoginResponse
from app.schemas.token import Token
from app.services.auth_service import AuthService
from app.api.dependencies.auth import get_current_user, oauth2_scheme
from jose import jwt, JWTError
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

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


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    from app.repositories.user import UserRepository
    import uuid
    user = await UserRepository().get_by_id(db, uuid.UUID(user_id))
    if not user or not user.is_active or user.is_deleted:
        raise HTTPException(status_code=401, detail="User not found or inactive")
        
    return {
        "access_token": create_access_token(user.id),
        "refresh_token": create_refresh_token(user.id),
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    auth_service = AuthService()
    await auth_service.logout(token)
    return {"message": "Successfully logged out"}
