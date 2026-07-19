# backend/api/routers/volunteers.py
"""Volunteers router providing list, detail, creation, updates, and deletion of volunteers with real-time broadcast."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.session import get_db
from backend.models.volunteer import Volunteer
from backend.schemas.volunteer import VolunteerRead, VolunteerCreate, VolunteerUpdate
from backend.core.permissions import get_current_user
from backend.core.events import emit_event_async, emit_dashboard_kpi_async
from backend.core.websocket import EventType

router = APIRouter()

@router.get("", response_model=List[VolunteerRead])
def get_volunteers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all volunteers."""
    return db.query(Volunteer).all()

@router.get("/{volunteer_id}", response_model=VolunteerRead)
def get_volunteer(
    volunteer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve details of a specific volunteer."""
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    return volunteer

@router.post("", response_model=VolunteerRead, status_code=status.HTTP_201_CREATED)
def create_volunteer(
    volunteer_in: VolunteerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new volunteer."""
    existing_v = db.query(Volunteer).filter(Volunteer.email == volunteer_in.email).first()
    if existing_v:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Volunteer with this email already exists"
        )
    volunteer = Volunteer(**volunteer_in.dict())
    db.add(volunteer)
    db.commit()
    db.refresh(volunteer)

    # Broadcast volunteer creation to all connected clients
    volunteer_dict = VolunteerRead.from_orm(volunteer).dict()
    emit_event_async(EventType.VOLUNTEER_ASSIGNED, {**volunteer_dict, "action": "created"})
    emit_dashboard_kpi_async(db)

    return volunteer

@router.put("/{volunteer_id}", response_model=VolunteerRead)
def update_volunteer(
    volunteer_id: uuid.UUID,
    volunteer_data: VolunteerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update details of a volunteer."""
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    for key, value in volunteer_data.dict(exclude_unset=True).items():
        if hasattr(volunteer, key):
            setattr(volunteer, key, value)
    db.commit()
    db.refresh(volunteer)

    # Broadcast volunteer update
    volunteer_dict = VolunteerRead.from_orm(volunteer).dict()
    emit_event_async(EventType.VOLUNTEER_UPDATED, {**volunteer_dict, "action": "updated"})
    emit_dashboard_kpi_async(db)

    return volunteer

@router.delete("/{volunteer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_volunteer(
    volunteer_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a volunteer."""
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not volunteer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Volunteer not found"
        )
    db.delete(volunteer)
    db.commit()

    # Broadcast volunteer deletion
    emit_event_async(EventType.VOLUNTEER_UNASSIGNED, {"id": str(volunteer_id), "action": "deleted"})
    emit_dashboard_kpi_async(db)

    return None
