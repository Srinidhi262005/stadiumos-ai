# backend/database/seed.py
"""Seed script for populating the database with mock telemetry and setup data."""
import sys
from pathlib import Path
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add project root to sys.path if running directly
backend_dir = Path(__file__).resolve().parents[2]
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.database.session import SessionLocal, Base, engine
from backend.models import (
    User, Role, Match, Zone, Telemetry, Incident, Volunteer,
    Assignment, AccessibilityRequest, SustainabilityMetric, Notification, AuditLog
)
from backend.models.role import RoleEnum
from backend.models.incident import IncidentSeverity
from backend.models.accessibility_request import RequestPriority, RequestStatus
from backend.models.sustainability_metric import MetricType
from backend.core.security import get_password_hash

def seed_db(db: Session):
    # 1. Seed Roles
    print("Seeding roles...")
    roles_map = {}
    for role_name in RoleEnum:
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        if not existing_role:
            role_obj = Role(name=role_name)
            db.add(role_obj)
            db.flush()
            roles_map[role_name] = role_obj
        else:
            roles_map[role_name] = existing_role
    
    # 2. Seed Users
    print("Seeding users...")
    password_hash = get_password_hash("password123")
    users_data = [
        {"email": "admin@stadiumos.com", "role": RoleEnum.ADMIN},
        {"email": "ops@stadiumos.com", "role": RoleEnum.STAFF},
        {"email": "volunteer@stadiumos.com", "role": RoleEnum.VOLUNTEER},
    ]
    for u_data in users_data:
        existing_user = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing_user:
            user_obj = User(
                email=u_data["email"],
                hashed_password=password_hash,
                role_id=roles_map[u_data["role"]].id
            )
            db.add(user_obj)
            db.flush()

    # 3. Seed Matches
    print("Seeding matches...")
    existing_match = db.query(Match).first()
    if not existing_match:
        match_obj = Match(
            name="FIFA World Cup 2026: USA vs England",
            start_time=datetime.utcnow() + timedelta(hours=2),
            end_time=datetime.utcnow() + timedelta(hours=4)
        )
        db.add(match_obj)
        db.flush()
    else:
        match_obj = existing_match

    # 4. Seed Zones
    print("Seeding zones...")
    zones_list = [
        "North Stand", "South Stand", "East Stand", "West Stand",
        "VIP Zone", "Food Court", "Gate A", "Gate B", "Gate C", "Gate D"
    ]
    zones_map = {}
    for z_name in zones_list:
        existing_zone = db.query(Zone).filter(Zone.name == z_name, Zone.match_id == match_obj.id).first()
        if not existing_zone:
            zone_obj = Zone(name=z_name, match_id=match_obj.id)
            db.add(zone_obj)
            db.flush()
            zones_map[z_name] = zone_obj
        else:
            zones_map[z_name] = existing_zone

    # 5. Seed Volunteers
    print("Seeding volunteers...")
    volunteers_data = [
        {"name": "Volunteer Alice", "email": "alice@stadiumos.com", "phone": "+15550101"},
        {"name": "Volunteer Bob", "email": "bob@stadiumos.com", "phone": "+15550102"},
        {"name": "Volunteer Charlie", "email": "charlie@stadiumos.com", "phone": "+15550103"},
    ]
    v_objs = []
    for v_data in volunteers_data:
        existing_v = db.query(Volunteer).filter(Volunteer.email == v_data["email"]).first()
        if not existing_v:
            v_obj = Volunteer(
                name=v_data["name"],
                email=v_data["email"],
                phone=v_data["phone"],
                is_active=True
            )
            db.add(v_obj)
            db.flush()
            v_objs.append(v_obj)
        else:
            v_objs.append(existing_v)

    # 6. Seed Incidents
    print("Seeding incidents...")
    existing_incident = db.query(Incident).first()
    if not existing_incident:
        incident_obj = Incident(
            match_id=match_obj.id,
            zone_id=zones_map["Gate A"].id,
            description="Unauthorized access detected near gate.",
            category="Security",
            severity=IncidentSeverity.HIGH,
            status="in-progress",
            crowd_impact="Potential congestion",
            assigned_team="Team Alpha"
        )
        db.add(incident_obj)
        db.flush()

        incident_obj2 = Incident(
            match_id=match_obj.id,
            zone_id=zones_map["VIP Zone"].id,
            description="Ambulance arrival required for minor injury.",
            category="Medical",
            severity=IncidentSeverity.CRITICAL,
            status="detected",
            crowd_impact="Low",
            assigned_team="Medical Team"
        )
        db.add(incident_obj2)
        db.flush()

        incident_obj3 = Incident(
            match_id=match_obj.id,
            zone_id=zones_map["East Stand"].id,
            description="Queue forming near concession.",
            category="Crowd",
            severity=IncidentSeverity.MEDIUM,
            status="in-progress",
            crowd_impact="Moderate",
            assigned_team="Team Beta"
        )
        db.add(incident_obj3)
        db.flush()

    # 7. Seed Accessibility Requests
    print("Seeding accessibility requests...")
    existing_accessibility = db.query(AccessibilityRequest).first()
    if not existing_accessibility:
        ar_obj1 = AccessibilityRequest(
            spectator_name="John Smith",
            match_id=match_obj.id,
            zone_id=zones_map["North Stand"].id,
            category="wheelchair",
            priority=RequestPriority.HIGH,
            status=RequestStatus.PENDING
        )
        db.add(ar_obj1)
        db.flush()

        ar_obj2 = AccessibilityRequest(
            spectator_name="Maria Garcia",
            match_id=match_obj.id,
            zone_id=zones_map["East Stand"].id,
            category="escort",
            priority=RequestPriority.MEDIUM,
            status=RequestStatus.IN_PROGRESS
        )
        db.add(ar_obj2)
        db.flush()

    # 8. Seed Sustainability Metrics
    print("Seeding sustainability metrics...")
    existing_sustainability = db.query(SustainabilityMetric).first()
    if not existing_sustainability:
        for z_name, zone_obj in zones_map.items():
            db.add(SustainabilityMetric(zone_id=zone_obj.id, metric_type=MetricType.ENERGY, value=25000.0, measured_at=datetime.utcnow()))
            db.add(SustainabilityMetric(zone_id=zone_obj.id, metric_type=MetricType.WATER, value=12000.0, measured_at=datetime.utcnow()))
            db.add(SustainabilityMetric(zone_id=zone_obj.id, metric_type=MetricType.WASTE, value=0.75, measured_at=datetime.utcnow()))
        db.flush()

    db.commit()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        # Create tables first
        Base.metadata.create_all(bind=engine)
        seed_db(db)
    finally:
        db.close()
