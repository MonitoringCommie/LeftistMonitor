"""Policy impact tracking models and API."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import (
    Date, DateTime, Float, ForeignKey, Integer, String, Text, Enum
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from ..database import Base


class PolicyImpact(Base):
    """Tracked impact/outcome of a policy."""
    __tablename__ = "policy_impacts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    policy_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey('policies.id', ondelete='CASCADE'))
    
    # Impact classification
    impact_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: economic, social, political, environmental, health, education, labor
    
    impact_direction: Mapped[str] = mapped_column(String(20), nullable=False)
    # Directions: positive, negative, mixed, neutral
    
    # Measurement
    metric_name: Mapped[Optional[str]] = mapped_column(String(255))
    metric_value: Mapped[Optional[float]] = mapped_column(Float)
    metric_unit: Mapped[Optional[str]] = mapped_column(String(50))
    baseline_value: Mapped[Optional[float]] = mapped_column(Float)
    
    # Timing
    measurement_date: Mapped[Optional[date]] = mapped_column(Date)
    years_after_implementation: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Affected groups
    affected_groups: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String(100)))
    # Groups: workers, farmers, women, minorities, elderly, children, middle_class, etc.
    
    # Geographic scope
    geographic_scope: Mapped[Optional[str]] = mapped_column(String(50))
    # Scopes: national, regional, local, specific_area
    
    # Description
    description: Mapped[Optional[str]] = mapped_column(Text)
    evidence_summary: Mapped[Optional[str]] = mapped_column(Text)
    source_citation: Mapped[Optional[str]] = mapped_column(Text)
    
    # Confidence
    confidence_level: Mapped[Optional[str]] = mapped_column(String(20))
    # Levels: high, medium, low, disputed
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class PolicyRelationship(Base):
    """Relationship between policies (influenced, replaced, amended, etc.)."""
    __tablename__ = "policy_relationships"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    source_policy_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('policies.id', ondelete='CASCADE')
    )
    target_policy_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey('policies.id', ondelete='CASCADE')
    )
    
    relationship_type: Mapped[str] = mapped_column(String(50), nullable=False)
    # Types: influenced, replaced, amended, extended, reversed, complemented, conflicted
    
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[date] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
