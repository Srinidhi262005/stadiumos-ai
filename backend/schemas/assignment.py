# backend/schemas/assignment.py
"""Pydantic schemas for Assignment model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class AssignmentBase(BaseModel):
    volunteer_id: uuid.UUID
    incident_id: uuid.UUID | None = None
    match_id: uuid.UUID | None = None
    zone_id: uuid.UUID | None = None
    role: str

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentSchema(AssignmentBase):
    id: uuid.UUID
    assigned_at: datetime
    completed_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
