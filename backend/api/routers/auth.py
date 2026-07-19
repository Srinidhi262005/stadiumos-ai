# backend/api/routers/auth.py
"""Authentication router providing login, token refresh, user info, logout, and role listing.

All endpoints use the services defined in ``backend.services.auth_service`` and the
permission utilities from ``backend.core.permissions``.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    CurrentUser,
)
from services.auth_service import (
    authenticate_user,
    generate_tokens,
    refresh_access_token,
    get_current_user,
)
from core.permissions import get_current_user as get_current_user_payload
from models.user import User
from models.role import RoleEnum
from database.session import get_db
from sqlalchemy.orm import Session

def get_user_from_token(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
) -> User:
    user = get_current_user(db, payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


router = APIRouter()

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Validate credentials and issue JWT tokens.
    """
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    tokens = generate_tokens(user)
    return LoginResponse(**tokens)

@router.post("/refresh", response_model=RefreshResponse)
def refresh(request: RefreshRequest):
    result = refresh_access_token(request.refresh_token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    return RefreshResponse(**result)

@router.get("/me", response_model=CurrentUser)
def read_current_user(current_user: User = Depends(get_user_from_token)):
    return CurrentUser(id=current_user.id, email=current_user.email, role=current_user.role.name)

@router.post("/logout")
def logout():
    # Token revocation logic would go here (e.g., blacklist).
    return {"message": "Logged out successfully"}

@router.get("/roles")
def list_roles():
    return [role.value for role in RoleEnum]
