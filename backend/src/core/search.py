"""Global search functionality."""
from typing import Optional, List
import re

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


def sanitize_search_query(query: str) -> str:
    """Sanitize search query for use in LIKE patterns.
    
    Escapes SQL LIKE special characters to prevent pattern injection.
    """
    # Escape SQL LIKE special characters
    sanitized = query.replace('\\', '\\\\')  # Escape backslash first
    sanitized = sanitized.replace('%', '\\%')  # Escape percent
    sanitized = sanitized.replace('_', '\\_')  # Escape underscore
    return sanitized.lower()


class SearchResult(BaseModel):
    id: str
    type: str  # "person", "event", "conflict", "book", "country"
    title: str
    subtitle: Optional[str] = None
    year: Optional[int] = None


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResult]


@router.get("/", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    types: Optional[str] = Query(None, description="Comma-separated types to search: person,event,conflict,book,country"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Search across all entity types."""
    from ..people.models import Person, Book
    from ..events.models import Event, Conflict
    from ..geography.models import Country

    sanitized_query = sanitize_search_query(q)
    search_pattern = f"%{sanitized_query}%"
    results: List[SearchResult] = []

    # Validate and sanitize types parameter
    valid_types = {"person", "event", "conflict", "book", "country"}
    if types:
        requested_types = {t.strip().lower() for t in types.split(",")}
        allowed_types = requested_types & valid_types  # Only allow valid types
    else:
        allowed_types = valid_types

    # Search people
    if "person" in allowed_types:
        try:
            query = select(Person).where(
                or_(
                    func.lower(Person.name).like(search_pattern),
                    func.lower(Person.bio_short).like(search_pattern),
                )
            ).limit(limit)
            result = await db.execute(query)
            for person in result.scalars().all():
                year = person.birth_date.year if person.birth_date else None
                results.append(SearchResult(
                    id=str(person.id),
                    type="person",
                    title=person.name,
                    subtitle=person.bio_short[:100] + "..." if person.bio_short and len(person.bio_short) > 100 else person.bio_short,
                    year=year,
                ))
        except Exception as e:
            # Log error but continue with other entity types
            import logging
            logging.warning(f"Error searching people: {e}")

    # Search events
    if "event" in allowed_types:
        try:
            query = select(Event).where(
                or_(
                    func.lower(Event.title).like(search_pattern),
                    func.lower(Event.description).like(search_pattern),
                )
            ).limit(limit)
            result = await db.execute(query)
            for event in result.scalars().all():
                year = event.start_date.year if event.start_date else None
                results.append(SearchResult(
                    id=str(event.id),
                    type="event",
                    title=event.title,
                    subtitle=event.category,
                    year=year,
                ))
        except Exception as e:
            import logging
            logging.warning(f"Error searching events: {e}")

    # Search conflicts
    if "conflict" in allowed_types:
        try:
            query = select(Conflict).where(
                or_(
                    func.lower(Conflict.name).like(search_pattern),
                    func.lower(Conflict.description).like(search_pattern),
                )
            ).limit(limit)
            result = await db.execute(query)
            for conflict in result.scalars().all():
                year = conflict.start_date.year if conflict.start_date else None
                results.append(SearchResult(
                    id=str(conflict.id),
                    type="conflict",
                    title=conflict.name,
                    subtitle=conflict.conflict_type,
                    year=year,
                ))
        except Exception as e:
            import logging
            logging.warning(f"Error searching conflicts: {e}")

    # Search books
    if "book" in allowed_types:
        try:
            query = select(Book).where(
                or_(
                    func.lower(Book.title).like(search_pattern),
                    func.lower(Book.description).like(search_pattern),
                )
            ).limit(limit)
            result = await db.execute(query)
            for book in result.scalars().all():
                results.append(SearchResult(
                    id=str(book.id),
                    type="book",
                    title=book.title,
                    subtitle=book.book_type,
                    year=book.publication_year,
                ))
        except Exception as e:
            import logging
            logging.warning(f"Error searching books: {e}")

    # Search countries
    if "country" in allowed_types:
        try:
            query = select(Country).where(
                func.lower(Country.name_en).like(search_pattern)
            ).limit(limit)
            result = await db.execute(query)
            for country in result.scalars().all():
                results.append(SearchResult(
                    id=str(country.id),
                    type="country",
                    title=country.name_en,
                    subtitle=None,
                    year=None,
                ))
        except Exception as e:
            import logging
            logging.warning(f"Error searching countries: {e}")

    # Sort by relevance (exact match first, then alphabetical)
    q_lower = q.lower()
    def sort_key(r: SearchResult) -> tuple:
        title_lower = r.title.lower()
        if title_lower == q_lower:
            return (0, title_lower)
        elif title_lower.startswith(q_lower):
            return (1, title_lower)
        else:
            return (2, title_lower)

    results.sort(key=sort_key)
    results = results[:limit]

    return SearchResponse(
        query=q,
        total=len(results),
        results=results,
    )
