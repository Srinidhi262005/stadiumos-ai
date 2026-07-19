# backend/schemas/accessibility.py
"""Pydantic schemas for AccessibilityRequest model."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel
from models.accessibility_request import RequestPriority, RequestStatus

class AccessibilityRequestBase(BaseModel):
    spectator_name: str
    match_id: uuid.UUID
    zone_id: uuid.UUID | None = None
    category: str
    priority: RequestPriority = RequestPriority.MEDIUM
    status: RequestStatus = RequestStatus.PENDING

class AccessibilityRequestCreate(AccessibilityRequestBase):
    pass

class AccessibilityRequestUpdate(BaseModel):
    spectator_name: str | None = None
    match_id: uuid.UUID | None = None
    zone_id: uuid.UUID | None = None
    category: str | None = None
    priority: RequestPriority | None = None
    status: RequestStatus | None = None

class AccessibilityRequestRead(AccessibilityRequestBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
