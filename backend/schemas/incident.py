# backend/schemas/incident.py
"""Pydantic schemas for Incident model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class IncidentBase(BaseModel):
    match_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    description: str
    severity: str

class IncidentCreate(IncidentBase):
    pass

class IncidentRead(IncidentBase):
    id: uuid.UUID
    reported_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Alias for consistency with __init__ imports
IncidentSchema = IncidentRead
