"""Pydantic schemas for admin CRUD operations."""
from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ============== Book Schemas ==============

class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    title_original: Optional[str] = None
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    publisher: Optional[str] = None
    book_type: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    description: Optional[str] = None
    significance: Optional[str] = None
    progressive_analysis: Optional[str] = None
    marxists_archive_url: Optional[str] = None
    gutenberg_url: Optional[str] = None
    pdf_url: Optional[str] = None
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    isbn: Optional[str] = None
    author_ids: List[UUID] = Field(default_factory=list)


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    title_original: Optional[str] = None
    publication_year: Optional[int] = Field(None, ge=1000, le=2100)
    publisher: Optional[str] = None
    book_type: Optional[str] = None
    topics: Optional[List[str]] = None
    description: Optional[str] = None
    significance: Optional[str] = None
    progressive_analysis: Optional[str] = None
    marxists_archive_url: Optional[str] = None
    gutenberg_url: Optional[str] = None
    pdf_url: Optional[str] = None
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    isbn: Optional[str] = None
    author_ids: Optional[List[UUID]] = None


# ============== Person Schemas ==============

class PersonCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=300)
    name_native: Optional[str] = None
    birth_date: Optional[date] = None
    death_date: Optional[date] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    nationality: Optional[str] = None
    bio_short: Optional[str] = None
    bio_full: Optional[str] = None
    ideology_tags: List[str] = Field(default_factory=list)
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    image_url: Optional[str] = None


class PersonUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=300)
    name_native: Optional[str] = None
    birth_date: Optional[date] = None
    death_date: Optional[date] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    nationality: Optional[str] = None
    bio_short: Optional[str] = None
    bio_full: Optional[str] = None
    ideology_tags: Optional[List[str]] = None
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    image_url: Optional[str] = None


# ============== Event Schemas ==============

class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    primary_country_id: Optional[UUID] = None
    importance: Optional[int] = Field(None, ge=1, le=10)
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    progressive_analysis: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None
    location_name: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    primary_country_id: Optional[UUID] = None
    importance: Optional[int] = Field(None, ge=1, le=10)
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    progressive_analysis: Optional[str] = None


# ============== Conflict Schemas ==============

class ConflictCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=500)
    conflict_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    casualties_low: Optional[int] = Field(None, ge=0)
    casualties_high: Optional[int] = Field(None, ge=0)
    displaced: Optional[int] = Field(None, ge=0)
    intensity: Optional[str] = None
    belligerents: List[str] = Field(default_factory=list)
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    progressive_analysis: Optional[str] = None


class ConflictUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=500)
    conflict_type: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    casualties_low: Optional[int] = Field(None, ge=0)
    casualties_high: Optional[int] = Field(None, ge=0)
    displaced: Optional[int] = Field(None, ge=0)
    intensity: Optional[str] = None
    belligerents: Optional[List[str]] = None
    wikipedia_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    progressive_analysis: Optional[str] = None


# ============== Country Schemas ==============

class CountryUpdate(BaseModel):
    name_en: Optional[str] = Field(None, min_length=1, max_length=200)
    name_native: Optional[str] = None
    description: Optional[str] = None
    iso_alpha2: Optional[str] = Field(None, max_length=2)
    iso_alpha3: Optional[str] = Field(None, max_length=3)


# ============== Audit Log ==============

class AuditLogEntry(BaseModel):
    id: UUID
    table_name: str
    record_id: UUID
    action: str  # CREATE, UPDATE, DELETE
    old_data: Optional[dict] = None
    new_data: Optional[dict] = None
    user_id: UUID
    user_email: str
    created_at: datetime
