# backend/models/assignment.py
"""Assignment model linking volunteers to incidents or tasks within a match/zone."""
import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.session import Base

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=True)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=True)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=True)
    role = Column(String, nullable=False)  # e.g., "first_responder", "support"
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    volunteer = relationship("Volunteer", back_populates="assignments")
    incident = relationship("Incident", back_populates="assignments")
    match = relationship("Match", back_populates="assignments")
    zone = relationship("Zone", back_populates="assignments")
