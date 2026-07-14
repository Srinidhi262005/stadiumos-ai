"""Crowd router placeholder.
Provides a simple ping endpoint for health checking.
"""

from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
async def ping():
    return {"message": "crowd placeholder"}
