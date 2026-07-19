# backend/api/routers/sustainability.py
"""Sustainability router with real-time WebSocket broadcasts on CREATE/UPDATE/DELETE."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.session import get_db
from backend.models.sustainability_metric import SustainabilityMetric
from backend.schemas.sustainability import SustainabilityMetricRead, SustainabilityMetricCreate, SustainabilityMetricUpdate
from backend.core.permissions import get_current_user
from backend.core.events import emit_event_async
from backend.core.websocket import EventType

router = APIRouter()

@router.get("", response_model=List[SustainabilityMetricRead])
def get_sustainability_metrics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all sustainability metrics."""
    return db.query(SustainabilityMetric).all()

@router.get("/{metric_id}", response_model=SustainabilityMetricRead)
def get_sustainability_metric(
    metric_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve specific sustainability metric by ID."""
    metric = db.query(SustainabilityMetric).filter(SustainabilityMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )
    return metric

@router.post("", response_model=SustainabilityMetricRead, status_code=status.HTTP_201_CREATED)
def create_sustainability_metric(
    metric_in: SustainabilityMetricCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Record a new sustainability metric."""
    metric = SustainabilityMetric(**metric_in.dict())
    db.add(metric)
    db.commit()
    db.refresh(metric)

    # Broadcast new metric to all clients
    metric_dict = SustainabilityMetricRead.from_orm(metric).dict()
    emit_event_async(EventType.SUSTAINABILITY_METRIC, {**metric_dict, "action": "created"})

    return metric

@router.put("/{metric_id}", response_model=SustainabilityMetricRead)
def update_sustainability_metric(
    metric_id: uuid.UUID,
    metric_data: SustainabilityMetricUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update details of a recorded sustainability metric."""
    metric = db.query(SustainabilityMetric).filter(SustainabilityMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )
    for key, value in metric_data.dict(exclude_unset=True).items():
        if hasattr(metric, key):
            setattr(metric, key, value)
    db.commit()
    db.refresh(metric)

    # Broadcast update
    metric_dict = SustainabilityMetricRead.from_orm(metric).dict()
    emit_event_async(EventType.SUSTAINABILITY_UPDATE, {**metric_dict, "action": "updated"})

    return metric

@router.delete("/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sustainability_metric(
    metric_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a sustainability metric."""
    metric = db.query(SustainabilityMetric).filter(SustainabilityMetric.id == metric_id).first()
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metric not found"
        )
    db.delete(metric)
    db.commit()

    # Broadcast deletion
    emit_event_async(EventType.SUSTAINABILITY_UPDATE, {"id": str(metric_id), "action": "deleted"})

    return None
