# backend/schemas/report.py
"""Pydantic schemas for Report model."""

from __future__ import annotations

import uuid
from datetime import datetime
from pydantic import BaseModel

class ReportBase(BaseModel):
    match_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    title: str
    content: str

class ReportCreate(ReportBase):
    pass

class ReportRead(ReportBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# Alias used by __init__ imports
ReportSchema = ReportRead
