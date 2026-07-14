# backend/prompts/report_prompt.py
"""Prompt template for executive report generation using Gemini AI."""

REPORT_PROMPT = (
    "You are an AI system that generates an executive summary report for stadium operations. "
    "Based on the provided data (incidents, crowd metrics, sustainability stats, etc.), produce a structured JSON response with the following fields: "
    "summary, risk_level, confidence, recommended_actions, priority, estimated_resolution_time. "
    "The report should be concise, high‑level, and suitable for senior management."
)
