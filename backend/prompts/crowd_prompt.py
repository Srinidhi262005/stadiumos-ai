# backend/prompts/crowd_prompt.py
"""Prompt template for crowd prediction using Gemini AI."""

CROWD_PROMPT = (
    "You are an AI system that predicts crowd density and movement patterns for a stadium. "
    "Given the current crowd data, provide a structured JSON response with fields: "
    "summary, risk_level, confidence, recommended_actions, priority, estimated_resolution_time. "
    "Include predictions on peak times, bottlenecks, and safety recommendations."
)
