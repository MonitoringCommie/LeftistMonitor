"""Adjacent history service - what happened simultaneously in nearby countries."""
from typing import Optional, List
from datetime import date, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


class AdjacentEvent(BaseModel):
    id: str
    title: str
    category: str
    start_date: Optional[str]
    country_id: str
    country_name: str
    importance: Optional[int]

    class Config:
        from_attributes = True


class AdjacentConflict(BaseModel):
    id: str
    name: str
    conflict_type: str
    start_date: Optional[str]
    countries: List[str]

    class Config:
        from_attributes = True


class AdjacentHistoryResponse(BaseModel):
    reference_country: str
    reference_year: int
    events: List[AdjacentEvent]
    conflicts: List[AdjacentConflict]
    message: str


@router.get("/adjacent/{country_id}/{year}", response_model=AdjacentHistoryResponse)
async def get_adjacent_history(
    country_id: str,
    year: int,
    radius_years: int = Query(2, ge=0, le=10, description="Years before/after to include"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get events and conflicts happening near a country around a specific year.
    
    This provides context for what was happening in the region during a time period,
    helping researchers understand the broader historical context.
    """
    from ..geography.models import Country
    from ..events.models import Event, Conflict, ConflictParticipant
    
    # Get the reference country
    result = await db.execute(
        select(Country).where(Country.id == country_id)
    )
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    
    # Date range
    start_date = date(year - radius_years, 1, 1)
    end_date = date(year + radius_years, 12, 31)
    
    # Get events from OTHER countries in the same time period
    events_query = (
        select(
            Event.id,
            Event.title,
            Event.category,
            Event.start_date,
            Event.importance,
            Event.primary_country_id,
            Country.name_en.label('country_name'),
        )
        .join(Country, Event.primary_country_id == Country.id)
        .where(
            and_(
                Event.primary_country_id != country_id,  # Exclude the reference country
                Event.start_date.isnot(None),
                Event.start_date >= start_date,
                Event.start_date <= end_date,
            )
        )
        .order_by(Event.importance.desc().nulls_last(), Event.start_date)
        .limit(limit)
    )
    
    events_result = await db.execute(events_query)
    events = [
        AdjacentEvent(
            id=str(row.id),
            title=row.title,
            category=row.category,
            start_date=row.start_date.isoformat() if row.start_date else None,
            country_id=str(row.primary_country_id),
            country_name=row.country_name,
            importance=row.importance,
        )
        for row in events_result.all()
    ]
    
    # Get conflicts active during this period
    conflicts_query = (
        select(Conflict)
        .where(
            and_(
                Conflict.start_date.isnot(None),
                Conflict.start_date <= end_date,
                or_(
                    Conflict.end_date.is_(None),
                    Conflict.end_date >= start_date,
                ),
            )
        )
        .order_by(Conflict.start_date)
        .limit(limit // 2)
    )
    
    conflicts_result = await db.execute(conflicts_query)
    conflicts_list = []
    
    for conflict in conflicts_result.scalars().all():
        # Get participant countries
        participants_query = (
            select(Country.name_en)
            .join(ConflictParticipant, ConflictParticipant.country_id == Country.id)
            .where(ConflictParticipant.conflict_id == conflict.id)
        )
        participants_result = await db.execute(participants_query)
        country_names = [row.name_en for row in participants_result.all()]
        
        conflicts_list.append(AdjacentConflict(
            id=str(conflict.id),
            name=conflict.name,
            conflict_type=conflict.conflict_type,
            start_date=conflict.start_date.isoformat() if conflict.start_date else None,
            countries=country_names,
        ))
    
    return AdjacentHistoryResponse(
        reference_country=country.name_en,
        reference_year=year,
        events=events,
        conflicts=conflicts_list,
        message=f"Showing events and conflicts from {year - radius_years} to {year + radius_years}",
    )
