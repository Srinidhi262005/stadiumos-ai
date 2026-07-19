# backend/schemas/audit_log.py
"""Pydantic schemas for AuditLog model."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel

class AuditLogBase(BaseModel):
    user_id: uuid.UUID | None = None
    action: str
    details: str | None = None
    timestamp: datetime

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogRead(AuditLogBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
