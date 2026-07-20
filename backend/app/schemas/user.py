"""
Pydantic schemas for user-related request / response payloads.

Naming convention:
  - *Request  — inbound data (validated strictly).
  - *Response — outbound data (never exposes password_hash).
  - *Payload  — internal models (e.g. JWT claims).
"""

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)


# ========================================================================== #
# REQUEST schemas
# ========================================================================== #

class UserRegisterRequest(BaseModel):
    """Payload for POST /api/v1/auth/register."""

    first_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["Syed"],
        description="User's first name.",
    )
    middle_name: Optional[str] = Field(
        default=None,
        max_length=100,
        examples=["Faizaan"],
        description="User's middle name (optional).",
    )
    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        examples=["Ahmad"],
        description="User's last name.",
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        examples=["sfaizaan"],
        description="Unique username: 3–50 chars, letters/digits/underscores only.",
    )
    email: EmailStr = Field(
        ...,
        examples=["sfaizaan@example.com"],
        description="Valid email address used for login.",
    )
    password: str = Field(
        ...,
        min_length=8,
        examples=["Secure@123"],
        description="Plain-text password (min 8 characters). Hashed before storage.",
    )
    date_of_birth: Optional[date] = Field(
        default=None,
        examples=["2000-01-15"],
        description="Date of birth (YYYY-MM-DD). Optional.",
    )
    health_issue: Optional[str] = Field(
        default=None,
        examples=["Asthma"],
        description="Health condition(s) affecting pollution sensitivity. Optional.",
    )
    place_to_visit: Optional[str] = Field(
        default=None,
        max_length=255,
        examples=["Karachi, Pakistan"],
        description="Destination for route planning. Optional.",
    )

    # ── Validators ──────────────────────────────────────────────────── #

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, value: str) -> str:
        """Allow only letters, digits, and underscores in usernames."""
        if not all(c.isalnum() or c == "_" for c in value):
            raise ValueError(
                "Username may only contain letters, digits, and underscores."
            )
        return value.lower()

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, value: str) -> str:
        """Normalise email to lowercase before any uniqueness check."""
        return value.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        """Enforce a minimum password length of 8 characters."""
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        return value

    model_config = ConfigDict(str_strip_whitespace=True)


class UserLoginRequest(BaseModel):
    """Payload for POST /api/v1/auth/login."""

    email: EmailStr = Field(
        ...,
        examples=["sfaizaan@example.com"],
        description="Registered email address.",
    )
    password: str = Field(
        ...,
        examples=["Secure@123"],
        description="Account password.",
    )

    @field_validator("email")
    @classmethod
    def email_lowercase(cls, value: str) -> str:
        return value.lower()

    model_config = ConfigDict(str_strip_whitespace=True)


# ========================================================================== #
# RESPONSE schemas
# ========================================================================== #

class UserResponse(BaseModel):
    """
    Public user representation returned by /register and /me.
    Never includes password_hash.
    """

    id: uuid.UUID
    first_name: str
    middle_name: Optional[str]
    last_name: str
    username: str
    email: str
    date_of_birth: Optional[date]
    health_issue: Optional[str]
    place_to_visit: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Allow SQLAlchemy ORM objects to be serialised directly.
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Response body for a successful login."""

    access_token: str = Field(..., description="JWT Bearer token.")
    token_type: str = Field(default="bearer", description="Always 'bearer'.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
            }
        }
    )


# ========================================================================== #
# INTERNAL schemas
# ========================================================================== #

class TokenPayload(BaseModel):
    """
    Claims decoded from a JWT access token.

    `sub` stores the user's UUID as a string so it can be used as the
    standard JWT subject claim.
    """

    sub: str  # user UUID
    exp: Optional[int] = None
