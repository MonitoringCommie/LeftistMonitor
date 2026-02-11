"""Globe-specific API endpoints optimized for 3D globe rendering.

Provides endpoints for serving geographic data in formats optimized for
client-side 3D globe visualization with aggressive caching.
"""
from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from ..database import get_db
from ..cache import cache_get, cache_set, make_cache_key, CachePrefix, CacheTTL
from .cities import WORLD_CITIES
from .models import Country, CountryCapital
from ..events.models import Event, Conflict

router = APIRouter()


class CityData(BaseModel):
    """City data optimized for globe rendering."""
    name: str
    country: str
    lat: float
    lng: float
    importance: int
    type: str  # "capital", "conflict", "liberation", "protest", "economic", etc.


class ConflictGlobeData(BaseModel):
    """Conflict data with coordinates for globe."""
    id: str
    name: str
    start_year: Optional[int]
    end_year: Optional[int]
    type: str
    intensity: Optional[str]
    lat: Optional[float]
    lng: Optional[float]
    countries: list[str]


class EventGlobeData(BaseModel):
    """Event data with coordinates for globe."""
    id: str
    title: str
    year: Optional[int]
    category: str
    lat: Optional[float]
    lng: Optional[float]
    country: Optional[str]
    importance: Optional[int]


class HeatmapData(BaseModel):
    """Heatmap point for density visualization."""
    lat: float
    lng: float
    intensity: float


@router.get("/cities", response_model=list[CityData])
async def get_cities(
    response: Response,
    type_filter: Optional[str] = Query(None, description="Filter by city type"),
    importance_min: int = Query(1, ge=1, le=10),
):
    """Get all cities with coordinates optimized for globe rendering.

    Returns city data with lat/lng, importance score, and type classification.
    Aggressively cached (24h).

    Query Parameters:
    - type_filter: Filter by type (capital, conflict, liberation, protest, economic, labor, revolution)
    - importance_min: Minimum importance score (1-10)
    """
    # Cache for 24 hours
    response.headers["Cache-Control"] = "public, max-age=86400"

    cache_key = make_cache_key(
        prefix=CachePrefix.GEOJSON,
        endpoint="cities",
        type_filter=type_filter,
        importance_min=importance_min,
    )

    cached = await cache_get(cache_key)
    if cached:
        return cached

    # Filter cities
    filtered_cities = WORLD_CITIES

    if type_filter:
        filtered_cities = [c for c in filtered_cities if c["type"] == type_filter]

    if importance_min > 1:
        filtered_cities = [c for c in filtered_cities if c["importance"] >= importance_min]

    result = [CityData(**city) for city in filtered_cities]

    # Cache result
    await cache_set(cache_key, [r.model_dump() for r in result], CacheTTL.DAY)

    return result


@router.get("/conflicts/active", response_model=list[ConflictGlobeData])
async def get_active_conflicts_globe(
    response: Response,
    year: Optional[int] = Query(None, ge=1800, le=2100),
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Get active conflicts for a given year with coordinates.

    Returns minimal conflict data with geographic coordinates and participants.
    Cached for 1 hour.
    """
    response.headers["Cache-Control"] = "public, max-age=3600"

    cache_key = make_cache_key(
        prefix=CachePrefix.CONFLICTS,
        endpoint="active_globe",
        year=year,
        limit=limit,
    )

    cached = await cache_get(cache_key)
    if cached:
        return cached

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

    result = await db.execute(query.order_by(Conflict.start_date.desc()).limit(limit))
    conflicts = result.scalars().all()

    # Build response with coordinates from participants
    conflict_data = []
    for conflict in conflicts:
        countries = [
            p.actor_name or f"Country {p.country_id}"
            for p in conflict.participants
        ]

        # Get average coordinates from cities in participating countries
        avg_lat = None
        avg_lng = None
        coords = []
        for city in WORLD_CITIES:
            if city["country"] in countries:
                coords.append((city["lat"], city["lng"]))

        if coords:
            avg_lat = sum(c[0] for c in coords) / len(coords)
            avg_lng = sum(c[1] for c in coords) / len(coords)

        conflict_data.append(ConflictGlobeData(
            id=str(conflict.id),
            name=conflict.name,
            start_year=conflict.start_date.year if conflict.start_date else None,
            end_year=conflict.end_date.year if conflict.end_date else None,
            type=conflict.conflict_type,
            intensity=conflict.intensity,
            lat=avg_lat,
            lng=avg_lng,
            countries=countries,
        ))

    # Cache result
    await cache_set(cache_key, [c.model_dump() for c in conflict_data], CacheTTL.LONG)

    return conflict_data


@router.get("/events/year", response_model=list[EventGlobeData])
async def get_events_for_year(
    response: Response,
    year: int = Query(..., ge=1800, le=2100),
    category: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Get all events for a specific year with coordinates.

    Returns event data optimized for globe visualization.
    Cached for 1 hour.
    """
    response.headers["Cache-Control"] = "public, max-age=3600"

    cache_key = make_cache_key(
        prefix=CachePrefix.EVENTS,
        endpoint="globe_year",
        year=year,
        category=category,
        limit=limit,
    )

    cached = await cache_get(cache_key)
    if cached:
        return cached

    query = select(Event).where(
        and_(
            func.extract("year", Event.start_date) == year,
            Event.location.isnot(None),
        )
    )

    if category:
        query = query.where(Event.category == category)

    result = await db.execute(query.order_by(Event.start_date).limit(limit))
    events = result.scalars().all()

    event_data = []
    for event in events:
        # Extract coordinates from PostGIS geometry if available
        lat = None
        lng = None
        if event.location:
            # PostGIS geometry is returned as WKT, try to extract coordinates
            try:
                # The location column contains geometry data
                # This is a simplified approach; in production use ST_AsText()
                pass
            except Exception:
                pass

        # Fallback: try to find city by location name
        if not lat and event.location_name:
            for city in WORLD_CITIES:
                if event.location_name.lower() in city["name"].lower():
                    lat = city["lat"]
                    lng = city["lng"]
                    break

        event_data.append(EventGlobeData(
            id=str(event.id),
            title=event.title,
            year=event.start_date.year if event.start_date else None,
            category=event.category,
            lat=lat,
            lng=lng,
            country=None,  # Would need to join with countries table
            importance=event.importance,
        ))

    # Cache result
    await cache_set(cache_key, [e.model_dump() for e in event_data], CacheTTL.LONG)

    return event_data


@router.get("/liberation-data", response_model=dict)
async def get_liberation_data(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get all liberation struggle geodata combined.

    Returns a unified dataset of all liberation struggle related data:
    - Occupation data
    - Resistance movements
    - Relevant conflicts
    - Key events

    Cached for 6 hours.
    """
    response.headers["Cache-Control"] = "public, max-age=21600"

    cache_key = make_cache_key(prefix=CachePrefix.GEOJSON, endpoint="liberation_combined")

    cached = await cache_get(cache_key)
    if cached:
        return cached

    # For now, return structure with placeholder data
    # Would be extended with actual database queries
    liberation_data = {
        "occupations": [],
        "resistance_movements": [],
        "conflicts": [],
        "events": [],
        "metadata": {
            "total_regions": 0,
            "total_cities": 0,
        },
    }

    # Get liberation struggle cities
    liberation_cities = [c for c in WORLD_CITIES if c["type"] in ["liberation", "occupation"]]
    liberation_data["cities"] = [CityData(**c).model_dump() for c in liberation_cities]
    liberation_data["metadata"]["total_cities"] = len(liberation_cities)

    # Cache result
    await cache_set(cache_key, liberation_data, CacheTTL.VERY_LONG)

    return liberation_data


@router.get("/heatmap", response_model=list[HeatmapData])
async def get_heatmap_data(
    response: Response,
    type_filter: str = Query("conflicts", description="Type: conflicts, events, protests"),
    year: Optional[int] = Query(None, ge=1800, le=2100),
    db: AsyncSession = Depends(get_db),
):
    """Get density heatmap data for visualization.

    Generates heatmap points based on event/conflict density for specified type.
    Cached for 1 hour.

    Parameters:
    - type_filter: Type of data to generate heatmap for (conflicts, events, protests)
    - year: Optional year filter
    """
    response.headers["Cache-Control"] = "public, max-age=3600"

    cache_key = make_cache_key(
        prefix=CachePrefix.GEOJSON,
        endpoint="heatmap",
        type_filter=type_filter,
        year=year,
    )

    cached = await cache_get(cache_key)
    if cached:
        return cached

    heatmap_points = []

    if type_filter == "conflicts":
        # Generate heatmap from conflict cities
        conflict_cities = [c for c in WORLD_CITIES if c["type"] == "conflict"]
        for city in conflict_cities:
            # Intensity based on importance score (1-10)
            heatmap_points.append(HeatmapData(
                lat=city["lat"],
                lng=city["lng"],
                intensity=city["importance"] / 10.0,
            ))

    elif type_filter == "protests":
        # Generate heatmap from protest cities
        protest_cities = [c for c in WORLD_CITIES if c["type"] in ["protest", "labor"]]
        for city in protest_cities:
            heatmap_points.append(HeatmapData(
                lat=city["lat"],
                lng=city["lng"],
                intensity=city["importance"] / 10.0,
            ))

    elif type_filter == "events":
        # Would generate from events in database
        # For now use all significant cities
        significant_cities = [c for c in WORLD_CITIES if c["importance"] >= 7]
        for city in significant_cities:
            heatmap_points.append(HeatmapData(
                lat=city["lat"],
                lng=city["lng"],
                intensity=city["importance"] / 10.0,
            ))

    # Cache result
    await cache_set(cache_key, [p.model_dump() for p in heatmap_points], CacheTTL.LONG)

    return heatmap_points
