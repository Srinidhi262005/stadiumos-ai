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
    category: str = "Security"
    status: str = "detected"
    crowd_impact: str | None = "Low"
    assigned_team: str | None = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    match_id: uuid.UUID | None = None
    zone_id: uuid.UUID | None = None
    description: str | None = None
    severity: str | None = None
    category: str | None = None
    status: str | None = None
    crowd_impact: str | None = None
    assigned_team: str | None = None

class IncidentRead(IncidentBase):
    id: uuid.UUID
    reported_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Alias for consistency with __init__ imports
IncidentSchema = IncidentRead
