# backend/api/routers/dashboard.py
from fastapi import APIRouter

router = APIRouter()

@router.get('/ping')
async def ping():
    return {"message": "dashboard placeholder"}
