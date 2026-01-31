"""Geography API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import NotFoundError
from ..core.pagination import PaginatedResponse
from ..database import get_db
from .schemas import CountryListItem, CountryResponse, GeoJSONFeatureCollection, CountryRelationshipResponse
from .service import GeographyService
from .models import Country
from sqlalchemy import select
from typing import List

router = APIRouter()


@router.get("/countries", response_model=PaginatedResponse[CountryListItem])
async def list_countries(
    year: Optional[int] = Query(None, ge=1800, le=2100, description="Filter by year"),
    search: Optional[str] = Query(None, min_length=1, description="Search by name"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """
    List countries with optional filtering.

    - **year**: Filter to countries existing in that year
    - **search**: Search by country name (case-insensitive)
    """
    service = GeographyService(db)
    countries, total = await service.get_countries(
        year=year,
        search=search,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[CountryListItem.model_validate(c) for c in countries],
        total=total,
        page=page,
        per_page=per_page,
    )




@router.get("/countries/stats")
async def get_global_country_stats(
    db: AsyncSession = Depends(get_db),
) -> List[dict]:
    """Get statistics for all countries for global rankings."""
    from .economic_router import load_worldbank_data, get_country_code
    
    wb_data, _ = load_worldbank_data()
    
    result = await db.execute(select(Country).where(Country.entity_type == 'sovereign_state'))
    countries = result.scalars().all()
    
    stats = []
    for country in countries:
        country_code = get_country_code(country.name_en)
        
        stat = {
            "id": str(country.id),
            "name": country.name_en,
            "iso_alpha3": country.iso_alpha3,
            "gdp": None,
            "population": None,
            "military_spending_pct": None,
        }
        
        if country_code and country_code in wb_data:
            country_wb = wb_data[country_code]
            for year in range(2023, 2000, -1):
                year_str = str(year)
                year_data = country_wb.get("data", {}).get(year_str, {})
                
                if stat["gdp"] is None and year_data.get("gdp_current_usd"):
                    stat["gdp"] = year_data["gdp_current_usd"]
                
                if stat["population"] is None and year_data.get("population"):
                    stat["population"] = year_data["population"]
                
                if stat["military_spending_pct"] is None and year_data.get("military_spending_gdp_pct"):
                    stat["military_spending_pct"] = year_data["military_spending_gdp_pct"]
                
                if all([stat["gdp"], stat["population"], stat["military_spending_pct"]]):
                    break
        
        stats.append(stat)
    
    return stats


@router.get("/countries/{country_id}", response_model=CountryResponse)
async def get_country(
    country_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific country by ID."""
    service = GeographyService(db)
    country = await service.get_country(country_id)

    if not country:
        raise NotFoundError(f"Country {country_id} not found")

    return CountryResponse.model_validate(country)


@router.get("/borders/geojson", response_model=GeoJSONFeatureCollection)
async def get_borders_geojson(
    response: Response,
    year: int = Query(..., ge=1800, le=2100, description="Year for borders"),
    simplify: Optional[float] = Query(
        None, ge=0, le=1, description="Simplification tolerance (0-1)"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all country borders as GeoJSON for a specific year.

    - **year**: The year to get borders for
    - **simplify**: Optional simplification tolerance for reducing geometry complexity
    """
    # Cache for 1 hour - borders don't change often
    response.headers["Cache-Control"] = "public, max-age=3600"
    
    service = GeographyService(db)
    return await service.get_borders_geojson(year=year, simplify=simplify)


@router.get("/countries/{country_id}/borders")
async def get_country_border(
    country_id: UUID,
    year: int = Query(..., ge=1800, le=2100, description="Year for border"),
    db: AsyncSession = Depends(get_db),
):
    """Get border geometry for a specific country and year."""
    service = GeographyService(db)
    border = await service.get_country_border(country_id, year)

    if not border:
        raise NotFoundError(f"No border found for country {country_id} in year {year}")

    return border


@router.get("/borders/all")
async def get_all_borders_geojson(
    response: Response,
    simplify: Optional[float] = Query(
        0.01, ge=0, le=1, description="Simplification tolerance (0-1)"
    ),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all country borders with date ranges for client-side filtering.

    Returns all borders at once, allowing the frontend to filter by year
    without additional API calls. This enables fluid time slider animation.
    """
    # Cache for 24 hours - this is static data
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    service = GeographyService(db)
    return await service.get_all_borders_geojson(simplify=simplify)


@router.get("/relationships", response_model=list[CountryRelationshipResponse])
async def get_relationships(
    response: Response,
    year: int = Query(..., ge=1800, le=2100, description="Year to get relationships for"),
    relationship_type: Optional[str] = Query(None, description="Filter by type: alliance, conflict, treaty"),
    db: AsyncSession = Depends(get_db),
):
    """Get country relationships active in a given year."""
    # Cache for 1 hour
    response.headers["Cache-Control"] = "public, max-age=3600"
    
    service = GeographyService(db)
    return await service.get_relationships_for_year(year, relationship_type)
