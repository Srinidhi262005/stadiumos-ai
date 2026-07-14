# backend/models/role.py
"""Role model representing user roles."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database.session import Base
import enum

class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    VOLUNTEER = "volunteer"
    GUEST = "guest"

class Role(Base):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(SAEnum(RoleEnum), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="role")
