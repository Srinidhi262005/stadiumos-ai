# backend/models/zone.py
"""Zone model representing a physical area within a stadium."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.session import Base

class Zone(Base):
    __tablename__ = "zones"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("Match", back_populates="zones")
    telemetry = relationship("Telemetry", back_populates="zone")
    incidents = relationship("Incident", back_populates="zone")
    accessibility_requests = relationship("AccessibilityRequest", back_populates="zone")
    sustainability_metrics = relationship("SustainabilityMetric", back_populates="zone")
    assignments = relationship("Assignment", back_populates="zone")
