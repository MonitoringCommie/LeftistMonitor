"""Events API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import NotFoundError
from ..core.pagination import PaginatedResponse
from ..database import get_db
from .schemas import (
    EventListItem, EventResponse, ConflictListItem, ConflictResponse,
    TimelineEvent
)
from .service import EventsService

router = APIRouter()


@router.get("/countries/{country_id}/events", response_model=PaginatedResponse[EventListItem])
async def list_events_by_country(
    country_id: UUID,
    year: Optional[int] = Query(None, ge=1800, le=2100),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get events for a country."""
    service = EventsService(db)
    events, total = await service.get_events_by_country(
        country_id=country_id,
        year=year,
        category=category,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[EventListItem.model_validate(e) for e in events],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get an event."""
    service = EventsService(db)
    event = await service.get_event(event_id)

    if not event:
        raise NotFoundError(f"Event {event_id} not found")

    return EventResponse.model_validate(event)


@router.get("/countries/{country_id}/conflicts", response_model=PaginatedResponse[ConflictListItem])
async def list_conflicts_by_country(
    country_id: UUID,
    year: Optional[int] = Query(None, ge=1800, le=2100),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get conflicts involving a country."""
    service = EventsService(db)
    conflicts, total = await service.get_conflicts_by_country(
        country_id=country_id,
        year=year,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[ConflictListItem.model_validate(c) for c in conflicts],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/conflict/{conflict_id}", response_model=ConflictResponse)
async def get_conflict(
    conflict_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a conflict with participants."""
    service = EventsService(db)
    conflict = await service.get_conflict(conflict_id)

    if not conflict:
        raise NotFoundError(f"Conflict {conflict_id} not found")

    return conflict


@router.get("/countries/{country_id}/timeline", response_model=list[TimelineEvent])
async def get_country_timeline(
    country_id: UUID,
    start_year: int = Query(..., ge=1800, le=2100),
    end_year: int = Query(..., ge=1800, le=2100),
    db: AsyncSession = Depends(get_db),
):
    """Get a combined timeline of events, elections, and conflicts for a country."""
    service = EventsService(db)
    return await service.get_country_timeline(country_id, start_year, end_year)


@router.get("/global/year/{year}", response_model=list[EventListItem])
async def get_global_events_by_year(
    year: int,
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get the most important global events for a specific year."""
    service = EventsService(db)
    events = await service.get_global_events_by_year(year, limit)
    return [EventListItem.model_validate(e) for e in events]


@router.get("/", response_model=PaginatedResponse[EventListItem])
async def list_all_events(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get all events with optional filtering."""
    from sqlalchemy import select, func, or_
    from .models import Event
    
    query = select(Event)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Event.title.ilike(search_term),
                Event.description.ilike(search_term)
            )
        )
    
    if category:
        query = query.where(Event.category == category)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Get page
    offset = (page - 1) * per_page
    query = query.order_by(Event.start_date.desc().nullslast()).offset(offset).limit(per_page)
    result = await db.execute(query)
    events = result.scalars().all()
    
    return PaginatedResponse.create(
        items=[EventListItem.model_validate(e) for e in events],
        total=total,
        page=page,
        per_page=per_page,
    )
