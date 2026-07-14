# backend/schemas/telemetry.py
"""Pydantic schemas for Telemetry model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class TelemetryBase(BaseModel):
    zone_id: uuid.UUID
    match_id: uuid.UUID
    data: dict

class TelemetryCreate(TelemetryBase):
    pass

class TelemetryRead(TelemetryBase):
    id: uuid.UUID
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Alias for imports
TelemetrySchema = TelemetryRead
