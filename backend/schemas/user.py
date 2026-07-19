# backend/schemas/user.py
"""Pydantic schema for User model."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserSchema(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
