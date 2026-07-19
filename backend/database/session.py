import os
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from ..core.config import settings

# Create engine based on DATABASE_URL; default to SQLite for development
connect_args = {}
if str(settings.DATABASE_URL).startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    str(settings.DATABASE_URL),
    connect_args=connect_args,
    echo=False,
    future=True,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db() -> AsyncGenerator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
