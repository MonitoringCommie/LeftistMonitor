"""Labor movement models - unions, strikes, worker organizations."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import (
    Date, DateTime, Float, ForeignKey, Integer, String, Text, Boolean
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry

from ..database import Base


class LaborOrganization(Base):
    """Trade union or worker organization."""
    __tablename__ = "labor_organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_native: Mapped[Optional[str]] = mapped_column(String(255))
    abbreviation: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Classification
    organization_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: trade_union, federation, confederation, workers_council, cooperative, guild
    
    industry_sectors: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    # Sectors: mining, manufacturing, transport, agriculture, services, public_sector, etc.
    
    # Dates
    founded: Mapped[Optional[date]] = mapped_column(Date)
    dissolved: Mapped[Optional[date]] = mapped_column(Date)
    
    # Location
    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    headquarters_city: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Membership
    peak_membership: Mapped[Optional[int]] = mapped_column(Integer)
    peak_membership_year: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Ideology
    ideology_tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(50)))
    political_affiliation: Mapped[Optional[str]] = mapped_column(String(100))
    
    # External IDs
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    strikes: Mapped[List["Strike"]] = relationship(back_populates="organization")


class Strike(Base):
    """Labor strike or industrial action."""
    __tablename__ = "strikes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Classification
    strike_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: general_strike, industry_strike, sympathy_strike, sit_down, wildcat, lockout
    
    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Location
    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    location_name: Mapped[Optional[str]] = mapped_column(String(255))
    location: Mapped[Optional[str]] = mapped_column(Geometry(geometry_type='POINT', srid=4326))
    
    # Organization
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey('labor_organizations.id')
    )
    
    # Scale
    participants: Mapped[Optional[int]] = mapped_column(Integer)
    industries_affected: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    
    # Outcome
    outcome: Mapped[Optional[str]] = mapped_column(String(50))
    # Outcomes: victory, partial_victory, defeat, compromise, ongoing, suppressed
    
    demands: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(255)))
    achievements: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(255)))
    
    # Violence/repression
    casualties: Mapped[Optional[int]] = mapped_column(Integer)
    arrests: Mapped[Optional[int]] = mapped_column(Integer)
    government_response: Mapped[Optional[str]] = mapped_column(Text)
    
    # External IDs
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)
    significance: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    organization: Mapped[Optional[LaborOrganization]] = relationship(back_populates="strikes")


class LaborLeader(Base):
    """Link between people and labor organizations."""
    __tablename__ = "labor_leaders"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('people.id'))
    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('labor_organizations.id'))
    
    role: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
