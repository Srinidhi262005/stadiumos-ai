# backend/prompts/accessibility_prompt.py
"""Prompt template for accessibility route recommendation using Gemini AI."""

ACCESSIBILITY_PROMPT = (
    "You are an AI system that provides accessibility route recommendations inside a stadium. "
    "Based on venue layout and crowd data, produce a structured JSON response with fields: "
    "summary, risk_level, confidence, recommended_actions, priority, estimated_resolution_time. "
    "Include guidance for wheelchair users, visually impaired, and other accessibility needs."
)
