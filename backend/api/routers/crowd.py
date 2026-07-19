# backend/api/routers/crowd.py
"""Crowd telemetry router providing CRUD operations and zone aggregate statistics."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from database.session import get_db
from models.crowd import CrowdEvent
from schemas.crowd import CrowdEventRead, CrowdEventCreate
from core.permissions import get_current_user
from core.events import emit_event_async
from core.websocket import EventType

router = APIRouter()


def _telemetry_event_payload(entry: Telemetry, zone: Zone | None, action: str) -> dict:
    """Build WebSocket payload for crowd telemetry changes."""
    return {
        "id": str(entry.id),
        "zone_id": str(entry.zone_id) if entry.zone_id else None,
        "zone_name": zone.name if zone else "Unknown",
        "match_id": str(entry.match_id),
        "metric_name": entry.metric_name,
        "value": entry.value,
        "action": action,
    }


def _emit_crowd_telemetry_event(db: Session, entry: Telemetry, action: str):
    """Broadcast crowd telemetry updates to connected clients."""
    zone = db.query(Zone).filter(Zone.id == entry.zone_id).first() if entry.zone_id else None
    payload = _telemetry_event_payload(entry, zone, action)

    if entry.metric_name == "gate_status":
        emit_event_async(EventType.CROWD_GATE_STATUS, {
            "gate_name": zone.name if zone else "Unknown",
            "status": "closed" if entry.value <= 0 else "open" if entry.value >= 2 else "restricted",
            **payload,
        })
    elif entry.metric_name == "density":
        emit_event_async(EventType.CROWD_DENSITY_UPDATE, payload)
    else:
        emit_event_async(EventType.CROWD_ZONE_UPDATE, payload)

    emit_dashboard_kpi_async(db)


@router.get("", response_model=List[TelemetryRead])
def get_crowd_telemetry(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all crowd telemetry records."""
    return db.query(Telemetry).all()


@router.get("/summary")
def get_crowd_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve zone-by-zone crowd summary mapping for dashboard/twin maps."""
    zones = db.query(Zone).all()
    summary = {}
    for zone in zones:
        metrics = db.query(Telemetry).filter(Telemetry.zone_id == zone.id).all()
        zone_metrics = {
            "currentDensity": "0%",
            "predictedDensity": "0%",
            "queueLength": "0 mins",
            "entryRate": "0/min",
            "exitRate": "0/min",
            "occupancy": "0%",
            "trend": "Stable"
        }
        for metric in metrics:
            if metric.metric_name == "density":
                zone_metrics["currentDensity"] = f"{int(metric.value)}%"
            elif metric.metric_name == "queue_length":
                zone_metrics["queueLength"] = f"{int(metric.value)} mins"
            elif metric.metric_name == "entry_rate":
                zone_metrics["entryRate"] = f"{int(metric.value)}/min"
            elif metric.metric_name == "exit_rate":
                zone_metrics["exitRate"] = f"{int(metric.value)}/min"
            elif metric.metric_name == "occupancy":
                zone_metrics["occupancy"] = f"{int(metric.value)}%"
        summary[zone.name] = zone_metrics
    return summary


@router.get("/{telemetry_id}", response_model=TelemetryRead)
def get_telemetry_entry(
    telemetry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve details of a specific telemetry entry."""
    entry = db.query(Telemetry).filter(Telemetry.id == telemetry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Telemetry entry not found"
        )
    return entry


@router.post("", response_model=TelemetryRead, status_code=status.HTTP_201_CREATED)
def create_telemetry_entry(
    telemetry_in: TelemetryCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Record a new telemetry metric."""
    entry = Telemetry(**telemetry_in.dict())
    db.add(entry)
    db.commit()
    db.refresh(entry)

    _emit_crowd_telemetry_event(db, entry, "created")
    return entry


@router.put("/{telemetry_id}", response_model=TelemetryRead)
def update_telemetry_entry(
    telemetry_id: uuid.UUID,
    telemetry_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update details of a telemetry entry."""
    entry = db.query(Telemetry).filter(Telemetry.id == telemetry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Telemetry entry not found"
        )
    for key, value in telemetry_data.items():
        if hasattr(entry, key):
            setattr(entry, key, value)
    db.commit()
    db.refresh(entry)

    _emit_crowd_telemetry_event(db, entry, "updated")
    return entry


@router.delete("/{telemetry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_telemetry_entry(
    telemetry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a telemetry entry."""
    entry = db.query(Telemetry).filter(Telemetry.id == telemetry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Telemetry entry not found"
        )

    zone = db.query(Zone).filter(Zone.id == entry.zone_id).first() if entry.zone_id else None
    payload = _telemetry_event_payload(entry, zone, "deleted")

    db.delete(entry)
    db.commit()

    emit_event_async(EventType.CROWD_ZONE_UPDATE, payload)
    emit_dashboard_kpi_async(db)
    return None
