# backend/services/gemini_service.py
"""Reusable Gemini AI service for StadiumOS operational intelligence.

The service loads the Gemini API key from the ``GEMINI_API_KEY`` environment
variable. If the key is missing, all methods return a graceful fallback JSON
structure instead of raising an exception.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict

import requests

# Prompt templates – imported lazily to avoid circular imports
from ..prompts.incident_prompt import INCIDENT_PROMPT
from ..prompts.crowd_prompt import CROWD_PROMPT
from ..prompts.volunteer_prompt import VOLUNTEER_PROMPT
from ..prompts.accessibility_prompt import ACCESSIBILITY_PROMPT
from ..prompts.sustainability_prompt import SUSTAINABILITY_PROMPT
from ..prompts.report_prompt import REPORT_PROMPT


class GeminiService:
    """Thin wrapper around the Google Gemini generateContent endpoint.

    All public methods accept a ``payload`` dict with the data required for the
    specific AI task. The method returns a dict that conforms to the required
    structured JSON format (summary, risk_level, confidence, recommended_actions,
    priority, estimated_resolution_time).
    """

    _BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

    def __init__(self) -> None:
        self.api_key: str | None = os.getenv("GEMINI_API_KEY")
        # ``requests`` session can be reused for performance.
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    # ---------------------------------------------------------------------
    # Internal helper – safely call Gemini or return fallback
    # ---------------------------------------------------------------------
    def _call_gemini(self, prompt: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke Gemini with ``prompt`` and ``data``.

        If the API key is missing or the request fails, a deterministic fallback
        payload is returned so the application never crashes.
        """
        if not self.api_key:
            # Graceful fallback – callers can still rely on the expected keys.
            return {
                "summary": "Gemini API key not configured – fallback response.",
                "risk_level": "unknown",
                "confidence": 0,
                "recommended_actions": [],
                "priority": "low",
                "estimated_resolution_time": None,
            }
        try:
            # Gemini expects a JSON payload with a ``contents`` list.
            request_body = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{prompt}\nData: {json.dumps(data)}"}],
                    }
                ]
            }
            response = self.session.post(
                f"{self._BASE_URL}?key={self.api_key}",
                json=request_body,
                timeout=10,
            )
            response.raise_for_status()
            raw = response.json()
            # Extract the first text part from the response – Gemini returns a nested
            # structure. If parsing fails we fall back to a simple message.
            text = (
                raw.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            try:
                return json.loads(text)
            except Exception:
                # If the model did not output valid JSON, wrap the raw text.
                return {
                    "summary": text,
                    "risk_level": "unknown",
                    "confidence": 0,
                    "recommended_actions": [],
                    "priority": "low",
                    "estimated_resolution_time": None,
                }
        except Exception:
            # Any network or HTTP error results in the same safe fallback.
            return {
                "summary": "Error communicating with Gemini service.",
                "risk_level": "unknown",
                "confidence": 0,
                "recommended_actions": [],
                "priority": "low",
                "estimated_resolution_time": None,
            }

    # ---------------------------------------------------------------------
    # Public AI methods – thin wrappers around the internal call
    # ---------------------------------------------------------------------
    def analyze_incident(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(INCIDENT_PROMPT, payload)

    def predict_crowd(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(CROWD_PROMPT, payload)

    def recommend_volunteer(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(VOLUNTEER_PROMPT, payload)

    def recommend_accessibility_route(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(ACCESSIBILITY_PROMPT, payload)

    def analyze_sustainability(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(SUSTAINABILITY_PROMPT, payload)

    def generate_executive_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(REPORT_PROMPT, payload)

# Export a singleton for FastAPI dependency injection (lightweight, thread‑safe).

def get_gemini_service() -> GeminiService:
    """FastAPI dependency that provides a ``GeminiService`` instance.
    The function creates a new instance on each call – the underlying
    ``requests.Session`` is inexpensive and the service is stateless.
    """
    return GeminiService()
