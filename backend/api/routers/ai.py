# backend/api/routers/ai.py
"""AI operational intelligence endpoints.

All endpoints accept a generic JSON payload and return the structured JSON
response produced by the Gemini service.
"""

from __future__ import annotations

from fastapi import APIRouter, Body, Depends
from typing import Any, Dict

from backend.services.gemini_service import GeminiService, get_gemini_service

router = APIRouter()

@router.post("/incident")
def analyze_incident(data: Dict[str, Any] = Body(...), service: GeminiService = Depends(get_gemini_service)) -> Dict[str, Any]:
    """Incident analysis endpoint.
    ``data`` should contain incident‑specific fields required by the prompt.
    """
    return service.analyze_incident(data)

@router.post("/crowd")
def predict_crowd(data: Dict[str, Any] = Body(...), service: GeminiService = Depends(get_gemini_service)) -> Dict[str, Any]:
    """Crowd prediction endpoint."""
    return service.predict_crowd(data)

@router.post("/volunteer")
def recommend_volunteer(data: Dict[str, Any] = Body(...), service: GeminiService = Depends(get_gemini_service)) -> Dict[str, Any]:
    """Volunteer assignment recommendation endpoint."""
    return service.recommend_volunteer(data)

@router.post("/accessibility")
def recommend_accessibility_route(data: Dict[str, Any] = Body(...), service: GeminiService = Depends(get_gemini_service)) -> Dict[str, Any]:
    """Accessibility route recommendation endpoint."""
    return service.recommend_accessibility_route(data)

@router.post("/sustainability")
def analyze_sustainability(data: Dict[str, Any] = Body(...), service: GeminiService = Depends(get_gemini_service)) -> Dict[str, Any]:
    """Sustainability recommendation endpoint."""
    return service.analyze_sustainability(data)

@router.post("/report")
def generate_executive_report(data: Dict[str, Any] = Body(...), service: GeminiService = Depends(get_gemini_service)) -> Dict[str, Any]:
    """Executive report generation endpoint."""
    return service.generate_executive_report(data)
