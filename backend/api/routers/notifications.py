# backend/api/routers/notifications.py
"""Notifications router with real-time WebSocket broadcasts on CREATE/UPDATE/DELETE."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database.session import get_db
from models.notification import Notification
from schemas.notification import NotificationRead, NotificationCreate, NotificationUpdate
from core.permissions import get_current_user
from core.events import emit_event_async
from core.websocket import EventType

router = APIRouter()

@router.get("", response_model=List[NotificationRead])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve notifications for the currently logged-in user."""
    user_id = uuid.UUID(str(current_user.get("sub")))
    return db.query(Notification).filter(Notification.user_id == user_id).all()

@router.get("/{notification_id}", response_model=NotificationRead)
def get_notification(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve a specific notification alert."""
    user_id = uuid.UUID(str(current_user.get("sub")))
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return notif

@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(
    notification_in: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new notification alert."""
    notif = Notification(**notification_in.dict())
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Broadcast new notification to all clients (especially the targeted user)
    notif_dict = NotificationRead.from_orm(notif).dict()
    emit_event_async(EventType.NOTIFICATION, {**notif_dict, "action": "created"})

    return notif

@router.put("/{notification_id}", response_model=NotificationRead)
def update_notification(
    notification_id: uuid.UUID,
    notification_data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update notification read status."""
    user_id = uuid.UUID(str(current_user.get("sub")))
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    for key, value in notification_data.dict(exclude_unset=True).items():
        if hasattr(notif, key):
            setattr(notif, key, value)
    db.commit()
    db.refresh(notif)

    # Broadcast read status change
    notif_dict = NotificationRead.from_orm(notif).dict()
    emit_event_async(EventType.NOTIFICATION_READ, {**notif_dict, "action": "updated"})

    return notif

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Clear a notification."""
    user_id = uuid.UUID(str(current_user.get("sub")))
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user_id).first()
    if not notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    db.delete(notif)
    db.commit()

    # Broadcast deletion
    emit_event_async(EventType.NOTIFICATION_READ, {"id": str(notification_id), "action": "deleted"})

    return None
