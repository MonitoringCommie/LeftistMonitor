"""Policies API schemas."""
from datetime import date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class PolicyTopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class PolicyTopicResponse(PolicyTopicBase):
    id: UUID
    parent_id: Optional[UUID] = None
    model_config = ConfigDict(from_attributes=True)


class PolicyListItem(BaseModel):
    id: UUID
    title: str
    title_original: Optional[str] = None
    summary: Optional[str] = None
    country_id: UUID
    policy_type: str
    status: str
    date_enacted: Optional[date] = None
    progressive_score: Optional[float] = None
    topics: List[PolicyTopicResponse] = []
    model_config = ConfigDict(from_attributes=True)


class PolicyVoteResponse(BaseModel):
    id: UUID
    party_id: UUID
    vote: str
    votes_for: Optional[int] = None
    votes_against: Optional[int] = None
    votes_abstain: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class PolicyResponse(PolicyListItem):
    description: Optional[str] = None
    date_proposed: Optional[date] = None
    date_passed: Optional[date] = None
    date_repealed: Optional[date] = None
    progressive_analysis: Optional[str] = None
    wikidata_id: Optional[str] = None
    official_url: Optional[str] = None
    votes: List[PolicyVoteResponse] = []
    model_config = ConfigDict(from_attributes=True)


class PolicyCreate(BaseModel):
    title: str
    title_original: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    country_id: UUID
    policy_type: str
    status: str = "enacted"
    date_proposed: Optional[date] = None
    date_passed: Optional[date] = None
    date_enacted: Optional[date] = None
    date_repealed: Optional[date] = None
    progressive_score: Optional[float] = None
    progressive_analysis: Optional[str] = None
    topic_ids: List[UUID] = []
