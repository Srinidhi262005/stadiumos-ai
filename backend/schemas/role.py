# backend/schemas/role.py
"""Pydantic schema for Role model."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class RoleEnum(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    VOLUNTEER = "volunteer"
    GUEST = "guest"

class RoleSchema(BaseModel):
    id: uuid.UUID
    name: RoleEnum
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
