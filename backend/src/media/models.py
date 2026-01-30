"""Media and documentary links models."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import Date, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from ..database import Base


class MediaResource(Base):
    """Documentary, video, podcast, or other media resource."""
    __tablename__ = "media_resources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_original: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Classification
    media_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: documentary, film, podcast, lecture, interview, news_clip, music, art
    
    # Release info
    release_year: Mapped[Optional[int]] = mapped_column(Integer)
    release_date: Mapped[Optional[date]] = mapped_column(Date)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Creator info
    director: Mapped[Optional[str]] = mapped_column(String(255))
    producer: Mapped[Optional[str]] = mapped_column(String(255))
    creator: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    synopsis: Mapped[Optional[str]] = mapped_column(Text)
    
    # Links
    primary_url: Mapped[Optional[str]] = mapped_column(String(1000))
    youtube_url: Mapped[Optional[str]] = mapped_column(String(500))
    archive_url: Mapped[Optional[str]] = mapped_column(String(500))
    imdb_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Thumbnail
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Language
    language: Mapped[Optional[str]] = mapped_column(String(50))
    has_subtitles: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(10)))
    
    # Classification
    topics: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    regions: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    time_period_start: Mapped[Optional[int]] = mapped_column(Integer)
    time_period_end: Mapped[Optional[int]] = mapped_column(Integer)
    
    # External IDs
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    imdb_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    # Progressive perspective
    progressive_relevance: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class MediaEntityLink(Base):
    """Links media resources to entities (people, events, etc.)."""
    __tablename__ = "media_entity_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    media_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('media_resources.id', ondelete='CASCADE')
    )
    
    # Linked entity
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: person, event, conflict, country, movement
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Relationship type
    relationship: Mapped[str] = mapped_column(String(50), nullable=False)
    # Relationships: about, features, mentions, documentary_of, interview_with
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text)
