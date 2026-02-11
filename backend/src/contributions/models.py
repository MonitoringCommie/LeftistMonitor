"""
User Contributions Models

Handles community-submitted data for events, people, locations,
and other historical records pending moderation.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID, uuid4


class ContributionType(str, Enum):
    """Types of contributions users can submit."""
    EVENT = "event"
    PERSON = "person"
    LOCATION = "location"
    DOCUMENT = "document"
    CORRECTION = "correction"
    TRANSLATION = "translation"


class ContributionStatus(str, Enum):
    """Status of a contribution in the review pipeline."""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    NEEDS_REVISION = "needs_revision"
    APPROVED = "approved"
    REJECTED = "rejected"
    MERGED = "merged"


class SourceType(str, Enum):
    """Types of sources for verification."""
    ACADEMIC = "academic"
    NEWS = "news"
    PRIMARY = "primary"
    ARCHIVE = "archive"
    ORAL_HISTORY = "oral_history"
    GOVERNMENT = "government"
    NGO = "ngo"
    OTHER = "other"


class Source(BaseModel):
    """A source citation for a contribution."""
    type: SourceType
    title: str
    url: Optional[str] = None
    author: Optional[str] = None
    publication_date: Optional[str] = None
    accessed_date: Optional[str] = None
    notes: Optional[str] = None


class EventContribution(BaseModel):
    """Data for an event contribution."""
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=20, max_length=10000)
    date_start: str  # ISO format
    date_end: Optional[str] = None
    location_name: str
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    country_code: Optional[str] = Field(None, max_length=3)
    categories: List[str] = Field(default_factory=list)
    related_people: List[str] = Field(default_factory=list)
    death_toll: Optional[int] = Field(None, ge=0)
    injuries: Optional[int] = Field(None, ge=0)
    participants: Optional[int] = Field(None, ge=0)


class PersonContribution(BaseModel):
    """Data for a person contribution."""
    name: str = Field(..., min_length=2, max_length=200)
    birth_date: Optional[str] = None
    death_date: Optional[str] = None
    birth_place: Optional[str] = None
    nationality: Optional[str] = None
    occupation: List[str] = Field(default_factory=list)
    organizations: List[str] = Field(default_factory=list)
    biography: str = Field(..., min_length=50, max_length=20000)
    achievements: List[str] = Field(default_factory=list)
    related_events: List[str] = Field(default_factory=list)


class LocationContribution(BaseModel):
    """Data for a location/site contribution."""
    name: str = Field(..., min_length=2, max_length=300)
    description: str = Field(..., min_length=20, max_length=10000)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    country_code: str = Field(..., max_length=3)
    location_type: str  # memorial, massacre_site, prison, headquarters, etc.
    date_established: Optional[str] = None
    date_destroyed: Optional[str] = None
    current_status: Optional[str] = None


class DocumentContribution(BaseModel):
    """Data for a document/artifact contribution."""
    title: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=20, max_length=10000)
    document_type: str  # manifesto, letter, pamphlet, treaty, etc.
    author: Optional[str] = None
    date_created: Optional[str] = None
    language: str = "en"
    full_text: Optional[str] = None
    transcription: Optional[str] = None
    related_events: List[str] = Field(default_factory=list)
    related_people: List[str] = Field(default_factory=list)


class CorrectionContribution(BaseModel):
    """Data for correcting existing records."""
    entity_type: str  # event, person, location, etc.
    entity_id: str
    field_name: str
    current_value: str
    proposed_value: str
    reason: str = Field(..., min_length=10, max_length=2000)


class TranslationContribution(BaseModel):
    """Data for translating existing content."""
    entity_type: str
    entity_id: str
    target_language: str = Field(..., max_length=5)
    field_name: str
    translated_text: str = Field(..., min_length=1, max_length=50000)


class ContributionCreate(BaseModel):
    """Request model for creating a new contribution."""
    contribution_type: ContributionType
    data: dict  # Polymorphic - validated based on type
    sources: List[Source] = Field(..., min_length=1)
    notes: Optional[str] = Field(None, max_length=5000)
    language: str = Field("en", max_length=5)


class ContributionResponse(BaseModel):
    """Response model for a contribution."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    contribution_type: ContributionType
    status: ContributionStatus
    data: dict
    sources: List[Source]
    notes: Optional[str]
    language: str
    
    # Metadata
    submitted_by: UUID
    submitted_at: datetime
    updated_at: datetime
    
    # Review info
    reviewer_id: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    
    # Stats
    upvotes: int = 0
    downvotes: int = 0


class ContributionUpdate(BaseModel):
    """Request model for updating a contribution."""
    data: Optional[dict] = None
    sources: Optional[List[Source]] = None
    notes: Optional[str] = Field(None, max_length=5000)


class ReviewAction(BaseModel):
    """Request model for reviewer actions."""
    action: ContributionStatus
    notes: Optional[str] = Field(None, max_length=5000)
    rejection_reason: Optional[str] = Field(None, max_length=2000)


class ContributionVote(BaseModel):
    """Request model for voting on contributions."""
    vote: int = Field(..., ge=-1, le=1)  # -1, 0, or 1


class ContributionFilter(BaseModel):
    """Filter parameters for listing contributions."""
    contribution_type: Optional[ContributionType] = None
    status: Optional[ContributionStatus] = None
    submitted_by: Optional[UUID] = None
    language: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    search: Optional[str] = None


class ContributionStats(BaseModel):
    """Statistics about contributions."""
    total: int
    pending: int
    under_review: int
    approved: int
    rejected: int
    merged: int
    by_type: dict
    top_contributors: List[dict]
