"""CShapes 2.0 historical borders importer."""
import asyncio
from datetime import date
from pathlib import Path
from typing import Any, AsyncGenerator
import json

import geopandas as gpd
from shapely.geometry import mapping, shape
from shapely.ops import transform
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.shape import from_shape

from ..geography.models import Country, CountryBorder, CountryCapital
from .base import BaseImporter


class CShapesImporter(BaseImporter):
    """Import historical borders from CShapes 2.0 dataset.
    
    CShapes provides historical state boundaries from 1886 to 2019.
    Download from: https://icr.ethz.ch/data/cshapes/
    """
    
    def __init__(
        self,
        db: AsyncSession,
        file_path: str | Path,
        batch_size: int = 100,
    ):
        super().__init__(db, batch_size)
        self.file_path = Path(file_path)
        self._gdf = None
    
    def _load_geodataframe(self) -> gpd.GeoDataFrame:
        """Load the CShapes file into a GeoDataFrame."""
        if self._gdf is None:
            self.logger.info(f"Loading CShapes data from {self.file_path}")
            
            suffix = self.file_path.suffix.lower()
            if suffix == ".geojson" or suffix == ".json":
                self._gdf = gpd.read_file(self.file_path)
            elif suffix == ".shp":
                self._gdf = gpd.read_file(self.file_path)
            elif suffix == ".zip":
                # Handle zipped shapefiles
                self._gdf = gpd.read_file(f"zip://{self.file_path}")
            else:
                raise ValueError(f"Unsupported file format: {suffix}")
            
            self.logger.info(f"Loaded {len(self._gdf)} features")
        
        return self._gdf
    
    async def fetch_data(self) -> AsyncGenerator[dict[str, Any], None]:
        """Yield records from CShapes file."""
        gdf = self._load_geodataframe()
        
        for idx, row in gdf.iterrows():
            yield {
                "index": idx,
                "gwcode": row.get("gwcode") or row.get("GWCODE"),
                "cowcode": row.get("cowcode") or row.get("COWCODE"),
                "country_name": row.get("country_name") or row.get("CNTRY_NAME") or row.get("cntry_name"),
                "start_date": row.get("gwsdate") or row.get("GWSDATE") or row.get("start_date"),
                "end_date": row.get("gwedate") or row.get("GWEDATE") or row.get("end_date"),
                "capital_name": row.get("capname") or row.get("CAPNAME"),
                "capital_lat": row.get("caplat") or row.get("CAPLAT"),
                "capital_lon": row.get("caplong") or row.get("CAPLONG") or row.get("caplon"),
                "geometry": row.geometry,
            }
    
    def _parse_date(self, date_val: Any) -> date | None:
        """Parse date from various formats."""
        if date_val is None:
            return None
        
        if isinstance(date_val, date):
            return date_val
        
        if isinstance(date_val, str):
            # Try common formats
            for fmt in ["%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%Y"]:
                try:
                    from datetime import datetime
                    dt = datetime.strptime(date_val, fmt)
                    return dt.date()
                except ValueError:
                    continue
        
        # If it's a year as int
        if isinstance(date_val, (int, float)):
            year = int(date_val)
            if 1800 <= year <= 2100:
                return date(year, 1, 1)
        
        return None
    
    def transform(self, raw: dict[str, Any]) -> dict[str, Any] | None:
        """Transform CShapes record to our schema."""
        # Skip invalid records
        if not raw.get("country_name"):
            self.logger.warning(f"Skipping record {raw.get('index')}: no country name")
            return None
        
        if raw.get("geometry") is None or raw["geometry"].is_empty:
            self.logger.warning(f"Skipping {raw['country_name']}: no geometry")
            return None
        
        # Parse dates
        start_date = self._parse_date(raw.get("start_date"))
        end_date = self._parse_date(raw.get("end_date"))
        
        if not start_date:
            # Default to 1886 (CShapes start)
            start_date = date(1886, 1, 1)
        
        # Ensure geometry is MultiPolygon
        geom = raw["geometry"]
        if geom.geom_type == "Polygon":
            from shapely.geometry import MultiPolygon
            geom = MultiPolygon([geom])
        elif geom.geom_type != "MultiPolygon":
            self.logger.warning(f"Skipping {raw['country_name']}: unsupported geometry type {geom.geom_type}")
            return None
        
        return {
            "country": {
                "gwcode": int(raw["gwcode"]) if raw.get("gwcode") else None,
                "cowcode": int(raw["cowcode"]) if raw.get("cowcode") else None,
                "name_en": str(raw["country_name"]).strip(),
                "valid_from": start_date,
                "valid_to": end_date,
                "entity_type": "sovereign_state",
            },
            "border": {
                "geometry": geom,
                "valid_from": start_date,
                "valid_to": end_date,
                "source": "cshapes",
                "source_id": str(raw.get("index")),
            },
            "capital": {
                "name": raw["capital_name"],
                "lat": float(raw["capital_lat"]) if raw.get("capital_lat") else None,
                "lon": float(raw["capital_lon"]) if raw.get("capital_lon") else None,
            } if raw.get("capital_name") else None,
        }
    
    async def load(self, record: dict[str, Any]) -> None:
        """Load transformed record into database."""
        country_data = record["country"]
        border_data = record["border"]
        capital_data = record.get("capital")
        
        # Check if country already exists (by gwcode and date range)
        existing = None
        if country_data.get("gwcode"):
            result = await self.db.execute(
                select(Country).where(
                    Country.gwcode == country_data["gwcode"],
                    Country.valid_from == country_data["valid_from"],
                )
            )
            existing = result.scalar_one_or_none()
        
        if existing:
            # Update existing country
            country = existing
            for key, value in country_data.items():
                if value is not None:
                    setattr(country, key, value)
            self.stats["updated"] += 1
        else:
            # Create new country
            country = Country(**country_data)
            self.db.add(country)
            await self.db.flush()  # Get the ID
            self.stats["created"] += 1
        
        # Add border
        border = CountryBorder(
            country_id=country.id,
            geometry=from_shape(border_data["geometry"], srid=4326),
            valid_from=border_data["valid_from"],
            valid_to=border_data["valid_to"],
            source=border_data["source"],
            source_id=border_data["source_id"],
        )
        self.db.add(border)
        
        # Add capital if present
        if capital_data and capital_data.get("name"):
            from shapely.geometry import Point
            
            location = None
            if capital_data.get("lat") and capital_data.get("lon"):
                location = from_shape(
                    Point(capital_data["lon"], capital_data["lat"]),
                    srid=4326
                )
            
            capital = CountryCapital(
                country_id=country.id,
                name=capital_data["name"],
                location=location,
                valid_from=country_data["valid_from"],
                valid_to=country_data["valid_to"],
            )
            self.db.add(capital)


async def import_cshapes(db: AsyncSession, file_path: str) -> dict[str, int]:
    """Convenience function to run CShapes import."""
    importer = CShapesImporter(db, file_path)
    return await importer.run()
