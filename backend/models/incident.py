# backend/models/incident.py
"""Incident model representing an event occurring during a match in a specific zone."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.session import Base
import enum

class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False, default="Security")
    status = Column(String, nullable=False, default="detected")
    crowd_impact = Column(String, nullable=True, default="Low")
    assigned_team = Column(String, nullable=True)
    severity = Column(SAEnum(IncidentSeverity), nullable=False, default=IncidentSeverity.MEDIUM)
    reported_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("Match", back_populates="incidents")
    zone = relationship("Zone", back_populates="incidents")
    assignments = relationship("Assignment", back_populates="incident")
