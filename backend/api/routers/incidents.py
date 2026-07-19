# backend/api/routers/incidents.py
"""Incidents router providing list, creation, detail updates, and deletion."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.session import get_db
from backend.models.incident import Incident
from backend.schemas.incident import IncidentRead, IncidentCreate, IncidentUpdate
from backend.core.permissions import get_current_user
from backend.core.events import emit_event_async, emit_dashboard_kpi_async
from backend.core.websocket import EventType

router = APIRouter()

@router.get("", response_model=List[IncidentRead])
def get_incidents(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all incidents."""
    return db.query(Incident).all()

@router.post("", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Report a new incident."""
    incident = Incident(**incident_in.dict())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    # Emit WebSocket event for real-time updates
    incident_dict = IncidentRead.from_orm(incident).dict()
    emit_event_async(EventType.INCIDENT_CREATED, incident_dict)
    emit_dashboard_kpi_async(db)

    return incident

@router.put("/{incident_id}", response_model=IncidentRead)
def update_incident(
    incident_id: uuid.UUID,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update incident attributes (severity, description, status, assigned_team etc.)."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    update_data = incident_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(incident, key):
            setattr(incident, key, value)

    db.commit()
    db.refresh(incident)
    
    # Emit WebSocket event for real-time updates
    incident_dict = IncidentRead.from_orm(incident).dict()
    event_type = EventType.INCIDENT_RESOLVED if incident.status == 'resolved' else EventType.INCIDENT_UPDATED
    emit_event_async(event_type, incident_dict)
    emit_dashboard_kpi_async(db)

    return incident

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete an incident."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found"
        )

    db.delete(incident)
    db.commit()
    
    # Emit WebSocket event for real-time updates
    emit_event_async(EventType.INCIDENT_DELETED, {"id": str(incident_id)})
    emit_dashboard_kpi_async(db)

    return None
