"""
Export functionality for data in CSV and PDF formats.
"""

import csv
import io
from datetime import datetime
from typing import Any, Optional
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db


router = APIRouter(prefix="/export", tags=["export"])


# CSV Export utilities
def generate_csv(data: list[dict], fields: list[str]) -> str:
    """Generate CSV string from list of dictionaries."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(data)
    return output.getvalue()


def create_csv_response(
    data: str,
    filename: str,
) -> StreamingResponse:
    """Create a streaming CSV response."""
    return StreamingResponse(
        iter([data]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8",
        },
    )


# People export
@router.get("/people/csv")
async def export_people_csv(
    db: AsyncSession = Depends(get_db),
    ideology: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    limit: int = Query(1000, le=10000),
):
    """Export political figures to CSV."""
    from sqlalchemy import select, text
    from src.people.models import Person
    
    query = select(Person).limit(limit)
    
    if ideology:
        query = query.where(Person.ideology.ilike(f"%{ideology}%"))
    if country:
        query = query.where(Person.country == country)
    
    result = await db.execute(query)
    people = result.scalars().all()
    
    data = [
        {
            "id": p.id,
            "name": p.name,
            "birth_year": p.birth_year,
            "death_year": p.death_year,
            "country": p.country,
            "ideology": p.ideology,
            "occupation": p.occupation,
            "biography": p.biography[:500] if p.biography else "",
            "wikidata_id": p.wikidata_id,
        }
        for p in people
    ]
    
    fields = ["id", "name", "birth_year", "death_year", "country", "ideology", "occupation", "biography", "wikidata_id"]
    csv_data = generate_csv(data, fields)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_people_{timestamp}.csv"
    
    return create_csv_response(csv_data, filename)


# Events export
@router.get("/events/csv")
async def export_events_csv(
    db: AsyncSession = Depends(get_db),
    category: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    year_from: Optional[int] = Query(None),
    year_to: Optional[int] = Query(None),
    limit: int = Query(1000, le=10000),
):
    """Export historical events to CSV."""
    from sqlalchemy import select
    from src.events.models import Event
    
    query = select(Event).limit(limit)
    
    if category:
        query = query.where(Event.category == category)
    if country:
        query = query.where(Event.country == country)
    if year_from:
        query = query.where(Event.year >= year_from)
    if year_to:
        query = query.where(Event.year <= year_to)
    
    result = await db.execute(query)
    events = result.scalars().all()
    
    data = [
        {
            "id": e.id,
            "name": e.name,
            "year": e.year,
            "month": e.month,
            "day": e.day,
            "country": e.country,
            "category": e.category,
            "description": e.description[:500] if e.description else "",
            "latitude": e.latitude,
            "longitude": e.longitude,
            "wikidata_id": e.wikidata_id,
        }
        for e in events
    ]
    
    fields = ["id", "name", "year", "month", "day", "country", "category", "description", "latitude", "longitude", "wikidata_id"]
    csv_data = generate_csv(data, fields)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_events_{timestamp}.csv"
    
    return create_csv_response(csv_data, filename)


# Books export
@router.get("/books/csv")
async def export_books_csv(
    db: AsyncSession = Depends(get_db),
    ideology: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    limit: int = Query(1000, le=10000),
):
    """Export leftist books to CSV."""
    from sqlalchemy import select
    from src.books.models import Book
    
    query = select(Book).limit(limit)
    
    if ideology:
        query = query.where(Book.ideology.ilike(f"%{ideology}%"))
    if language:
        query = query.where(Book.language == language)
    
    result = await db.execute(query)
    books = result.scalars().all()
    
    data = [
        {
            "id": b.id,
            "title": b.title,
            "author": b.author,
            "year": b.year,
            "language": b.language,
            "ideology": b.ideology,
            "description": b.description[:500] if b.description else "",
            "wikidata_id": b.wikidata_id,
        }
        for b in books
    ]
    
    fields = ["id", "title", "author", "year", "language", "ideology", "description", "wikidata_id"]
    csv_data = generate_csv(data, fields)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_books_{timestamp}.csv"
    
    return create_csv_response(csv_data, filename)


# Conflicts export
@router.get("/conflicts/csv")
async def export_conflicts_csv(
    db: AsyncSession = Depends(get_db),
    conflict_type: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    limit: int = Query(1000, le=10000),
):
    """Export armed conflicts to CSV."""
    from sqlalchemy import select
    from src.conflicts.models import Conflict
    
    query = select(Conflict).limit(limit)
    
    if conflict_type:
        query = query.where(Conflict.conflict_type == conflict_type)
    if region:
        query = query.where(Conflict.region == region)
    
    result = await db.execute(query)
    conflicts = result.scalars().all()
    
    data = [
        {
            "id": c.id,
            "name": c.name,
            "start_year": c.start_year,
            "end_year": c.end_year,
            "region": c.region,
            "conflict_type": c.conflict_type,
            "casualties": c.casualties,
            "description": c.description[:500] if c.description else "",
            "wikidata_id": c.wikidata_id,
        }
        for c in conflicts
    ]
    
    fields = ["id", "name", "start_year", "end_year", "region", "conflict_type", "casualties", "description", "wikidata_id"]
    csv_data = generate_csv(data, fields)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_conflicts_{timestamp}.csv"
    
    return create_csv_response(csv_data, filename)


# Combined search export
@router.get("/search/csv")
async def export_search_csv(
    db: AsyncSession = Depends(get_db),
    q: str = Query(..., min_length=2),
    limit: int = Query(500, le=5000),
):
    """Export search results to CSV."""
    from src.core.search import search_all
    
    results = await search_all(db, q, limit=limit)
    
    data = []
    for item in results:
        data.append({
            "type": item.get("type", ""),
            "id": item.get("id", ""),
            "name": item.get("name", item.get("title", "")),
            "year": item.get("year", item.get("birth_year", "")),
            "country": item.get("country", item.get("region", "")),
            "category": item.get("category", item.get("ideology", "")),
            "description": str(item.get("description", item.get("biography", "")))[:300],
        })
    
    fields = ["type", "id", "name", "year", "country", "category", "description"]
    csv_data = generate_csv(data, fields)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"leftist_monitor_search_{q}_{timestamp}.csv"
    
    return create_csv_response(csv_data, filename)
