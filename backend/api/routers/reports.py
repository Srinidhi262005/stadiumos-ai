# backend/api/routers/reports.py
"""Reports and audit logs router providing creation, list, updates, deletion, and audit trail retrieval."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.session import get_db
from backend.models.report import Report
from backend.models.audit_log import AuditLog
from backend.schemas.report import ReportRead, ReportCreate
from backend.schemas.audit_log import AuditLogRead
from backend.core.permissions import get_current_user
from backend.core.events import emit_event_async
from backend.core.websocket import EventType

router = APIRouter()


@router.get("", response_model=List[ReportRead])
def get_reports(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all reports."""
    return db.query(Report).all()


@router.get("/logs", response_model=List[AuditLogRead])
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all system audit logs."""
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()


@router.get("/{report_id}", response_model=ReportRead)
def get_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve specific report details."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    return report


@router.post("", response_model=ReportRead, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Generate a new report record."""
    report_data = report_in.dict()
    report_data.pop("zone_id", None)
    report = Report(**report_data)
    db.add(report)
    db.commit()
    db.refresh(report)

    report_dict = ReportRead.from_orm(report).dict()
    emit_event_async(EventType.REPORT_CREATED, {**report_dict, "action": "created"})
    return report


@router.put("/{report_id}", response_model=ReportRead)
def update_report(
    report_id: uuid.UUID,
    report_data: dict,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update report metadata."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    for key, value in report_data.items():
        if hasattr(report, key):
            setattr(report, key, value)
    db.commit()
    db.refresh(report)
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    db.delete(report)
    db.commit()

    emit_event_async(EventType.REPORT_DELETED, {"id": str(report_id), "action": "deleted"})
    return None
