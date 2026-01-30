"""Political parties and elections models."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import (
    Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text,
    Table, Column, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from ..database import Base


# Association table for party ideologies
party_ideology_association = Table(
    'party_ideology_association',
    Base.metadata,
    Column('party_id', UUID(as_uuid=True), ForeignKey('political_parties.id', ondelete='CASCADE')),
    Column('ideology_id', UUID(as_uuid=True), ForeignKey('ideologies.id', ondelete='CASCADE')),
)


class Ideology(Base):
    """Political ideology classification."""
    __tablename__ = "ideologies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    color: Mapped[Optional[str]] = mapped_column(String(7))  # Hex color
    
    # Position on political spectrum (-100 to 100)
    left_right_position: Mapped[Optional[float]] = mapped_column(Float)
    libertarian_authoritarian_position: Mapped[Optional[float]] = mapped_column(Float)
    
    parties: Mapped[List["PoliticalParty"]] = relationship(
        secondary=party_ideology_association,
        back_populates="ideologies"
    )


class PoliticalParty(Base):
    """Political party."""
    __tablename__ = "political_parties"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # External IDs for data linking
    parlgov_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    partyfacts_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    manifesto_id: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_english: Mapped[Optional[str]] = mapped_column(String(255))
    name_short: Mapped[Optional[str]] = mapped_column(String(50))
    
    # Country relationship
    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    # Dates
    founded: Mapped[Optional[date]] = mapped_column(Date)
    dissolved: Mapped[Optional[date]] = mapped_column(Date)
    
    # Political position (-100 far left to 100 far right)
    left_right_score: Mapped[Optional[float]] = mapped_column(Float)
    
    # Party family (e.g., "Social Democracy", "Christian Democracy", "Communist")
    party_family: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Description and analysis
    description: Mapped[Optional[str]] = mapped_column(Text)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)  # Leftist perspective
    
    # Logo URL
    logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Metadata
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Relationships
    ideologies: Mapped[List[Ideology]] = relationship(
        secondary=party_ideology_association,
        back_populates="parties"
    )
    election_results: Mapped[List["ElectionResult"]] = relationship(back_populates="party")
    memberships: Mapped[List["PartyMembership"]] = relationship(back_populates="party")


class Election(Base):
    """Election event."""
    __tablename__ = "elections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    # Election details
    date: Mapped[date] = mapped_column(Date, nullable=False)
    election_type: Mapped[str] = mapped_column(String(50), nullable=False)  # parliamentary, presidential, local
    
    # Turnout and stats
    turnout_percent: Mapped[Optional[float]] = mapped_column(Float)
    total_votes: Mapped[Optional[int]] = mapped_column(Integer)
    total_seats: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Notes
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # External IDs
    parlgov_id: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    results: Mapped[List["ElectionResult"]] = relationship(back_populates="election")
    
    __table_args__ = (
        UniqueConstraint('country_id', 'date', 'election_type', name='uq_election_country_date_type'),
    )


class ElectionResult(Base):
    """Results for a party in an election."""
    __tablename__ = "election_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    election_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('elections.id', ondelete='CASCADE'))
    party_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('political_parties.id', ondelete='CASCADE'))
    
    # Results
    votes: Mapped[Optional[int]] = mapped_column(Integer)
    vote_share: Mapped[Optional[float]] = mapped_column(Float)  # Percentage
    seats: Mapped[Optional[int]] = mapped_column(Integer)
    seat_share: Mapped[Optional[float]] = mapped_column(Float)  # Percentage
    
    # Relationships
    election: Mapped[Election] = relationship(back_populates="results")
    party: Mapped[PoliticalParty] = relationship(back_populates="election_results")
    
    __table_args__ = (
        UniqueConstraint('election_id', 'party_id', name='uq_election_result_party'),
    )


class PartyMembership(Base):
    """Person's membership in a political party."""
    __tablename__ = "party_memberships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE'))
    party_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('political_parties.id', ondelete='CASCADE'))
    
    # Membership period
    joined: Mapped[Optional[date]] = mapped_column(Date)
    left: Mapped[Optional[date]] = mapped_column(Date)
    
    # Role in the party
    role: Mapped[Optional[str]] = mapped_column(String(100))  # e.g., "Leader", "Member", "Co-founder"
    
    # Relationships
    party: Mapped[PoliticalParty] = relationship(back_populates="memberships")
