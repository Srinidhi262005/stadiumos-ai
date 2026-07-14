"""Core dependencies for FastAPI routes.
Provides common dependencies like DB session and current user placeholder.
"""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database.session import get_db

def get_current_user():
    """Placeholder dependency for authentication.
    Raises 401 Unauthorized. Real implementation will verify JWT.
    """
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication not implemented",
        headers={"WWW-Authenticate": "Bearer"},
    )

# Example usage in routes:
# def some_route(db: Session = Depends(get_db), user: dict = Depends(get_current_user)):
#     ...
