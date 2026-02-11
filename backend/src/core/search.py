"""Global search functionality with PostgreSQL full-text search."""
from typing import Optional, List
import logging

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func, text, literal_column
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db
from ..cache import cache_get, cache_set, make_cache_key, CachePrefix, CacheTTL

router = APIRouter()
logger = logging.getLogger(__name__)


def sanitize_search_query(query: str) -> str:
    """Sanitize search query for use in LIKE patterns.

    Escapes SQL LIKE special characters to prevent pattern injection.
    """
    sanitized = query.replace('\\', '\\\\')
    sanitized = sanitized.replace('%', '\\%')
    sanitized = sanitized.replace('_', '\\_')
    return sanitized.lower()


def prepare_tsquery(query: str) -> str:
    """Prepare a search query for PostgreSQL full-text search.

    Converts user input to a valid tsquery string.
    """
    # Remove special characters that could break tsquery
    cleaned = ''.join(c for c in query if c.isalnum() or c.isspace())
    # Split into words and join with & for AND search
    words = cleaned.split()
    if not words:
        return ''
    # Add :* for prefix matching on each word
    return ' & '.join(f"{word}:*" for word in words if word)


class SearchResult(BaseModel):
    id: str
    type: str  # "person", "event", "conflict", "book", "country"
    title: str
    subtitle: Optional[str] = None
    year: Optional[int] = None
    score: Optional[float] = None  # Relevance score
    lat: Optional[float] = None  # Latitude for geographic features
    lng: Optional[float] = None  # Longitude for geographic features


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResult]
    cached: bool = False


@router.get("/", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=2, max_length=200, description="Search query"),
    types: Optional[str] = Query(None, description="Comma-separated types to search: person,event,conflict,book,country"),
    limit: int = Query(20, ge=1, le=100),
    use_fulltext: bool = Query(True, description="Use full-text search (faster, relevance ranked)"),
    db: AsyncSession = Depends(get_db),
):
    """Search across all entity types using PostgreSQL full-text search.

    Full-text search provides:
    - Relevance ranking (weighted by title > description)
    - Stemming (searching 'running' finds 'run')
    - Prefix matching (searching 'revo' finds 'revolution')
    """
    from ..people.models import Person, Book
    from ..events.models import Event, Conflict
    from ..geography.models import Country

    # Check cache first
    cache_key = make_cache_key(prefix=CachePrefix.SEARCH, q=q, types=types, limit=limit, ft=use_fulltext)
    cached = await cache_get(cache_key)
    if cached:
        return SearchResponse(**cached, cached=True)

    results: List[SearchResult] = []

    # Validate and sanitize types parameter
    valid_types = {"person", "event", "conflict", "book", "country"}
    if types:
        requested_types = {t.strip().lower() for t in types.split(",")}
        allowed_types = requested_types & valid_types
    else:
        allowed_types = valid_types

    if use_fulltext:
        tsquery = prepare_tsquery(q)
        if not tsquery:
            # Fall back to LIKE search if query is empty after cleaning
            use_fulltext = False

    # Search people
    if "person" in allowed_types:
        try:
            if use_fulltext:
                query = text("""
                    SELECT id::text, name, bio_short, 
                           EXTRACT(YEAR FROM birth_date) as year,
                           ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio_short, '')), 
                                   to_tsquery('english', :tsquery)) as score
                    FROM people
                    WHERE to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio_short, '')) 
                          @@ to_tsquery('english', :tsquery)
                    ORDER BY score DESC
                    LIMIT :limit
                """)
                result = await db.execute(query, {"tsquery": tsquery, "limit": limit})
                for row in result.fetchall():
                    subtitle = row.bio_short[:100] + "..." if row.bio_short and len(row.bio_short) > 100 else row.bio_short
                    results.append(SearchResult(
                        id=row.id,
                        type="person",
                        title=row.name,
                        subtitle=subtitle,
                        year=int(row.year) if row.year else None,
                        score=float(row.score) if row.score else None,
                    ))
            else:
                # Fallback to LIKE search
                search_pattern = f"%{sanitize_search_query(q)}%"
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
            logger.warning(f"Error searching people: {e}")

    # Search events
    if "event" in allowed_types:
        try:
            if use_fulltext:
                query = text("""
                    SELECT id::text, title, category,
                           EXTRACT(YEAR FROM start_date) as year,
                           ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')),
                                   to_tsquery('english', :tsquery)) as score
                    FROM events
                    WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
                          @@ to_tsquery('english', :tsquery)
                    ORDER BY score DESC
                    LIMIT :limit
                """)
                result = await db.execute(query, {"tsquery": tsquery, "limit": limit})
                for row in result.fetchall():
                    results.append(SearchResult(
                        id=row.id,
                        type="event",
                        title=row.title,
                        subtitle=row.category,
                        year=int(row.year) if row.year else None,
                        score=float(row.score) if row.score else None,
                    ))
            else:
                search_pattern = f"%{sanitize_search_query(q)}%"
                query = select(Event).where(
                    or_(
                        func.lower(Event.title).like(search_pattern),
                        func.lower(Event.description).like(search_pattern),
                    )
                ).limit(limit)
                result = await db.execute(query)
                for event in result.scalars().all():
                    year = event.start_date.year if event.start_date else None

                    # Try to extract coordinates from location name
                    lat = None
                    lng = None
                    if event.location_name:
                        from ..geography.cities import WORLD_CITIES
                        for city in WORLD_CITIES:
                            if event.location_name.lower() in city["name"].lower():
                                lat = city["lat"]
                                lng = city["lng"]
                                break

                    results.append(SearchResult(
                        id=str(event.id),
                        type="event",
                        title=event.title,
                        subtitle=event.category,
                        year=year,
                        lat=lat,
                        lng=lng,
                    ))
        except Exception as e:
            logger.warning(f"Error searching events: {e}")

    # Search conflicts
    if "conflict" in allowed_types:
        try:
            if use_fulltext:
                query = text("""
                    SELECT id::text, name, conflict_type,
                           EXTRACT(YEAR FROM start_date) as year,
                           ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')),
                                   to_tsquery('english', :tsquery)) as score
                    FROM conflicts
                    WHERE to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
                          @@ to_tsquery('english', :tsquery)
                    ORDER BY score DESC
                    LIMIT :limit
                """)
                result = await db.execute(query, {"tsquery": tsquery, "limit": limit})
                for row in result.fetchall():
                    results.append(SearchResult(
                        id=row.id,
                        type="conflict",
                        title=row.name,
                        subtitle=row.conflict_type,
                        year=int(row.year) if row.year else None,
                        score=float(row.score) if row.score else None,
                    ))
            else:
                search_pattern = f"%{sanitize_search_query(q)}%"
                query = select(Conflict).where(
                    or_(
                        func.lower(Conflict.name).like(search_pattern),
                        func.lower(Conflict.description).like(search_pattern),
                    )
                ).limit(limit)
                result = await db.execute(query)
                for conflict in result.scalars().all():
                    year = conflict.start_date.year if conflict.start_date else None

                    # Try to extract coordinates from conflict name
                    lat = None
                    lng = None
                    if conflict.name:
                        from ..geography.cities import WORLD_CITIES
                        for city in WORLD_CITIES:
                            if city["country"].lower() in conflict.name.lower():
                                lat = city["lat"]
                                lng = city["lng"]
                                break

                    results.append(SearchResult(
                        id=str(conflict.id),
                        type="conflict",
                        title=conflict.name,
                        subtitle=conflict.conflict_type,
                        year=year,
                        lat=lat,
                        lng=lng,
                    ))
        except Exception as e:
            logger.warning(f"Error searching conflicts: {e}")

    # Search books
    if "book" in allowed_types:
        try:
            if use_fulltext:
                query = text("""
                    SELECT id::text, title, book_type, publication_year,
                           ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')), 
                                   to_tsquery('english', :tsquery)) as score
                    FROM books
                    WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')) 
                          @@ to_tsquery('english', :tsquery)
                    ORDER BY score DESC
                    LIMIT :limit
                """)
                result = await db.execute(query, {"tsquery": tsquery, "limit": limit})
                for row in result.fetchall():
                    results.append(SearchResult(
                        id=row.id,
                        type="book",
                        title=row.title,
                        subtitle=row.book_type,
                        year=row.publication_year,
                        score=float(row.score) if row.score else None,
                    ))
            else:
                search_pattern = f"%{sanitize_search_query(q)}%"
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
            logger.warning(f"Error searching books: {e}")

    # Search countries (trigram similarity for fuzzy matching)
    if "country" in allowed_types:
        try:
            if use_fulltext:
                # Use trigram similarity for country names
                query = text("""
                    SELECT id::text, name_en,
                           similarity(name_en, :query) as score
                    FROM countries
                    WHERE similarity(name_en, :query) > 0.2
                       OR name_en ILIKE :pattern
                    ORDER BY score DESC
                    LIMIT :limit
                """)
                result = await db.execute(query, {
                    "query": q,
                    "pattern": f"%{q}%",
                    "limit": limit
                })
                for row in result.fetchall():
                    results.append(SearchResult(
                        id=row.id,
                        type="country",
                        title=row.name_en,
                        subtitle=None,
                        year=None,
                        score=float(row.score) if row.score else None,
                    ))
            else:
                search_pattern = f"%{sanitize_search_query(q)}%"
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
            logger.warning(f"Error searching countries: {e}")

    # Sort by score (if available) then alphabetically
    if use_fulltext:
        results.sort(key=lambda r: (-(r.score or 0), r.title.lower()))
    else:
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

    response_data = {
        "query": q,
        "total": len(results),
        "results": [r.model_dump() for r in results],
    }

    # Cache the result
    await cache_set(cache_key, response_data, CacheTTL.MEDIUM)

    return SearchResponse(**response_data, cached=False)


@router.get("/suggest")
async def search_suggestions(
    q: str = Query(..., min_length=1, max_length=100, description="Partial query for suggestions"),
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Get search suggestions based on partial input (autocomplete).

    Uses trigram similarity for fuzzy matching.
    """
    # Check cache
    cache_key = make_cache_key(prefix=f"{CachePrefix.SEARCH}:suggest", q=q, limit=limit)
    cached = await cache_get(cache_key)
    if cached:
        return cached

    suggestions = []

    try:
        # Get suggestions from people names
        query = text("""
            SELECT DISTINCT name, similarity(name, :query) as score
            FROM people
            WHERE similarity(name, :query) > 0.2 OR name ILIKE :pattern
            ORDER BY score DESC
            LIMIT :limit
        """)
        result = await db.execute(query, {"query": q, "pattern": f"{q}%", "limit": limit})
        for row in result.fetchall():
            suggestions.append({"text": row.name, "type": "person", "score": float(row.score)})

        # Get suggestions from event titles
        query = text("""
            SELECT DISTINCT title, similarity(title, :query) as score
            FROM events
            WHERE similarity(title, :query) > 0.2 OR title ILIKE :pattern
            ORDER BY score DESC
            LIMIT :limit
        """)
        result = await db.execute(query, {"query": q, "pattern": f"{q}%", "limit": limit})
        for row in result.fetchall():
            suggestions.append({"text": row.title, "type": "event", "score": float(row.score)})

        # Sort all suggestions by score and limit
        suggestions.sort(key=lambda x: -x["score"])
        suggestions = suggestions[:limit]

    except Exception as e:
        logger.warning(f"Error getting suggestions: {e}")

    # Cache suggestions
    await cache_set(cache_key, suggestions, CacheTTL.SHORT)

    return suggestions
