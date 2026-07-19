# backend/models/accessibility_request.py
"""AccessibilityRequest model for spectator assistance requests."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SAEnum, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.session import Base
import enum

class RequestPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELED = "canceled"

class AccessibilityRequest(Base):
    __tablename__ = "accessibility_requests"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    spectator_name = Column(String, nullable=False)
    match_id = Column(UUID(as_uuid=True), ForeignKey("matches.id"), nullable=False)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=True)
    category = Column(String, nullable=False)  # e.g., wheelchair, escort, etc.
    priority = Column(SAEnum(RequestPriority), nullable=False, default=RequestPriority.MEDIUM)
    status = Column(SAEnum(RequestStatus), nullable=False, default=RequestStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    match = relationship("Match", backref="accessibility_requests")
    zone = relationship("Zone", back_populates="accessibility_requests")
