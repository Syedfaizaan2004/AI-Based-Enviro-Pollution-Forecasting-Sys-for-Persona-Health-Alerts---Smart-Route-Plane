import re
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


PASSWORD_SPECIAL_CHARS = r"[!@#$%^&*(),.?\":{}|<>]"


def validate_password_strength(value: str) -> str:
    if not re.search(r"[A-Z]", value):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", value):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", value):
        raise ValueError("Password must contain at least one number")
    if not re.search(PASSWORD_SPECIAL_CHARS, value):
        raise ValueError("Password must contain at least one special character")
    return value


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None
    refreshToken: Optional[str] = None


class GoogleLoginRequest(BaseModel):
    credential: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str = Field(..., min_length=8)

    @field_validator("newPassword")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        return validate_password_strength(value)


class VerifyEmailRequest(BaseModel):
    token: str


class AuthMessageResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None
    verification_token: Optional[str] = None
