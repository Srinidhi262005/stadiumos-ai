# backend/api/routers/accessibility.py
"""Accessibility router with real-time WebSocket broadcasts on CREATE/UPDATE/DELETE."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.session import get_db
from backend.models.accessibility_request import AccessibilityRequest
from backend.schemas.accessibility import AccessibilityRequestRead, AccessibilityRequestCreate, AccessibilityRequestUpdate
from backend.core.permissions import get_current_user
from backend.core.events import emit_event_async, emit_dashboard_kpi_async
from backend.core.websocket import EventType

router = APIRouter()

@router.get("", response_model=List[AccessibilityRequestRead])
def get_accessibility_requests(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all accessibility requests."""
    return db.query(AccessibilityRequest).all()

@router.get("/{request_id}", response_model=AccessibilityRequestRead)
def get_accessibility_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve a specific accessibility request by ID."""
    req = db.query(AccessibilityRequest).filter(AccessibilityRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accessibility request not found"
        )
    return req

@router.post("", response_model=AccessibilityRequestRead, status_code=status.HTTP_201_CREATED)
def create_accessibility_request(
    request_in: AccessibilityRequestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new accessibility request."""
    req = AccessibilityRequest(**request_in.dict())
    db.add(req)
    db.commit()
    db.refresh(req)

    # Broadcast to all connected clients
    req_dict = AccessibilityRequestRead.from_orm(req).dict()
    emit_event_async(EventType.ACCESSIBILITY_REQUEST, {**req_dict, "action": "created"})
    emit_dashboard_kpi_async(db)

    return req

@router.put("/{request_id}", response_model=AccessibilityRequestRead)
def update_accessibility_request(
    request_id: uuid.UUID,
    request_data: AccessibilityRequestUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update details of an accessibility request."""
    req = db.query(AccessibilityRequest).filter(AccessibilityRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accessibility request not found"
        )
    for key, value in request_data.dict(exclude_unset=True).items():
        if hasattr(req, key):
            setattr(req, key, value)
    db.commit()
    db.refresh(req)

    # Broadcast update
    req_dict = AccessibilityRequestRead.from_orm(req).dict()
    event_type = EventType.ACCESSIBILITY_RESOLVED if req.status == 'resolved' else EventType.ACCESSIBILITY_REQUEST
    emit_event_async(event_type, {**req_dict, "action": "updated"})
    emit_dashboard_kpi_async(db)

    return req

@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_accessibility_request(
    request_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an accessibility request."""
    req = db.query(AccessibilityRequest).filter(AccessibilityRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Accessibility request not found"
        )
    db.delete(req)
    db.commit()

    # Broadcast deletion
    emit_event_async(EventType.ACCESSIBILITY_RESOLVED, {"id": str(request_id), "action": "deleted"})
    emit_dashboard_kpi_async(db)

    return None
