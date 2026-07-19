# backend/services/auth_service.py
"""Authentication service handling login, token refresh and user lookup.

All interactions are with the existing SQLAlchemy ``User`` model and the
utility functions from ``backend.core.security``.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Optional

from sqlalchemy.orm import Session

from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from ..models.user import User
from ..models.role import RoleEnum

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Return a ``User`` instance matching the e‑mail or ``None``.
    """
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Validate credentials and return the user if successful.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def generate_tokens(user: User) -> dict:
    """Create access and refresh JWTs for ``user``.
    """
    # ``user.role.name`` gives the enum value (e.g. "admin")
    role_str = user.role.name  # type: ignore[attr-defined]
    access_token = create_access_token(subject=str(user.id), role=role_str)
    refresh_token = create_refresh_token(subject=str(user.id), role=role_str)
    return {"access_token": access_token, "refresh_token": refresh_token}

def refresh_access_token(refresh_token: str) -> Optional[dict]:
    """Validate a refresh token and issue a new access token.
    Returns ``None`` if the token is invalid or not a refresh token.
    """
    try:
        payload = decode_token(refresh_token)
    except Exception:
        return None
    if payload.get("type") != "refresh":
        return None
    subject: str = payload.get("sub")
    role: str = payload.get("role")
    # Issue a fresh access token (default expiry)
    new_access = create_access_token(subject=subject, role=role)
    return {"access_token": new_access}

def get_current_user(db: Session, token_payload: dict) -> Optional[User]:
    """Fetch the ``User`` instance for the given token payload.
    """
    user_id = token_payload.get("sub")
    if not user_id:
        return None
    import uuid
    try:
        user_uuid = uuid.UUID(str(user_id))
    except ValueError:
        return None
    return db.query(User).filter(User.id == user_uuid).first()

# Password utilities are exposed for account creation elsewhere
hash_password = get_password_hash
