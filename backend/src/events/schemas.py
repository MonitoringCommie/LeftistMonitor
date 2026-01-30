"""Events API schemas."""
from datetime import date
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class EventListItem(BaseModel):
    id: UUID
    title: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: str
    event_type: Optional[str] = None
    importance: Optional[int] = None
    location_name: Optional[str] = None
    image_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class EventResponse(EventListItem):
    title_native: Optional[str] = None
    description: Optional[str] = None
    progressive_analysis: Optional[str] = None
    tags: Optional[List[str]] = None
    wikidata_id: Optional[str] = None
    primary_country_id: Optional[UUID] = None


class ConflictParticipantResponse(BaseModel):
    id: UUID
    country_id: Optional[UUID] = None
    country_name: Optional[str] = None
    actor_name: Optional[str] = None
    side: str
    role: Optional[str] = None
    casualties: Optional[int] = None


class ConflictListItem(BaseModel):
    id: UUID
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    conflict_type: str
    intensity: Optional[str] = None
    casualties_low: Optional[int] = None
    casualties_high: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class ConflictResponse(ConflictListItem):
    ucdp_id: Optional[str] = None
    cow_id: Optional[str] = None
    wikidata_id: Optional[str] = None
    description: Optional[str] = None
    progressive_analysis: Optional[str] = None
    outcome: Optional[str] = None
    participants: List[ConflictParticipantResponse] = []


class TimelineEvent(BaseModel):
    """Combined event for timeline display."""
    id: UUID
    title: str
    date: date
    end_date: Optional[date] = None
    type: str  # "event", "election", "conflict_start", "conflict_end"
    category: Optional[str] = None
    importance: Optional[int] = None
