"""Politics business logic."""
from datetime import date
from typing import Optional, List
from uuid import UUID

from sqlalchemy import and_, or_, select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import PoliticalParty, Election, ElectionResult, Ideology
from .schemas import (
    PartyListItem, PartyResponse, PartyDetailResponse,
    ElectionListItem, ElectionResponse, ElectionResultResponse,
    PartyElectionHistory
)


class PoliticsService:
    """Service for political data operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_parties_by_country(
        self,
        country_id: UUID,
        year: Optional[int] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[PoliticalParty], int]:
        """Get political parties for a country."""
        query = select(PoliticalParty).where(PoliticalParty.country_id == country_id)

        # Filter by year (party must be active)
        if year:
            target_date = date(year, 7, 1)
            query = query.where(
                and_(
                    or_(
                        PoliticalParty.founded.is_(None),
                        PoliticalParty.founded <= target_date,
                    ),
                    or_(
                        PoliticalParty.dissolved.is_(None),
                        PoliticalParty.dissolved >= target_date,
                    ),
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(PoliticalParty.left_right_score.nulls_last())
        query = query.offset((page - 1) * per_page).limit(per_page)
        query = query.options(selectinload(PoliticalParty.ideologies))

        result = await self.db.execute(query)
        parties = result.scalars().all()

        return list(parties), total

    async def get_party(self, party_id: UUID) -> Optional[PoliticalParty]:
        """Get a single party with details."""
        result = await self.db.execute(
            select(PoliticalParty)
            .where(PoliticalParty.id == party_id)
            .options(selectinload(PoliticalParty.ideologies))
        )
        return result.scalar_one_or_none()

    async def get_party_election_history(self, party_id: UUID) -> List[PartyElectionHistory]:
        """Get election history for a party."""
        query = (
            select(
                ElectionResult.election_id,
                Election.date.label("election_date"),
                Election.election_type,
                ElectionResult.vote_share,
                ElectionResult.seats,
                ElectionResult.seat_share,
            )
            .join(Election, ElectionResult.election_id == Election.id)
            .where(ElectionResult.party_id == party_id)
            .order_by(desc(Election.date))
        )

        result = await self.db.execute(query)
        rows = result.all()

        return [
            PartyElectionHistory(
                election_id=row.election_id,
                election_date=row.election_date,
                election_type=row.election_type,
                vote_share=row.vote_share,
                seats=row.seats,
                seat_share=row.seat_share,
            )
            for row in rows
        ]

    async def get_elections_by_country(
        self,
        country_id: UUID,
        election_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Election], int]:
        """Get elections for a country."""
        query = select(Election).where(Election.country_id == country_id)

        if election_type:
            query = query.where(Election.election_type == election_type)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(desc(Election.date))
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        elections = result.scalars().all()

        return list(elections), total

    async def get_election(self, election_id: UUID) -> Optional[dict]:
        """Get an election with full results."""
        # Get election
        result = await self.db.execute(
            select(Election).where(Election.id == election_id)
        )
        election = result.scalar_one_or_none()
        if not election:
            return None

        # Get results with party info
        results_query = (
            select(
                ElectionResult.id,
                ElectionResult.party_id,
                PoliticalParty.name.label("party_name"),
                PoliticalParty.name_short.label("party_short"),
                PoliticalParty.party_family.label("party_family"),
                PoliticalParty.left_right_score.label("left_right"),
                ElectionResult.votes,
                ElectionResult.vote_share,
                ElectionResult.seats,
                ElectionResult.seat_share,
            )
            .join(PoliticalParty, ElectionResult.party_id == PoliticalParty.id)
            .where(ElectionResult.election_id == election_id)
            .order_by(desc(ElectionResult.vote_share))
        )

        result = await self.db.execute(results_query)
        results = result.all()

        return {
            "id": election.id,
            "country_id": election.country_id,
            "date": election.date,
            "election_type": election.election_type,
            "turnout_percent": election.turnout_percent,
            "total_votes": election.total_votes,
            "total_seats": election.total_seats,
            "notes": election.notes,
            "results": [
                {
                    "id": r.id,
                    "party_id": r.party_id,
                    "party_name": r.party_name,
                    "party_short": r.party_short,
                    "party_family": r.party_family,
                    "left_right": r.left_right,
                    "votes": r.votes,
                    "vote_share": r.vote_share,
                    "seats": r.seats,
                    "seat_share": r.seat_share,
                }
                for r in results
            ],
        }

    async def get_ideologies(self) -> List[Ideology]:
        """Get all ideologies."""
        result = await self.db.execute(
            select(Ideology).order_by(Ideology.left_right_position.nulls_last())
        )
        return list(result.scalars().all())

    async def get_voting_trends(
        self,
        country_id: UUID,
        election_type: str = "parliament",
        limit: int = 20,
    ) -> List[dict]:
        """Get historical voting trends for major parties."""
        # Get elections
        elections_query = (
            select(Election)
            .where(
                and_(
                    Election.country_id == country_id,
                    Election.election_type == election_type,
                )
            )
            .order_by(desc(Election.date))
            .limit(limit)
        )
        result = await self.db.execute(elections_query)
        elections = result.scalars().all()

        if not elections:
            return []

        # Get results for all these elections
        election_ids = [e.id for e in elections]
        results_query = (
            select(
                ElectionResult.election_id,
                Election.date.label("election_date"),
                PoliticalParty.id.label("party_id"),
                PoliticalParty.name.label("party_name"),
                PoliticalParty.name_short.label("party_short"),
                PoliticalParty.party_family,
                PoliticalParty.left_right_score,
                ElectionResult.vote_share,
                ElectionResult.seats,
            )
            .join(Election, ElectionResult.election_id == Election.id)
            .join(PoliticalParty, ElectionResult.party_id == PoliticalParty.id)
            .where(ElectionResult.election_id.in_(election_ids))
            .where(ElectionResult.vote_share >= 3)  # Only parties with >3% vote
            .order_by(Election.date, desc(ElectionResult.vote_share))
        )

        result = await self.db.execute(results_query)
        rows = result.all()

        # Group by election date
        trends = {}
        for row in rows:
            date_str = row.election_date.isoformat()
            if date_str not in trends:
                trends[date_str] = {
                    "date": date_str,
                    "year": row.election_date.year,
                    "parties": []
                }
            trends[date_str]["parties"].append({
                "party_id": str(row.party_id),
                "party_name": row.party_name,
                "party_short": row.party_short,
                "party_family": row.party_family,
                "left_right": row.left_right_score,
                "vote_share": row.vote_share,
                "seats": row.seats,
            })

        # Sort by date and return
        return sorted(trends.values(), key=lambda x: x["date"])
