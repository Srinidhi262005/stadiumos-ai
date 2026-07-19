# backend/models/sustainability_metric.py
"""SustainabilityMetric model for tracking environmental metrics per zone."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database.session import Base
import enum

class MetricType(str, enum.Enum):
    ENERGY = "energy"
    WATER = "water"
    WASTE = "waste"
    CARBON = "carbon"

class SustainabilityMetric(Base):
    __tablename__ = "sustainability_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    zone_id = Column(UUID(as_uuid=True), ForeignKey("zones.id"), nullable=False)
    metric_type = Column(SAEnum(MetricType), nullable=False)
    value = Column(Float, nullable=False)
    measured_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    zone = relationship("Zone", back_populates="sustainability_metrics")
