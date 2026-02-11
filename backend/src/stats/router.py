"""Stats API routes with Redis caching."""
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db
from ..cache import cache_get, cache_set, CachePrefix, CacheTTL

router = APIRouter()


class StatsOverview(BaseModel):
    countries: int
    people: int
    books: int
    events: int
    conflicts: int
    elections: int


@router.get("/overview", response_model=StatsOverview)
async def get_stats_overview(db: AsyncSession = Depends(get_db)):
    """Get database statistics overview (cached for 5 minutes)."""
    cache_key = f"{CachePrefix.STATS}:overview"

    # Try cache first
    cached = await cache_get(cache_key)
    if cached:
        return StatsOverview(**cached)

    # Cache miss - query database
    from ..geography.models import Country
    from ..people.models import Person, Book
    from ..events.models import Event, Conflict
    from ..politics.models import Election

    countries = await db.execute(select(func.count(Country.id)))
    people = await db.execute(select(func.count(Person.id)))
    books = await db.execute(select(func.count(Book.id)))
    events = await db.execute(select(func.count(Event.id)))
    conflicts = await db.execute(select(func.count(Conflict.id)))
    elections = await db.execute(select(func.count(Election.id)))

    result = StatsOverview(
        countries=countries.scalar() or 0,
        people=people.scalar() or 0,
        books=books.scalar() or 0,
        events=events.scalar() or 0,
        conflicts=conflicts.scalar() or 0,
        elections=elections.scalar() or 0,
    )

    # Cache the result
    await cache_set(cache_key, result.model_dump(), CacheTTL.SHORT)

    return result
