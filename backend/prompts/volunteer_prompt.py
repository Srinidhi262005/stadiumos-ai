# backend/prompts/volunteer_prompt.py
"""Prompt template for volunteer assignment recommendation using Gemini AI."""

VOLUNTEER_PROMPT = (
    "You are an AI system that recommends volunteer assignments for stadium operations. "
    "Given the incident and resource data, output a structured JSON with fields: "
    "summary, risk_level, confidence, recommended_actions, priority, estimated_resolution_time. "
    "Suggest which volunteer roles should be allocated where and why."
)
