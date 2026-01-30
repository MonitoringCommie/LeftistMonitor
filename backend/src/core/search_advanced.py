"""Advanced search with facets and autocomplete."""
from typing import Optional, List, Dict, Any
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


class SearchSuggestion(BaseModel):
    text: str
    type: str
    id: Optional[str] = None


class FacetValue(BaseModel):
    value: str
    count: int


class SearchFacets(BaseModel):
    types: List[FacetValue]
    categories: List[FacetValue]
    countries: List[FacetValue]
    years: List[FacetValue]


class FacetedSearchResult(BaseModel):
    id: str
    type: str
    title: str
    subtitle: Optional[str] = None
    year: Optional[int] = None
    country: Optional[str] = None
    category: Optional[str] = None
    relevance_score: float = 1.0


class FacetedSearchResponse(BaseModel):
    query: str
    total: int
    results: List[FacetedSearchResult]
    facets: SearchFacets


def sanitize_search_query(query: str) -> str:
    """Sanitize search query for LIKE patterns."""
    sanitized = query.replace('\\', '\\\\')
    sanitized = sanitized.replace('%', '\\%')
    sanitized = sanitized.replace('_', '\\_')
    return sanitized.lower()


@router.get("/suggestions", response_model=List[SearchSuggestion])
async def get_search_suggestions(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Get autocomplete suggestions for search query."""
    from ..people.models import Person
    from ..events.models import Event, Conflict
    from ..geography.models import Country
    from ..politics.models import PoliticalParty
    
    sanitized = sanitize_search_query(q)
    pattern = f"{sanitized}%"  # Prefix match for autocomplete
    
    suggestions = []
    
    # Search people (prioritize starts-with matches)
    people_query = (
        select(Person.id, Person.name)
        .where(func.lower(Person.name).like(pattern))
        .order_by(Person.name)
        .limit(limit // 3)
    )
    people_result = await db.execute(people_query)
    for row in people_result.all():
        suggestions.append(SearchSuggestion(
            text=row.name,
            type="person",
            id=str(row.id),
        ))
    
    # Search countries
    countries_query = (
        select(Country.id, Country.name_en)
        .where(func.lower(Country.name_en).like(pattern))
        .order_by(Country.name_en)
        .limit(limit // 3)
    )
    countries_result = await db.execute(countries_query)
    for row in countries_result.all():
        suggestions.append(SearchSuggestion(
            text=row.name_en,
            type="country",
            id=str(row.id),
        ))
    
    # Search events
    events_query = (
        select(Event.id, Event.title)
        .where(func.lower(Event.title).like(pattern))
        .order_by(Event.title)
        .limit(limit // 3)
    )
    events_result = await db.execute(events_query)
    for row in events_result.all():
        suggestions.append(SearchSuggestion(
            text=row.title,
            type="event",
            id=str(row.id),
        ))
    
    # Search parties
    parties_query = (
        select(PoliticalParty.id, PoliticalParty.name)
        .where(func.lower(PoliticalParty.name).like(pattern))
        .order_by(PoliticalParty.name)
        .limit(limit // 4)
    )
    parties_result = await db.execute(parties_query)
    for row in parties_result.all():
        suggestions.append(SearchSuggestion(
            text=row.name,
            type="party",
            id=str(row.id),
        ))
    
    # Sort by relevance (exact prefix match first)
    q_lower = q.lower()
    suggestions.sort(key=lambda s: (
        0 if s.text.lower().startswith(q_lower) else 1,
        s.text.lower()
    ))
    
    return suggestions[:limit]


@router.get("/faceted", response_model=FacetedSearchResponse)
async def faceted_search(
    q: str = Query(..., min_length=2, max_length=200),
    types: Optional[str] = Query(None, description="Comma-separated: person,event,conflict,country,party"),
    categories: Optional[str] = Query(None, description="Event categories"),
    countries: Optional[str] = Query(None, description="Country IDs"),
    start_year: Optional[int] = Query(None),
    end_year: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Search with faceted filtering."""
    from ..people.models import Person
    from ..events.models import Event, Conflict
    from ..geography.models import Country
    from ..politics.models import PoliticalParty
    
    sanitized = sanitize_search_query(q)
    pattern = f"%{sanitized}%"
    
    results = []
    facet_types = {}
    facet_categories = {}
    facet_countries = {}
    facet_years = {}
    
    allowed_types = set(types.split(",")) if types else {"person", "event", "conflict", "country", "party"}
    country_filter = set(countries.split(",")) if countries else None
    category_filter = set(categories.split(",")) if categories else None
    
    # Search people
    if "person" in allowed_types:
        query = select(Person).where(
            or_(
                func.lower(Person.name).like(pattern),
                func.lower(Person.bio_short).like(pattern),
            )
        )
        if country_filter:
            query = query.where(Person.primary_country_id.in_(country_filter))
        
        result = await db.execute(query.limit(limit))
        for person in result.scalars().all():
            year = person.birth_date.year if person.birth_date else None
            results.append(FacetedSearchResult(
                id=str(person.id),
                type="person",
                title=person.name,
                subtitle=person.bio_short[:100] if person.bio_short else None,
                year=year,
                country=str(person.primary_country_id) if person.primary_country_id else None,
            ))
            facet_types["person"] = facet_types.get("person", 0) + 1
            if year:
                decade = (year // 10) * 10
                facet_years[str(decade)] = facet_years.get(str(decade), 0) + 1
    
    # Search events
    if "event" in allowed_types:
        query = select(Event).where(
            or_(
                func.lower(Event.title).like(pattern),
                func.lower(Event.description).like(pattern),
            )
        )
        if country_filter:
            query = query.where(Event.primary_country_id.in_(country_filter))
        if category_filter:
            query = query.where(Event.category.in_(category_filter))
        if start_year:
            query = query.where(Event.start_date >= date(start_year, 1, 1))
        if end_year:
            query = query.where(Event.start_date <= date(end_year, 12, 31))
        
        result = await db.execute(query.limit(limit))
        for event in result.scalars().all():
            year = event.start_date.year if event.start_date else None
            results.append(FacetedSearchResult(
                id=str(event.id),
                type="event",
                title=event.title,
                subtitle=event.category,
                year=year,
                country=str(event.primary_country_id) if event.primary_country_id else None,
                category=event.category,
            ))
            facet_types["event"] = facet_types.get("event", 0) + 1
            if event.category:
                facet_categories[event.category] = facet_categories.get(event.category, 0) + 1
            if year:
                decade = (year // 10) * 10
                facet_years[str(decade)] = facet_years.get(str(decade), 0) + 1
    
    # Search conflicts
    if "conflict" in allowed_types:
        query = select(Conflict).where(
            or_(
                func.lower(Conflict.name).like(pattern),
                func.lower(Conflict.description).like(pattern),
            )
        )
        if start_year:
            query = query.where(Conflict.start_date >= date(start_year, 1, 1))
        if end_year:
            query = query.where(Conflict.start_date <= date(end_year, 12, 31))
        
        result = await db.execute(query.limit(limit))
        for conflict in result.scalars().all():
            year = conflict.start_date.year if conflict.start_date else None
            results.append(FacetedSearchResult(
                id=str(conflict.id),
                type="conflict",
                title=conflict.name,
                subtitle=conflict.conflict_type,
                year=year,
                category=conflict.conflict_type,
            ))
            facet_types["conflict"] = facet_types.get("conflict", 0) + 1
            if year:
                decade = (year // 10) * 10
                facet_years[str(decade)] = facet_years.get(str(decade), 0) + 1
    
    # Search countries
    if "country" in allowed_types:
        query = select(Country).where(func.lower(Country.name_en).like(pattern))
        result = await db.execute(query.limit(limit))
        for country in result.scalars().all():
            results.append(FacetedSearchResult(
                id=str(country.id),
                type="country",
                title=country.name_en,
            ))
            facet_types["country"] = facet_types.get("country", 0) + 1
            facet_countries[country.name_en] = facet_countries.get(country.name_en, 0) + 1
    
    # Search parties
    if "party" in allowed_types:
        query = select(PoliticalParty).where(
            or_(
                func.lower(PoliticalParty.name).like(pattern),
                func.lower(PoliticalParty.abbreviation).like(pattern),
            )
        )
        if country_filter:
            query = query.where(PoliticalParty.country_id.in_(country_filter))
        
        result = await db.execute(query.limit(limit))
        for party in result.scalars().all():
            year = party.founded.year if party.founded else None
            results.append(FacetedSearchResult(
                id=str(party.id),
                type="party",
                title=party.name,
                subtitle=party.party_family,
                year=year,
                country=str(party.country_id),
                category=party.party_family,
            ))
            facet_types["party"] = facet_types.get("party", 0) + 1
            if party.party_family:
                facet_categories[party.party_family] = facet_categories.get(party.party_family, 0) + 1
    
    # Sort results by relevance
    q_lower = q.lower()
    def relevance_score(r: FacetedSearchResult) -> float:
        title_lower = r.title.lower()
        if title_lower == q_lower:
            return 1.0
        elif title_lower.startswith(q_lower):
            return 0.8
        elif q_lower in title_lower:
            return 0.5
        return 0.3
    
    for r in results:
        r.relevance_score = relevance_score(r)
    
    results.sort(key=lambda r: (-r.relevance_score, r.title.lower()))
    results = results[offset:offset + limit]
    
    return FacetedSearchResponse(
        query=q,
        total=len(results),
        results=results,
        facets=SearchFacets(
            types=[FacetValue(value=k, count=v) for k, v in sorted(facet_types.items(), key=lambda x: -x[1])],
            categories=[FacetValue(value=k, count=v) for k, v in sorted(facet_categories.items(), key=lambda x: -x[1])[:10]],
            countries=[FacetValue(value=k, count=v) for k, v in sorted(facet_countries.items(), key=lambda x: -x[1])[:10]],
            years=[FacetValue(value=k, count=v) for k, v in sorted(facet_years.items())],
        ),
    )
