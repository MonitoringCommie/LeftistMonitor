"""Research pathways - guided tours through historical topics."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import Date, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from ..database import Base


class ResearchPathway(Base):
    """A curated research pathway/guided tour."""
    __tablename__ = "research_pathways"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Classification
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    # Categories: revolution, labor, women, anti_colonial, ideology, regional, thematic
    
    difficulty_level: Mapped[Optional[str]] = mapped_column(String(20))
    # Levels: beginner, intermediate, advanced
    
    estimated_time_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Content
    introduction: Mapped[Optional[str]] = mapped_column(Text)
    conclusion: Mapped[Optional[str]] = mapped_column(Text)
    
    # Tags for discovery
    tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(50)))
    
    # Geographic/temporal scope
    regions: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    start_year: Mapped[Optional[int]] = mapped_column(Integer)
    end_year: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Featured image
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    
    # Status
    is_published: Mapped[bool] = mapped_column(default=False)
    featured: Mapped[bool] = mapped_column(default=False)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    nodes: Mapped[List["PathwayNode"]] = relationship(back_populates="pathway", order_by="PathwayNode.order")


class PathwayNode(Base):
    """A single node/step in a research pathway."""
    __tablename__ = "pathway_nodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    pathway_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('research_pathways.id', ondelete='CASCADE')
    )
    
    # Order in pathway
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Node content
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Linked entity (optional - can be standalone text node)
    entity_type: Mapped[Optional[str]] = mapped_column(String(50))
    # Types: person, event, conflict, country, book, policy, party
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    
    # Discussion questions / analysis prompts
    discussion_questions: Mapped[Optional[List[str]]] = mapped_column(ARRAY(Text))
    
    # Additional resources
    further_reading: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(500)))
    
    # Relationships
    pathway: Mapped[ResearchPathway] = relationship(back_populates="nodes")


class FeaturedCollection(Base):
    """A featured collection of entities (e.g., Women Revolutionaries)."""
    __tablename__ = "featured_collections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic info
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    # Classification
    collection_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: people, events, movements, books, mixed
    
    # Focus area
    focus_tags: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(50)))
    # e.g., ["women", "revolutionary"], ["anti_colonial", "africa"]
    
    # Display
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    featured: Mapped[bool] = mapped_column(default=False)
    is_published: Mapped[bool] = mapped_column(default=False)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    # Relationships
    items: Mapped[List["CollectionItem"]] = relationship(back_populates="collection")


class CollectionItem(Base):
    """An item in a featured collection."""
    __tablename__ = "collection_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    collection_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('featured_collections.id', ondelete='CASCADE')
    )
    
    # Linked entity
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Optional override/annotation
    custom_title: Mapped[Optional[str]] = mapped_column(String(255))
    custom_description: Mapped[Optional[str]] = mapped_column(Text)
    highlight_reason: Mapped[Optional[str]] = mapped_column(Text)
    
    # Order
    order: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    collection: Mapped[FeaturedCollection] = relationship(back_populates="items")
