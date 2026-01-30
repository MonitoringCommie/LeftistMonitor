"""People API schemas."""
from datetime import date
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PersonListItem(BaseModel):
    id: UUID
    name: str
    name_native: Optional[str] = None
    birth_date: Optional[date] = None
    death_date: Optional[date] = None
    person_types: Optional[List[str]] = None
    ideology_tags: Optional[List[str]] = None
    bio_short: Optional[str] = None
    image_url: Optional[str] = None
    primary_country_id: Optional[UUID] = None
    model_config = ConfigDict(from_attributes=True)


class PersonConnectionResponse(BaseModel):
    id: UUID
    person_id: UUID
    person_name: str
    person_image: Optional[str] = None
    connection_type: str
    description: Optional[str] = None
    strength: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class PersonPositionResponse(BaseModel):
    id: UUID
    title: str
    position_type: str
    country_id: Optional[UUID] = None
    country_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    model_config = ConfigDict(from_attributes=True)


class BookListItem(BaseModel):
    id: UUID
    title: str
    publication_year: Optional[int] = None
    book_type: Optional[str] = None
    topics: Optional[List[str]] = None
    cover_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class PersonResponse(PersonListItem):
    wikidata_id: Optional[str] = None
    bio_full: Optional[str] = None
    progressive_analysis: Optional[str] = None
    birth_place: Optional[str] = None
    death_place: Optional[str] = None
    connections: List[PersonConnectionResponse] = []
    positions: List[PersonPositionResponse] = []
    books: List[BookListItem] = []


class BookAuthorResponse(BaseModel):
    person_id: UUID
    person_name: str
    role: str


class BookResponse(BookListItem):
    title_original: Optional[str] = None
    publisher: Optional[str] = None
    description: Optional[str] = None
    significance: Optional[str] = None
    progressive_analysis: Optional[str] = None
    marxists_archive_url: Optional[str] = None
    gutenberg_url: Optional[str] = None
    pdf_url: Optional[str] = None
    wikidata_id: Optional[str] = None
    isbn: Optional[str] = None
    authors: List[BookAuthorResponse] = []


class ConnectionGraphNode(BaseModel):
    id: str
    name: str
    image: Optional[str] = None
    person_types: Optional[List[str]] = None


class ConnectionGraphLink(BaseModel):
    source: str
    target: str
    type: str
    strength: float


class ConnectionGraphResponse(BaseModel):
    nodes: List[ConnectionGraphNode]
    links: List[ConnectionGraphLink]
