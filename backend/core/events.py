"""Utilities for emitting WebSocket events from CRUD operations."""
import asyncio
from typing import Dict, Any, Optional

from sqlalchemy.orm import Session

from core.websocket import get_broadcast_service, EventType


def emit_event_async(
    event_type: EventType,
    data: Dict[str, Any],
    user_id: Optional[str] = None,
):
    """
    Emit a WebSocket event asynchronously without blocking the request.

    This function schedules the event emission to happen in the background.
    """
    try:
        service = get_broadcast_service()
        asyncio.create_task(
            service.emit(event_type, data, user_id=user_id, broadcast=True)
        )
    except Exception as e:
        from core.logging import logger
        logger.error(f"Error emitting WebSocket event {event_type.value}: {e}")


def get_dashboard_kpi(db: Session) -> Dict[str, Any]:
    """Compute consolidated dashboard KPIs for realtime broadcast."""
    from models.incident import Incident
    from models.volunteer import Volunteer
    from models.accessibility_request import AccessibilityRequest
    from models.match import Match

    active_incidents = db.query(Incident).filter(Incident.status != "resolved").count()
    critical_incidents = db.query(Incident).filter(
        Incident.severity == "critical", Incident.status != "resolved"
    ).count()
    total_volunteers = db.query(Volunteer).filter(Volunteer.is_active == True).count()
    open_accessibility = db.query(AccessibilityRequest).filter(
        AccessibilityRequest.status == "pending"
    ).count()
    match = db.query(Match).first()
    match_name = match.name if match else "No Active Match"

    return {
        "active_incidents": active_incidents,
        "critical_incidents": critical_incidents,
        "total_volunteers": total_volunteers,
        "open_accessibility_requests": open_accessibility,
        "active_match": match_name,
        "medical_response_time_min": 2.4,
        "volunteer_coverage_pct": 92,
        "accessibility_score_pct": 88,
        "operational_readiness_pct": 96,
    }


def emit_dashboard_kpi_async(db: Session):
    """Broadcast updated dashboard KPIs to all connected clients."""
    try:
        stats = get_dashboard_kpi(db)
        emit_event_async(EventType.DASHBOARD_KPI, stats)
    except Exception as e:
        from core.logging import logger
        logger.error(f"Error emitting dashboard KPI update: {e}")
