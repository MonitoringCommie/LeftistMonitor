"""Geography business logic."""
from datetime import date
from typing import Optional
from uuid import UUID

from geoalchemy2.functions import ST_AsGeoJSON, ST_SimplifyPreserveTopology
from sqlalchemy import and_, or_, select, func
from sqlalchemy.orm import aliased
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Country, CountryBorder, CountryCapital
from .schemas import GeoJSONFeature, GeoJSONFeatureCollection
import json


class GeographyService:
    """Service for geography operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_countries(
        self,
        year: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[list[Country], int]:
        """Get countries with optional filtering."""
        query = select(Country)
        
        # Filter by year (country must exist in that year)
        if year:
            target_date = date(year, 7, 1)  # Mid-year
            query = query.where(
                and_(
                    Country.valid_from <= target_date,
                    or_(
                        Country.valid_to.is_(None),
                        Country.valid_to >= target_date,
                    ),
                )
            )
        
        # Search by name
        if search:
            query = query.where(
                Country.name_en.ilike(f"%{search}%")
            )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query)
        
        # Apply pagination
        query = query.offset((page - 1) * per_page).limit(per_page)
        query = query.order_by(Country.name_en)
        
        result = await self.db.execute(query)
        countries = result.scalars().all()
        
        return list(countries), total or 0
    
    async def get_country(self, country_id: UUID) -> Optional[Country]:
        """Get a single country by ID."""
        result = await self.db.execute(
            select(Country).where(Country.id == country_id)
        )
        return result.scalar_one_or_none()
    
    async def get_borders_geojson(
        self,
        year: int,
        simplify: Optional[float] = None,
    ) -> GeoJSONFeatureCollection:
        """Get all borders as GeoJSON for a specific year."""
        target_date = date(year, 7, 1)
        
        # Build geometry expression
        if simplify and simplify > 0:
            geom_expr = ST_AsGeoJSON(
                ST_SimplifyPreserveTopology(CountryBorder.geometry, simplify)
            )
        else:
            geom_expr = ST_AsGeoJSON(CountryBorder.geometry)
        
        # Query borders valid for the target year
        query = (
            select(
                Country.id,
                Country.name_en,
                Country.name_short,
                Country.iso_alpha2,
                Country.iso_alpha3,
                Country.gwcode,
                Country.entity_type,
                geom_expr.label("geometry"),
            )
            .join(CountryBorder, Country.id == CountryBorder.country_id)
            .where(
                and_(
                    Country.valid_from <= target_date,
                    or_(
                        Country.valid_to.is_(None),
                        Country.valid_to >= target_date,
                    ),
                    CountryBorder.valid_from <= target_date,
                    or_(
                        CountryBorder.valid_to.is_(None),
                        CountryBorder.valid_to >= target_date,
                    ),
                )
            )
        )
        
        result = await self.db.execute(query)
        rows = result.all()
        
        features = []
        for row in rows:
            feature = GeoJSONFeature(
                type="Feature",
                properties={
                    "id": str(row.id),
                    "name": row.name_en,
                    "name_short": row.name_short,
                    "iso_alpha2": row.iso_alpha2,
                    "iso_alpha3": row.iso_alpha3,
                    "gwcode": row.gwcode,
                    "entity_type": row.entity_type,
                },
                geometry=json.loads(row.geometry) if row.geometry else {},
            )
            features.append(feature)
        
        return GeoJSONFeatureCollection(features=features)
    
    async def get_country_border(
        self,
        country_id: UUID,
        year: int,
    ) -> Optional[dict]:
        """Get border for a specific country and year."""
        target_date = date(year, 7, 1)
        
        query = (
            select(
                CountryBorder.id,
                ST_AsGeoJSON(CountryBorder.geometry).label("geometry"),
                CountryBorder.valid_from,
                CountryBorder.valid_to,
                CountryBorder.area_km2,
            )
            .where(
                and_(
                    CountryBorder.country_id == country_id,
                    CountryBorder.valid_from <= target_date,
                    or_(
                        CountryBorder.valid_to.is_(None),
                        CountryBorder.valid_to >= target_date,
                    ),
                )
            )
        )
        
        result = await self.db.execute(query)
        row = result.first()
        
        if not row:
            return None
        
        return {
            "id": str(row.id),
            "geometry": json.loads(row.geometry) if row.geometry else None,
            "valid_from": row.valid_from.isoformat(),
            "valid_to": row.valid_to.isoformat() if row.valid_to else None,
            "area_km2": row.area_km2,
        }

    async def get_all_borders_geojson(
        self,
        simplify: Optional[float] = None,
    ) -> dict:
        """Get all borders with date ranges for client-side temporal filtering."""
        if simplify and simplify > 0:
            geom_expr = ST_AsGeoJSON(
                ST_SimplifyPreserveTopology(CountryBorder.geometry, simplify)
            )
        else:
            geom_expr = ST_AsGeoJSON(CountryBorder.geometry)

        query = (
            select(
                Country.id,
                Country.name_en,
                Country.name_short,
                Country.iso_alpha2,
                Country.iso_alpha3,
                Country.gwcode,
                Country.entity_type,
                CountryBorder.valid_from,
                CountryBorder.valid_to,
                geom_expr.label("geometry"),
            )
            .join(CountryBorder, Country.id == CountryBorder.country_id)
            .order_by(Country.name_en, CountryBorder.valid_from)
        )

        result = await self.db.execute(query)
        rows = result.all()

        features = []
        for row in rows:
            feature = {
                "type": "Feature",
                "properties": {
                    "id": str(row.id),
                    "name": row.name_en,
                    "name_short": row.name_short,
                    "iso_alpha2": row.iso_alpha2,
                    "iso_alpha3": row.iso_alpha3,
                    "gwcode": row.gwcode,
                    "entity_type": row.entity_type,
                    "valid_from": row.valid_from.isoformat(),
                    "valid_to": row.valid_to.isoformat() if row.valid_to else None,
                },
                "geometry": json.loads(row.geometry) if row.geometry else {},
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "features": features,
        }

    async def get_relationships_for_year(
        self,
        year: int,
        relationship_type: Optional[str] = None,
    ) -> List[dict]:
        """Get all country relationships active in a given year."""
        from .models import CountryRelationship, CountryCapital
        from sqlalchemy import func as sqlfunc
        
        target_date = date(year, 7, 1)
        
        # Subquery to get latest capital for each country as of the target date
        capital_subq = (
            select(
                CountryCapital.country_id,
                sqlfunc.ST_X(CountryCapital.location).label("lng"),
                sqlfunc.ST_Y(CountryCapital.location).label("lat"),
            )
            .where(
                CountryCapital.valid_from <= target_date,
                or_(
                    CountryCapital.valid_to.is_(None),
                    CountryCapital.valid_to >= target_date,
                ),
            )
            .distinct(CountryCapital.country_id)
            .order_by(CountryCapital.country_id, CountryCapital.valid_from.desc())
            .subquery()
        )
        
        # Alias for country tables
        CountryA = aliased(Country)
        CountryB = aliased(Country)
        CapitalA = aliased(capital_subq)
        CapitalB = aliased(capital_subq)
        
        query = (
            select(
                CountryRelationship.id,
                CountryRelationship.country_a_id,
                CountryA.name_en.label("country_a_name"),
                CapitalA.c.lat.label("country_a_lat"),
                CapitalA.c.lng.label("country_a_lng"),
                CountryRelationship.country_b_id,
                CountryB.name_en.label("country_b_name"),
                CapitalB.c.lat.label("country_b_lat"),
                CapitalB.c.lng.label("country_b_lng"),
                CountryRelationship.relationship_type,
                CountryRelationship.relationship_nature,
                CountryRelationship.name,
                CountryRelationship.description,
                CountryRelationship.valid_from,
                CountryRelationship.valid_to,
            )
            .join(CountryA, CountryRelationship.country_a_id == CountryA.id)
            .join(CountryB, CountryRelationship.country_b_id == CountryB.id)
            .outerjoin(CapitalA, CountryRelationship.country_a_id == CapitalA.c.country_id)
            .outerjoin(CapitalB, CountryRelationship.country_b_id == CapitalB.c.country_id)
            .where(
                CountryRelationship.valid_from <= target_date,
                or_(
                    CountryRelationship.valid_to.is_(None),
                    CountryRelationship.valid_to >= target_date,
                ),
            )
        )
        
        if relationship_type:
            query = query.where(CountryRelationship.relationship_type == relationship_type)
        
        result = await self.db.execute(query)
        rows = result.all()
        
        return [
            {
                "id": row.id,
                "country_a_id": row.country_a_id,
                "country_a_name": row.country_a_name,
                "country_a_lat": row.country_a_lat,
                "country_a_lng": row.country_a_lng,
                "country_b_id": row.country_b_id,
                "country_b_name": row.country_b_name,
                "country_b_lat": row.country_b_lat,
                "country_b_lng": row.country_b_lng,
                "relationship_type": row.relationship_type,
                "relationship_nature": row.relationship_nature,
                "name": row.name,
                "description": row.description,
                "valid_from": row.valid_from,
                "valid_to": row.valid_to,
            }
            for row in rows
        ]
