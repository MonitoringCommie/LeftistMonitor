"""Policies and legislation models."""
import uuid
from datetime import date
from typing import Optional, List

from sqlalchemy import (
    Date, DateTime, Float, ForeignKey, Integer, String, Text,
    Table, Column
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from ..database import Base


policy_topic_association = Table(
    "policy_topic_association",
    Base.metadata,
    Column("policy_id", UUID(as_uuid=True), ForeignKey("policies.id", ondelete="CASCADE")),
    Column("topic_id", UUID(as_uuid=True), ForeignKey("policy_topics.id", ondelete="CASCADE")),
)


class PolicyTopic(Base):
    __tablename__ = "policy_topics"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    color: Mapped[Optional[str]] = mapped_column(String(7))
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("policy_topics.id"))
    parent: Mapped[Optional["PolicyTopic"]] = relationship("PolicyTopic", remote_side=[id], back_populates="subtopics")
    subtopics: Mapped[List["PolicyTopic"]] = relationship("PolicyTopic", back_populates="parent")
    policies: Mapped[List["Policy"]] = relationship(secondary=policy_topic_association, back_populates="topics")


class Policy(Base):
    __tablename__ = "policies"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    title_original: Mapped[Optional[str]] = mapped_column(String(500))
    summary: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(Text)
    country_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("countries.id"))
    policy_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="enacted")
    date_proposed: Mapped[Optional[date]] = mapped_column(Date)
    date_passed: Mapped[Optional[date]] = mapped_column(Date)
    date_enacted: Mapped[Optional[date]] = mapped_column(Date)
    date_repealed: Mapped[Optional[date]] = mapped_column(Date)
    progressive_score: Mapped[Optional[float]] = mapped_column(Float)
    progressive_analysis: Mapped[Optional[str]] = mapped_column(Text)
    wikidata_id: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    official_url: Mapped[Optional[str]] = mapped_column(String(500))
    created_at: Mapped[date] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[date] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    topics: Mapped[List[PolicyTopic]] = relationship(secondary=policy_topic_association, back_populates="policies")
    votes: Mapped[List["PolicyVote"]] = relationship(back_populates="policy")


class PolicyVote(Base):
    __tablename__ = "policy_votes"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("policies.id", ondelete="CASCADE"))
    party_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("political_parties.id", ondelete="CASCADE"))
    vote: Mapped[str] = mapped_column(String(20), nullable=False)
    votes_for: Mapped[Optional[int]] = mapped_column(Integer)
    votes_against: Mapped[Optional[int]] = mapped_column(Integer)
    votes_abstain: Mapped[Optional[int]] = mapped_column(Integer)
    policy: Mapped[Policy] = relationship(back_populates="votes")
