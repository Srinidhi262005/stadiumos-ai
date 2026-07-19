# backend/main.py
"""App startup, database initialization, CORS settings, and route registrations."""
import sys
from pathlib import Path
import asyncio
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

# Ensure the project root is on sys.path when Vercel places `main.py` at the
# deployment root. This prevents `ModuleNotFoundError: No module named 'backend'`.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from core.config import settings
from core.logging import logger
from core.websocket import get_connection_manager, get_broadcast_service, EventType
from api.router import api_router
from database.session import Base, engine, SessionLocal
from database.seed import seed_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Background task to send periodic heartbeats
async def heartbeat_task():
    """Send periodic heartbeats to all connected clients."""
    connection_manager = get_connection_manager()
    while True:
        try:
            await asyncio.sleep(30)
            await connection_manager.heartbeat()
        except Exception as e:
            logger.error(f"Heartbeat task error: {e}")

@app.on_event("startup")
async def startup_event():
    """Initializes tables, seeds records, and starts background tasks."""
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_db(db)
        except Exception as e:
            logger.error("Database seed failed", exc_info=True)
        finally:
            db.close()
    except Exception as exc:
        logger.error("Database initialization failed", exc_info=True)

    # Start WebSocket heartbeat task
    # Starting background heartbeat tasks in serverless environments can
    # cause function invocation issues. Only start in long-running servers.
    logger.info("Skipping heartbeat background task in serverless deployment")
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    logger.info("Application shutting down...")
    connection_manager = get_connection_manager()
    logger.info(f"Closing {connection_manager.get_active_connections_count()} WebSocket connections...")
    # Connections will be closed as they disconnect

@app.get("/")
async def root():
    """Service root redirection manifest."""
    return {
        "message": "Welcome to StadiumOS AI Backend",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION,
    }

@app.get("/health")
async def health_check():
    """API health status probe."""
    logger.info("Health check called")
    return {
        "status": "ok",
        "service": "backend",
        "environment": settings.ENVIRONMENT,
    }

@app.get(f"{settings.API_V1_STR}/health")
async def health_check_v1():
    """API health probe alias under versioned prefix."""
    return await health_check()

# Register the versioned endpoint router
app.include_router(api_router, prefix=settings.API_V1_STR)
