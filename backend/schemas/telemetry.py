# backend/schemas/telemetry.py
"""Pydantic schemas for Telemetry model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class TelemetryBase(BaseModel):
    zone_id: uuid.UUID | None = None
    match_id: uuid.UUID
    metric_name: str
    value: float

class TelemetryCreate(TelemetryBase):
    pass

class TelemetryRead(TelemetryBase):
    id: uuid.UUID
    timestamp: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Alias for imports
TelemetrySchema = TelemetryRead
