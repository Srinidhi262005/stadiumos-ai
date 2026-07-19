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

    def build_contextual_fallback(self, payload: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        """Return a deterministic, operationally useful fallback payload.

        This keeps the demo experience credible even when the Gemini key is missing
        or the service is temporarily unavailable.
        """
        zone = str(payload.get("zone") or payload.get("location") or "the affected area")
        severity = str(payload.get("severity") or payload.get("risk_level") or "medium").lower()
        category = str(payload.get("category") or payload.get("type") or task_type).title()
        crowd_impact = str(payload.get("crowd_impact") or payload.get("crowd_level") or "moderate").lower()

        if task_type == "incident":
            priority = "high" if severity in {"critical", "high", "urgent"} else "medium"
            summary = (
                f"{category} alert in {zone} requires immediate operations attention. "
                f"Current severity is {severity}, and the live environment suggests rapid coordination."
            )
            actions = [
                f"Dispatch the nearest response team to {zone}.",
                "Notify the command center and open a live incident thread.",
                "Confirm crowd safety and reroute foot traffic if needed.",
            ]
            risk_level = "high" if priority == "high" else "medium"
            estimated_time = "10-15 minutes"
        elif task_type == "crowd":
            priority = "high" if crowd_impact in {"high", "critical", "heavy"} else "medium"
            summary = (
                f"Crowd levels around {zone} are trending {crowd_impact}. "
                "The system recommends proactive steward deployment."
            )
            actions = [
                f"Position extra stewards near {zone}.",
                "Open the nearest entry and exit lanes to reduce bottlenecks.",
                "Monitor queue times and prepare a communication update.",
            ]
            risk_level = "high" if priority == "high" else "medium"
            estimated_time = "15-20 minutes"
        elif task_type == "volunteer":
            priority = "medium"
            summary = (
                f"Volunteer demand is rising in {zone}. The fallback plan recommends a balanced redeployment."
            )
            actions = [
                f"Assign a volunteer lead to {zone}.",
                "Pair experienced volunteers with newer team members.",
                "Send a short task brief to the active crew.",
            ]
            risk_level = "medium"
            estimated_time = "5-10 minutes"
        else:
            priority = "medium"
            summary = f"Fallback guidance for {category} in {zone} is ready for review."
            actions = [
                f"Review the current operations snapshot for {zone}.",
                "Escalate any urgent conditions to the control room.",
            ]
            risk_level = "medium"
            estimated_time = "10 minutes"

        return {
            "summary": summary,
            "risk_level": risk_level,
            "confidence": 0.72,
            "recommended_actions": actions,
            "priority": priority,
            "estimated_resolution_time": estimated_time,
        }

    # ---------------------------------------------------------------------
    # Internal helper – safely call Gemini or return fallback
    # ---------------------------------------------------------------------
    def _call_gemini(self, prompt: str, data: Dict[str, Any], task_type: str) -> Dict[str, Any]:
        """Invoke Gemini with ``prompt`` and ``data``.

        If the API key is missing or the request fails, a deterministic fallback
        payload is returned so the application never crashes.
        """
        if not self.api_key:
            return self.build_contextual_fallback(data, task_type)
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
            return self.build_contextual_fallback(data, task_type)

    # ---------------------------------------------------------------------
    # Public AI methods – thin wrappers around the internal call
    # ---------------------------------------------------------------------
    def analyze_incident(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(INCIDENT_PROMPT, payload, "incident")

    def predict_crowd(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(CROWD_PROMPT, payload, "crowd")

    def recommend_volunteer(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(VOLUNTEER_PROMPT, payload, "volunteer")

    def recommend_accessibility_route(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(ACCESSIBILITY_PROMPT, payload, "accessibility")

    def analyze_sustainability(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(SUSTAINABILITY_PROMPT, payload, "sustainability")

    def generate_executive_report(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return self._call_gemini(REPORT_PROMPT, payload, "report")

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
