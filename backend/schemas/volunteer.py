# backend/schemas/volunteer.py
"""Pydantic schemas for Volunteer model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr

class VolunteerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    is_active: bool = True

class VolunteerCreate(VolunteerBase):
    pass

class VolunteerRead(VolunteerBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Alias for imports
VolunteerSchema = VolunteerRead
