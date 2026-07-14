# backend/schemas/auth.py
"""Pydantic schemas for authentication endpoints.

Only authentication‑related schemas are defined here to avoid pulling in the
full model layer.
"""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class TokenPayload(BaseModel):
    sub: UUID
    role: str
    exp: datetime
    iat: datetime
    type: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class CurrentUser(BaseModel):
    id: UUID
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
