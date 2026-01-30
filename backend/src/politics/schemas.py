"""Politics API schemas."""
from datetime import date
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class IdeologyBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None
    left_right_position: Optional[float] = None
    libertarian_authoritarian_position: Optional[float] = None


class IdeologyResponse(IdeologyBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class PartyListItem(BaseModel):
    id: UUID
    name: str
    name_english: Optional[str] = None
    name_short: Optional[str] = None
    country_id: UUID
    founded: Optional[date] = None
    dissolved: Optional[date] = None
    left_right_score: Optional[float] = None
    party_family: Optional[str] = None
    logo_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


class PartyResponse(PartyListItem):
    parlgov_id: Optional[int] = None
    partyfacts_id: Optional[int] = None
    manifesto_id: Optional[str] = None
    wikidata_id: Optional[str] = None
    description: Optional[str] = None
    progressive_analysis: Optional[str] = None
    ideologies: List[IdeologyResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ElectionListItem(BaseModel):
    id: UUID
    country_id: UUID
    date: date
    election_type: str
    turnout_percent: Optional[float] = None
    total_votes: Optional[int] = None
    total_seats: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class ElectionResultResponse(BaseModel):
    id: UUID
    party_id: UUID
    party_name: str
    party_short: Optional[str] = None
    party_color: Optional[str] = None
    party_family: Optional[str] = None
    left_right: Optional[float] = None
    votes: Optional[int] = None
    vote_share: Optional[float] = None
    seats: Optional[int] = None
    seat_share: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)


class ElectionResponse(ElectionListItem):
    notes: Optional[str] = None
    results: List[ElectionResultResponse] = []
    model_config = ConfigDict(from_attributes=True)


class PartyElectionHistory(BaseModel):
    election_id: UUID
    election_date: date
    election_type: str
    vote_share: Optional[float] = None
    seats: Optional[int] = None
    seat_share: Optional[float] = None


class PartyDetailResponse(PartyResponse):
    election_history: List[PartyElectionHistory] = []
