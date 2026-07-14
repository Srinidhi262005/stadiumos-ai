# backend/core/permissions.py
"""Role‑based access control utilities.

Provides FastAPI ``Depends`` helpers that verify the JWT token and enforce
required roles.  The token payload is expected to contain ``sub`` (user UUID)
and ``role`` (string).  ``role`` values are compared directly with the role
constants defined in this module.
"""

from __future__ import annotations

from typing import Callable

from fastapi import Depends, HTTPException, status

from .security import decode_token, oauth2_scheme

# ---------------------------------------------------------------------------
# Token payload model (lightweight, no Pydantic dependency here)
# ---------------------------------------------------------------------------

def _get_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    """Decode JWT and return its payload.

    Raises ``HTTPException`` with 401 if token is invalid or expired.
    """
    try:
        payload = decode_token(token)
        return payload
    except Exception as exc:  # jwt.ExpiredSignatureError, jwt.InvalidTokenError, etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

# ---------------------------------------------------------------------------
# Role dependencies
# ---------------------------------------------------------------------------

# Define the role names used throughout the system.  They must match the
# ``role`` value emitted by ``create_access_token`` in ``security.py``.
# The backend model stores role enums (admin, staff, volunteer, guest) – we
# map those to the more expressive names required by the spec.

ROLE_ADMIN = "admin"
ROLE_OPERATIONS_MANAGER = "staff"  # Maps to existing 'staff' role
ROLE_SECURITY_LEAD = "staff"
ROLE_MEDICAL_OFFICER = "staff"
ROLE_VOLUNTEER_COORDINATOR = "staff"
ROLE_VOLUNTEER = "volunteer"
ROLE_GUEST = "guest"

def _require_role(required_role: str) -> Callable[[dict], dict]:
    """Factory returning a FastAPI dependency that ensures a specific role.

    The returned callable can be used directly in ``Depends`` statements.
    """
    def dependency(payload: dict = Depends(_get_token_payload)) -> dict:
        user_role: str = payload.get("role")
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return payload

    return dependency

# Concrete dependencies used in route definitions
require_admin = _require_role(ROLE_ADMIN)
require_operations_manager = _require_role(ROLE_OPERATIONS_MANAGER)
require_security_lead = _require_role(ROLE_SECURITY_LEAD)
require_medical_officer = _require_role(ROLE_MEDICAL_OFFICER)
require_volunteer_coordinator = _require_role(ROLE_VOLUNTEER_COORDINATOR)
require_volunteer = _require_role(ROLE_VOLUNTEER)
require_guest = _require_role(ROLE_GUEST)

# Helper to expose the current user payload (subject and role)
def get_current_user(payload: dict = Depends(_get_token_payload)) -> dict:
    """Return the token payload for the authenticated user.

    ``payload`` includes at least ``sub`` (user UUID) and ``role``.
    """
    return payload
