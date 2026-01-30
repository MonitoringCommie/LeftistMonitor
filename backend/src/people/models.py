"""People and relationships models."""
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


# Association table for person-country relationships
person_country_association = Table(
    'person_country_association',
    Base.metadata,
    Column('person_id', UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE')),
    Column('country_id', UUID(as_uuid=True), ForeignKey('countries.id', ondelete='CASCADE')),
    Column('relationship_type', String(50)),  # e.g., "born", "citizen", "active_in", "died"
)


class Person(Base):
    """Historical or notable person."""
    __tablename__ = "people"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # External IDs
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True, unique=True)
    
    # Basic info
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_native: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Dates
    birth_date: Mapped[Optional[date]] = mapped_column(Date)
    birth_date_precision: Mapped[Optional[str]] = mapped_column(String(10))  # "day", "month", "year"
    death_date: Mapped[Optional[date]] = mapped_column(Date)
    death_date_precision: Mapped[Optional[str]] = mapped_column(String(10))
    
    # Classification
    person_types: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(50)))  # politician, activist, writer, etc.
    ideology_tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(50)))  # communist, socialist, anarchist, etc.
    
    # Biography
    bio_short: Mapped[Optional[str]] = mapped_column(String(500))
    bio_full: Mapped[Optional[str]] = mapped_column(Text)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)  # Leftist perspective
    
    # Image
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Birth/death places
    birth_place: Mapped[Optional[str]] = mapped_column(String(255))
    death_place: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Primary country (for listing purposes)
    primary_country_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    # Relationships
    connections_from: Mapped[List["PersonConnection"]] = relationship(
        foreign_keys="PersonConnection.person_from_id",
        back_populates="person_from"
    )
    connections_to: Mapped[List["PersonConnection"]] = relationship(
        foreign_keys="PersonConnection.person_to_id",
        back_populates="person_to"
    )
    books_authored: Mapped[List["BookAuthor"]] = relationship(back_populates="person")
    positions: Mapped[List["PersonPosition"]] = relationship(back_populates="person")


class PersonConnection(Base):
    """Connection/relationship between two people."""
    __tablename__ = "person_connections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    person_from_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE'))
    person_to_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE'))
    
    # Type of connection
    connection_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: "influenced_by", "collaborated_with", "opposed", "mentor_of", "student_of",
    #        "married_to", "parent_of", "sibling_of", "colleague_of"
    
    # Optional dates for the connection
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Description of the relationship
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Strength of connection (for visualization)
    strength: Mapped[Optional[float]] = mapped_column(Float, default=1.0)  # 0.0 to 1.0
    
    # Relationships
    person_from: Mapped[Person] = relationship(foreign_keys=[person_from_id], back_populates="connections_from")
    person_to: Mapped[Person] = relationship(foreign_keys=[person_to_id], back_populates="connections_to")


class PersonPosition(Base):
    """Political or other position held by a person."""
    __tablename__ = "person_positions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE'))
    country_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    # Position details
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    position_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: "head_of_state", "head_of_government", "minister", "legislator", "party_leader", "diplomat"
    
    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    
    # Relationships
    person: Mapped[Person] = relationship(back_populates="positions")


class Book(Base):
    """Important books, publications, and texts."""
    __tablename__ = "books"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # External IDs
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    isbn: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Basic info
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_original: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Publication
    publication_year: Mapped[Optional[int]] = mapped_column(Integer)
    publisher: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Classification
    book_type: Mapped[Optional[str]] = mapped_column(String(50))
    # Types: "political_theory", "manifesto", "history", "economics", "philosophy", "memoir"
    topics: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    
    # Content
    description: Mapped[Optional[str]] = mapped_column(Text)
    significance: Mapped[Optional[str]] = mapped_column(Text)  # Why it matters
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)
    
    # Links
    marxists_archive_url: Mapped[Optional[str]] = mapped_column(String(500))
    gutenberg_url: Mapped[Optional[str]] = mapped_column(String(500))
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Cover image
    cover_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Country association (if applicable)
    country_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey('countries.id'))
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    authors: Mapped[List["BookAuthor"]] = relationship(back_populates="book")


class BookAuthor(Base):
    """Author relationship for books (many-to-many with roles)."""
    __tablename__ = "book_authors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    book_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('books.id', ondelete='CASCADE'))
    person_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('people.id', ondelete='CASCADE'))
    
    # Role
    role: Mapped[str] = mapped_column(String(50), default="author")  # author, editor, translator, contributor
    
    # Relationships
    book: Mapped[Book] = relationship(back_populates="authors")
    person: Mapped[Person] = relationship(back_populates="books_authored")
