"""Geography Pydantic schemas."""
from datetime import date, datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CountryBase(BaseModel):
    """Base country schema."""
    
    name_en: str
    name_native: Optional[str] = None
    name_short: Optional[str] = None
    gwcode: Optional[int] = None
    cowcode: Optional[int] = None
    iso_alpha2: Optional[str] = None
    iso_alpha3: Optional[str] = None
    wikidata_id: Optional[str] = None
    entity_type: str = "sovereign_state"
    valid_from: date
    valid_to: Optional[date] = None
    description: Optional[str] = None


class CountryCreate(CountryBase):
    """Schema for creating a country."""
    pass


class CountryResponse(CountryBase):
    """Schema for country response."""
    
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CountryListItem(BaseModel):
    """Simplified country for list responses."""
    
    id: UUID
    name_en: str
    name_short: Optional[str] = None
    iso_alpha2: Optional[str] = None
    iso_alpha3: Optional[str] = None
    entity_type: str
    valid_from: date
    valid_to: Optional[date] = None
    
    model_config = ConfigDict(from_attributes=True)


class BorderBase(BaseModel):
    """Base border schema."""
    
    valid_from: date
    valid_to: Optional[date] = None
    source: str = "manual"
    source_id: Optional[str] = None
    area_km2: Optional[float] = None


class BorderResponse(BorderBase):
    """Schema for border response."""
    
    id: UUID
    country_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class GeoJSONFeature(BaseModel):
    """GeoJSON Feature."""
    
    type: str = "Feature"
    properties: dict[str, Any]
    geometry: dict[str, Any]


class GeoJSONFeatureCollection(BaseModel):
    """GeoJSON FeatureCollection."""
    
    type: str = "FeatureCollection"
    features: list[GeoJSONFeature]


class CapitalResponse(BaseModel):
    """Capital response schema."""
    
    id: UUID
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    valid_from: date
    valid_to: Optional[date] = None
    
    model_config = ConfigDict(from_attributes=True)


class CountryRelationshipResponse(BaseModel):
    """Country relationship response schema."""

    id: UUID
    country_a_id: UUID
    country_a_name: str
    country_a_lat: Optional[float] = None
    country_a_lng: Optional[float] = None
    country_b_id: UUID
    country_b_name: str
    country_b_lat: Optional[float] = None
    country_b_lng: Optional[float] = None
    relationship_type: str
    relationship_nature: str
    name: Optional[str] = None
    description: Optional[str] = None
    valid_from: date
    valid_to: Optional[date] = None

    model_config = ConfigDict(from_attributes=True)
