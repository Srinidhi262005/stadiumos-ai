# backend/schemas/notification.py
"""Pydantic schemas for Notification model."""
from __future__ import annotations
import uuid
from datetime import datetime
from pydantic import BaseModel

class NotificationBase(BaseModel):
    user_id: uuid.UUID
    title: str
    message: str
    is_read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    is_read: bool | None = None

class NotificationRead(NotificationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
