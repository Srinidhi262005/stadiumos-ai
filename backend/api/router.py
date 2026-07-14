from fastapi import APIRouter
from .routers import (
    auth,
    dashboard,
    crowd,
    incidents,
    volunteers,
    accessibility,
    sustainability,
    reports,
    notifications,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(crowd.router, prefix="/crowd", tags=["crowd"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
api_router.include_router(volunteers.router, prefix="/volunteers", tags=["volunteers"])
api_router.include_router(accessibility.router, prefix="/accessibility", tags=["accessibility"])
api_router.include_router(sustainability.router, prefix="/sustainability", tags=["sustainability"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
