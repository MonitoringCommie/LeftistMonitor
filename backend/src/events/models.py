"""Historical events models."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import (
    Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text,
    Table, Column
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry

from ..database import Base


# Association table for event-country relationships
event_country_association = Table(
    'event_country_association',
    Base.metadata,
    Column('event_id', UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE')),
    Column('country_id', UUID(as_uuid=True), ForeignKey('countries.id', ondelete='CASCADE')),
    Column('role', String(50)),  # e.g., "primary", "affected", "participant"
)

# Association table for event-person relationships
event_person_association = Table(
    'event_person_association',
    Base.metadata,
    Column('event_id', UUID(as_uuid=True), ForeignKey('events.id', ondelete='CASCADE')),
    Column('person_id', UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE')),
    Column('role', String(100)),  # e.g., "leader", "participant", "victim", "perpetrator"
)


class Event(Base):
    """Historical event."""
    __tablename__ = "events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # External IDs
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    # Basic info
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_native: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    date_precision: Mapped[Optional[str]] = mapped_column(String(10))  # "day", "month", "year"
    
    # Classification
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    # Categories: "political", "economic", "cultural", "social", "military", "other"
    
    event_type: Mapped[Optional[str]] = mapped_column(String(100))
    # Types: "revolution", "election", "war", "treaty", "strike", "protest", "coup", "independence",
    #        "founding", "assassination", "reform", "crisis"
    
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(50)))
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)  # Leftist perspective
    
    # Importance (1-10 scale for filtering/display)
    importance: Mapped[Optional[int]] = mapped_column(Integer, default=5)
    
    # Location (optional point for mapping)
    location_name: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(Geometry(geometry_type='POINT', srid=4326))
    
    # Primary country (for quick filtering)
    primary_country_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    # Image
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Conflict(Base):
    """War or armed conflict."""
    __tablename__ = "conflicts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # External IDs
    ucdp_id: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    cow_id: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Classification
    conflict_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: "interstate", "civil_war", "colonial", "ethnic", "revolutionary", "proxy"
    
    intensity: Mapped[Optional[str]] = mapped_column(String(20))
    # Intensity: "minor" (25-999 deaths/year), "major" (1000+ deaths/year)
    
    # Casualties
    casualties_low: Mapped[Optional[int]] = mapped_column(Integer)
    casualties_high: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)  # Leftist perspective on the conflict
    
    # Outcome
    outcome: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    participants: Mapped[List["ConflictParticipant"]] = relationship(back_populates="conflict")


class ConflictParticipant(Base):
    """Participant in a conflict (country or non-state actor)."""
    __tablename__ = "conflict_participants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    conflict_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('conflicts.id', ondelete='CASCADE'))
    country_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    # For non-state actors
    actor_name: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Which side
    side: Mapped[str] = mapped_column(String(50), nullable=False)  # "side_a", "side_b", "neutral"
    
    # Role
    role: Mapped[Optional[str]] = mapped_column(String(50))
    # Roles: "primary", "supporting", "proxy", "mediator"
    
    # Casualties for this participant
    casualties: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Relationships
    conflict: Mapped[Conflict] = relationship(back_populates="participants")


class ConflictFrontline(Base):
    """Frontline/battle line position at a specific date."""
    __tablename__ = "conflict_frontlines"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    conflict_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('conflicts.id', ondelete='CASCADE'))

    # Date of this frontline snapshot
    date: Mapped[date] = mapped_column(Date, nullable=False)

    # Which side controls this area (for polygon data) or which side's line this is
    controlled_by: Mapped[str] = mapped_column(String(100), nullable=False)
    # e.g., "allies", "axis", "ukraine", "russia", "republicans", "nationalists"

    # Geometry - can be LineString (frontline) or Polygon (controlled area)
    geometry: Mapped[str] = mapped_column(Geometry(geometry_type='GEOMETRY', srid=4326), nullable=False)
    geometry_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "line" or "polygon"

    # Optional metadata
    source: Mapped[Optional[str]] = mapped_column(String(255))  # Data source
    notes: Mapped[Optional[str]] = mapped_column(Text)

    # Styling hints
    color: Mapped[Optional[str]] = mapped_column(String(20))  # Hex color for this side

    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
