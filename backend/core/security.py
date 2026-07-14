"""Security utilities for password hashing and JWT handling.
This module provides only the core helpers without any endpoint implementation.
"""

from datetime import datetime, timedelta
from typing import Any, Dict

from passlib.context import CryptContext
import jwt

from .config import settings

# Password hashing context (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Return a bcrypt hash for the given password."""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token.

    Args:
        data: Payload data (will be encoded as JSON).
        expires_delta: Optional custom expiry. If omitted, uses settings.ACCESS_TOKEN_EXPIRE_MINUTES.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Placeholder role definitions (could be expanded later)
ROLES = {
    "admin": "Administrator with full access",
    "operator": "Operator with limited access",
    "viewer": "Read‑only access",
}
