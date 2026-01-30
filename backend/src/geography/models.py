"""Geography database models."""
import uuid
from datetime import date, datetime
from typing import Optional

from geoalchemy2 import Geometry
from sqlalchemy import Date, DateTime, Float, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Country(Base):
    """Country/political entity model."""
    
    __tablename__ = "countries"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    # External identifiers for linking to datasets
    gwcode: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    cowcode: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    iso_alpha2: Mapped[Optional[str]] = mapped_column(String(2))
    iso_alpha3: Mapped[Optional[str]] = mapped_column(String(3))
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Names
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_native: Mapped[Optional[str]] = mapped_column(String(255))
    name_short: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Temporal validity
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[Optional[date]] = mapped_column(Date)
    
    # Type of entity
    entity_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="sovereign_state"
    )
    
    # Content
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    
    # Relationships
    borders: Mapped[list["CountryBorder"]] = relationship(
        "CountryBorder", back_populates="country", cascade="all, delete-orphan"
    )
    capitals: Mapped[list["CountryCapital"]] = relationship(
        "CountryCapital", back_populates="country", cascade="all, delete-orphan"
    )


class CountryBorder(Base):
    """Country border geometry with temporal validity."""
    
    __tablename__ = "country_borders"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    country_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("countries.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    # PostGIS geometry (MultiPolygon, WGS84)
    geometry = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326),
        nullable=False,
    )
    
    # Temporal validity
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[Optional[date]] = mapped_column(Date)
    
    # Source tracking
    source: Mapped[str] = mapped_column(String(100), nullable=False, default="manual")
    source_id: Mapped[Optional[str]] = mapped_column(String(100))
    
    # Metadata
    area_km2: Mapped[Optional[float]] = mapped_column(Float)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    # Relationships
    country: Mapped["Country"] = relationship("Country", back_populates="borders")


class CountryCapital(Base):
    """Country capital with temporal validity."""
    
    __tablename__ = "country_capitals"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    country_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("countries.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location = mapped_column(
        Geometry(geometry_type="POINT", srid=4326)
    )
    
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[Optional[date]] = mapped_column(Date)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    # Relationships
    country: Mapped["Country"] = relationship("Country", back_populates="capitals")


class CountryRelationship(Base):
    """Relationship between two countries (alliances, conflicts, treaties)."""

    __tablename__ = "country_relationships"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    # The two countries involved
    country_a_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("countries.id", ondelete="CASCADE"),
        nullable=False,
    )
    country_b_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("countries.id", ondelete="CASCADE"),
        nullable=False,
    )
    
    # Relationship type: alliance, conflict, treaty, trade, colonial, etc.
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Relationship strength/nature: ally, enemy, neutral, puppet, protectorate, etc.
    relationship_nature: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Name of the relationship (e.g., "NATO", "Warsaw Pact", "Triple Entente")
    name: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Temporal validity
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[Optional[date]] = mapped_column(Date)
    
    # Source
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20))
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    
    # Relationships
    country_a: Mapped["Country"] = relationship(
        "Country", foreign_keys=[country_a_id]
    )
    country_b: Mapped["Country"] = relationship(
        "Country", foreign_keys=[country_b_id]
    )
