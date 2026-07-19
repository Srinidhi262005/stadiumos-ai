"""Deployment entrypoint for Vercel: expose `app` from `backend.main`.

This wrapper ensures the project root is on `sys.path` so imports like
`backend.core.config` work when Vercel places the module at the deployment
root.
"""
import sys
from pathlib import Path

# Add repo root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.main import app  # noqa: E402,F401
