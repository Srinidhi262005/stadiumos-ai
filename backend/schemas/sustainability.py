# backend/schemas/sustainability.py
"""Pydantic schemas for SustainabilityMetric model."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel
from backend.models.sustainability_metric import MetricType

class SustainabilityMetricBase(BaseModel):
    zone_id: uuid.UUID
    metric_type: MetricType
    value: float
    measured_at: datetime

class SustainabilityMetricCreate(SustainabilityMetricBase):
    pass

class SustainabilityMetricUpdate(BaseModel):
    zone_id: uuid.UUID | None = None
    metric_type: MetricType | None = None
    value: float | None = None
    measured_at: datetime | None = None


class SustainabilityMetricRead(SustainabilityMetricBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
