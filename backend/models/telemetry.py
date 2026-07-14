# backend/models/telemetry.py
"""Telemetry model for sensor data within a match and zone."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database.session import Base

class Telemetry(Base):
    __tablename__ = "telemetry"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=True)
    metric_name = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("Match", back_populates="telemetry")
    zone = relationship("Zone", back_populates="telemetry")
