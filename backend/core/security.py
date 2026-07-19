# backend/core/security.py
"""Security utilities for password hashing and JWT handling.

Provides:
- bcrypt password hashing via passlib
- JWT creation (access & refresh tokens)
- Token decoding & validation
- OAuth2PasswordBearer instance for FastAPI docs
"""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

from .config import settings

# ---------------------------------------------------------------------------
# Password hashing utilities (native bcrypt)
# ---------------------------------------------------------------------------
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Return a bcrypt hash for the given password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

# ---------------------------------------------------------------------------
# JWT handling
# ---------------------------------------------------------------------------
# OAuth2 scheme used by FastAPI to document the /auth/login endpoint
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def _create_token(data: Dict[str, Any], expires_delta: timedelta) -> str:
    """Internal helper to encode a JWT with a given expiry delta."""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token.

    Args:
        subject: The user identifier (UUID as string).
        role: Role name (e.g., "admin").
        expires_delta: Optional custom expiry. Defaults to settings.ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _create_token({"sub": subject, "role": role, "type": "access"}, expires_delta)


def create_refresh_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create a refresh token.

    Refresh tokens live longer – default 7 days if not overridden via env.
    """
    default_days = 7
    if expires_delta is None:
        expires_delta = timedelta(days=getattr(settings, "REFRESH_TOKEN_EXPIRE_DAYS", default_days))
    return _create_token({"sub": subject, "role": role, "type": "refresh"}, expires_delta)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode a JWT and verify its signature & expiry.

    Raises jwt.ExpiredSignatureError, jwt.InvalidTokenError on failure.
    """
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

# Placeholder role definitions (kept for compatibility with previous code)
ROLES = {
    "admin": "Administrator with full access",
    "operator": "Operator with limited access",
    "viewer": "Read‑only access",
}
