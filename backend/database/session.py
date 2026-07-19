import os
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from core.config import settings

# Create engine based on DATABASE_URL; default to SQLite for development.
# In serverless environments like Vercel, prefer /tmp for SQLite file storage.
database_url = str(settings.DATABASE_URL)
if database_url.startswith("sqlite:///"):
    connect_args = {"check_same_thread": False}
    sqlite_path = database_url[len("sqlite:///"):]
    if (
        sqlite_path
        and not Path(sqlite_path).is_absolute()
        and (os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
    ):
        database_url = "sqlite:////tmp/stadiumos.db"
else:
    connect_args = {}

engine = create_engine(
    database_url,
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
