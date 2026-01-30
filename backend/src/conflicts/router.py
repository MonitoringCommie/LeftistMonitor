"""Conflicts API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import date

from ..database import get_db
from ..core.pagination import PaginatedResponse
from pydantic import BaseModel

router = APIRouter()


class ConflictParticipantItem(BaseModel):
    country_id: Optional[str] = None
    name: str
    side: str
    
    class Config:
        from_attributes = True


class ConflictMapItem(BaseModel):
    id: str
    name: str
    start_date: Optional[str]
    end_date: Optional[str]
    conflict_type: Optional[str]
    intensity: Optional[str]
    countries: list[ConflictParticipantItem]

    class Config:
        from_attributes = True


def _build_conflict_response(conflict, country_names: dict) -> ConflictMapItem:
    """Build a ConflictMapItem from a Conflict with pre-loaded participants."""
    countries = []
    for p in conflict.participants:
        country_name = country_names.get(p.country_id) if p.country_id else None
        countries.append(ConflictParticipantItem(
            country_id=str(p.country_id) if p.country_id else None,
            name=country_name or p.actor_name or "Unknown",
            side=p.side,
        ))
    
    return ConflictMapItem(
        id=str(conflict.id),
        name=conflict.name,
        start_date=conflict.start_date.isoformat() if conflict.start_date else None,
        end_date=conflict.end_date.isoformat() if conflict.end_date else None,
        conflict_type=conflict.conflict_type,
        intensity=conflict.intensity,
        countries=countries,
    )


async def _get_country_names(db: AsyncSession, country_ids: set) -> dict:
    """Batch fetch country names for a set of country IDs."""
    if not country_ids:
        return {}
    
    from ..geography.models import Country
    
    result = await db.execute(
        select(Country.id, Country.name_en)
        .where(Country.id.in_(country_ids))
    )
    return {row.id: row.name_en for row in result.all()}


@router.get("/active", response_model=list[ConflictMapItem])
async def get_active_conflicts(
    year: Optional[int] = Query(None, ge=1800, le=2100),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Get conflicts active in a given year for map display.

    Only returns conflicts that have a start_date and are active in the target year.
    For a conflict to be "active" in a year:
    - It must have a start_date that is <= July 1st of that year
    - Its end_date must be >= July 1st of that year, OR be NULL (ongoing/unknown end)

    Conflicts without start_date are excluded from this endpoint.
    """
    from ..events.models import Conflict

    query = select(Conflict).options(selectinload(Conflict.participants))

    if year:
        target_date = date(year, 7, 1)
        query = query.where(
            and_(
                Conflict.start_date.isnot(None),
                Conflict.start_date <= target_date,
                or_(
                    Conflict.end_date.is_(None),
                    Conflict.end_date >= target_date,
                ),
            )
        )
    else:
        query = query.where(Conflict.start_date.isnot(None))

    result = await db.execute(
        query.order_by(Conflict.start_date.desc()).limit(limit)
    )
    conflicts = result.scalars().all()
    
    # Batch fetch all country names
    all_country_ids = set()
    for conflict in conflicts:
        for p in conflict.participants:
            if p.country_id:
                all_country_ids.add(p.country_id)
    
    country_names = await _get_country_names(db, all_country_ids)
    
    return [_build_conflict_response(c, country_names) for c in conflicts]


@router.get("/all", response_model=list[ConflictMapItem])
async def get_all_conflicts(
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
):
    """Get all conflicts for search/listing."""
    from ..events.models import Conflict

    result = await db.execute(
        select(Conflict)
        .options(selectinload(Conflict.participants))
        .where(Conflict.start_date.isnot(None))
        .order_by(Conflict.start_date.desc())
        .limit(limit)
    )
    conflicts = result.scalars().all()

    # Batch fetch all country names
    all_country_ids = set()
    for conflict in conflicts:
        for p in conflict.participants:
            if p.country_id:
                all_country_ids.add(p.country_id)
    
    country_names = await _get_country_names(db, all_country_ids)
    
    return [_build_conflict_response(c, country_names) for c in conflicts]
