# backend/api/routers/dashboard.py
"""Dashboard router providing aggregated KPIs, timelines, and status metrics."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import uuid

from database.session import get_db
from models.incident import Incident
from models.volunteer import Volunteer
from models.accessibility_request import AccessibilityRequest
from models.match import Match
from core.permissions import get_current_user

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve consolidated KPIs and statistics for the AI Command Center."""
    # Count active incidents
    active_incidents = db.query(Incident).filter(Incident.status != "resolved").count()
    critical_incidents = db.query(Incident).filter(Incident.severity == "critical", Incident.status != "resolved").count()
    
    # Count active volunteers
    total_volunteers = db.query(Volunteer).filter(Volunteer.is_active == True).count()
    
    # Count open accessibility requests
    open_accessibility = db.query(AccessibilityRequest).filter(AccessibilityRequest.status == "pending").count()
    
    # Get active match
    match = db.query(Match).first()
    match_name = match.name if match else "No Active Match"
    
    return {
        "active_incidents": active_incidents,
        "critical_incidents": critical_incidents,
        "total_volunteers": total_volunteers,
        "open_accessibility_requests": open_accessibility,
        "active_match": match_name,
        "medical_response_time_min": 2.4, # standard baseline
        "volunteer_coverage_pct": 92, # simulated target
        "accessibility_score_pct": 88, # standard target
        "operational_readiness_pct": 96 # simulated target
    }

@router.get("/timeline")
def get_dashboard_timeline(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve operational timeline events for the dashboard."""
    # Aggregate incidents and actions into a sequential log format
    incidents = db.query(Incident).order_by(Incident.reported_at.desc()).limit(5).all()
    events = []
    for inc in incidents:
        events.append({
            "id": str(inc.id),
            "title": f"Incident: {inc.category}",
            "description": inc.description,
            "timestamp": inc.reported_at.strftime("%H:%M"),
            "category": "incident",
            "severity": inc.severity.value
        })
    
    # Fallback to standard flow events if database is empty
    if not events:
        events = [
            { "id": "tl-1", "title": "Gates Opened", "description": "Stadium gates opened", "timestamp": "08:00", "category": "system", "severity": "info" },
            { "id": "tl-2", "title": "Security Sweep", "description": "Security sweep completed", "timestamp": "09:30", "category": "system", "severity": "success" }
        ]
    return events
