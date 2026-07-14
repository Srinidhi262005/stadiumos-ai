# backend/schemas/zone.py
"""Pydantic schemas for Zone model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class ZoneBase(BaseModel):
    name: str
    match_id: uuid.UUID

class ZoneCreate(ZoneBase):
    pass

class ZoneRead(ZoneBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
