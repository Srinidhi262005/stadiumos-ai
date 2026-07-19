# backend/api/routers/matches.py
"""Matches router providing list and detail endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database.session import get_db
from backend.models.match import Match
from backend.schemas.match import MatchRead
from backend.core.permissions import get_current_user

router = APIRouter()

@router.get("", response_model=List[MatchRead])
def get_matches(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all matches."""
    return db.query(Match).all()

@router.get("/{match_id}", response_model=MatchRead)
def get_match(
    match_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Retrieve details of a specific match."""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )
    return match
