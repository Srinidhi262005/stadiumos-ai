# backend/schemas/match.py
"""Pydantic schemas for Match model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class MatchBase(BaseModel):
    name: str
    start_time: datetime
    end_time: datetime | None = None

class MatchCreate(MatchBase):
    pass

class MatchRead(MatchBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
