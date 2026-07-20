"""
Security utilities — password hashing and JWT token management.

Libraries:
  - bcrypt          — direct bcrypt hashing, fully Python 3.14 compatible.
                      (passlib is unmaintained and breaks on Python 3.14 + bcrypt 4.x)
  - python-jose     — JWT encode / decode (HS256).
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import HTTPException, status
from jose import JWTError, jwt

from app.core.config import get_settings
from app.schemas.user import TokenPayload

settings = get_settings()


# ========================================================================== #
# Password helpers
# ========================================================================== #

def hash_password(plain_password: str) -> str:
    """
    Return a bcrypt hash of `plain_password`.

    The password is encoded to UTF-8 bytes, hashed with a random salt,
    and the result is returned as a UTF-8 string for database storage.
    """
    hashed_bytes = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed_bytes.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify that `plain_password` matches `hashed_password`.

    Returns True on match, False otherwise.
    Uses bcrypt.checkpw which is constant-time and safe against timing attacks.
    """
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ========================================================================== #
# JWT helpers
# ========================================================================== #

def create_access_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Encode a JWT access token.

    Args:
        subject:       The value to store in the `sub` claim (user UUID as str).
        expires_delta: Optional custom expiry. Falls back to
                       Settings.ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        A signed JWT string.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> TokenPayload:
    """
    Decode and validate a JWT access token.

    Raises:
        HTTPException 401 — if the token is invalid, expired, or missing `sub`.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        sub: Optional[str] = payload.get("sub")
        if sub is None:
            raise credentials_exception

        return TokenPayload(sub=sub, exp=payload.get("exp"))

    except JWTError:
        raise credentials_exception
