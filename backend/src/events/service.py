"""Events business logic."""
from datetime import date
from typing import Optional, List
from uuid import UUID

from sqlalchemy import and_, or_, select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Event, Conflict, ConflictParticipant
from ..geography.models import Country
from ..politics.models import Election
from .schemas import (
    EventListItem, EventResponse, ConflictListItem, ConflictResponse,
    ConflictParticipantResponse, TimelineEvent
)


class EventsService:
    """Service for events operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_events_by_country(
        self,
        country_id: UUID,
        year: Optional[int] = None,
        category: Optional[str] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Event], int]:
        """Get events for a country."""
        query = select(Event).where(Event.primary_country_id == country_id)

        # Filter by year
        if year:
            start_of_year = date(year, 1, 1)
            end_of_year = date(year, 12, 31)
            query = query.where(
                or_(
                    and_(
                        Event.start_date >= start_of_year,
                        Event.start_date <= end_of_year,
                    ),
                    and_(
                        Event.end_date >= start_of_year,
                        Event.end_date <= end_of_year,
                    ),
                )
            )

        # Filter by category
        if category:
            query = query.where(Event.category == category)

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(desc(Event.start_date))
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        events = result.scalars().all()

        return list(events), total

    async def get_event(self, event_id: UUID) -> Optional[Event]:
        """Get a single event."""
        result = await self.db.execute(
            select(Event).where(Event.id == event_id)
        )
        return result.scalar_one_or_none()

    async def get_conflicts_by_country(
        self,
        country_id: UUID,
        year: Optional[int] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Conflict], int]:
        """Get conflicts involving a country."""
        # Find conflicts where this country is a participant
        query = (
            select(Conflict)
            .join(ConflictParticipant, Conflict.id == ConflictParticipant.conflict_id)
            .where(ConflictParticipant.country_id == country_id)
            .distinct()
        )

        # Filter by year
        if year:
            target_date = date(year, 7, 1)
            query = query.where(
                and_(
                    or_(
                        Conflict.start_date.is_(None),
                        Conflict.start_date <= target_date,
                    ),
                    or_(
                        Conflict.end_date.is_(None),
                        Conflict.end_date >= target_date,
                    ),
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        # Apply pagination and ordering
        query = query.order_by(desc(Conflict.start_date))
        query = query.offset((page - 1) * per_page).limit(per_page)

        result = await self.db.execute(query)
        conflicts = result.scalars().all()

        return list(conflicts), total

    async def get_conflict(self, conflict_id: UUID) -> Optional[dict]:
        """Get a conflict with participants."""
        result = await self.db.execute(
            select(Conflict).where(Conflict.id == conflict_id)
        )
        conflict = result.scalar_one_or_none()
        if not conflict:
            return None

        # Get participants
        participants_query = (
            select(
                ConflictParticipant.id,
                ConflictParticipant.country_id,
                Country.name_en.label("country_name"),
                ConflictParticipant.actor_name,
                ConflictParticipant.side,
                ConflictParticipant.role,
                ConflictParticipant.casualties,
            )
            .outerjoin(Country, ConflictParticipant.country_id == Country.id)
            .where(ConflictParticipant.conflict_id == conflict_id)
            .order_by(ConflictParticipant.side, ConflictParticipant.role)
        )
        result = await self.db.execute(participants_query)
        participants = [
            ConflictParticipantResponse(
                id=row.id,
                country_id=row.country_id,
                country_name=row.country_name,
                actor_name=row.actor_name,
                side=row.side,
                role=row.role,
                casualties=row.casualties,
            )
            for row in result.all()
        ]

        return {
            "id": conflict.id,
            "name": conflict.name,
            "start_date": conflict.start_date,
            "end_date": conflict.end_date,
            "conflict_type": conflict.conflict_type,
            "intensity": conflict.intensity,
            "casualties_low": conflict.casualties_low,
            "casualties_high": conflict.casualties_high,
            "ucdp_id": conflict.ucdp_id,
            "cow_id": conflict.cow_id,
            "wikidata_id": conflict.wikidata_id,
            "description": conflict.description,
            "progressive_analysis": conflict.progressive_analysis,
            "outcome": conflict.outcome,
            "participants": participants,
        }

    async def get_country_timeline(
        self,
        country_id: UUID,
        start_year: int,
        end_year: int,
    ) -> List[TimelineEvent]:
        """Get a combined timeline of events, elections, and conflicts for a country."""
        start_date = date(start_year, 1, 1)
        end_date = date(end_year, 12, 31)
        timeline = []

        # Get events
        events_query = (
            select(Event)
            .where(
                Event.primary_country_id == country_id,
                Event.start_date >= start_date,
                Event.start_date <= end_date,
            )
        )
        result = await self.db.execute(events_query)
        for event in result.scalars().all():
            timeline.append(TimelineEvent(
                id=event.id,
                title=event.title,
                date=event.start_date,
                end_date=event.end_date,
                type="event",
                category=event.category,
                importance=event.importance,
            ))

        # Get elections
        elections_query = (
            select(Election)
            .where(
                Election.country_id == country_id,
                Election.date >= start_date,
                Election.date <= end_date,
            )
        )
        result = await self.db.execute(elections_query)
        for election in result.scalars().all():
            timeline.append(TimelineEvent(
                id=election.id,
                title=f"{election.election_type.title()} Election",
                date=election.date,
                end_date=None,
                type="election",
                category="political",
                importance=7,
            ))

        # Get conflicts
        conflicts_query = (
            select(Conflict)
            .join(ConflictParticipant, Conflict.id == ConflictParticipant.conflict_id)
            .where(
                ConflictParticipant.country_id == country_id,
                or_(
                    and_(
                        Conflict.start_date >= start_date,
                        Conflict.start_date <= end_date,
                    ),
                    and_(
                        Conflict.end_date >= start_date,
                        Conflict.end_date <= end_date,
                    ),
                )
            )
            .distinct()
        )
        result = await self.db.execute(conflicts_query)
        for conflict in result.scalars().all():
            if conflict.start_date and start_date <= conflict.start_date <= end_date:
                timeline.append(TimelineEvent(
                    id=conflict.id,
                    title=f"{conflict.name} (Start)",
                    date=conflict.start_date,
                    end_date=conflict.end_date,
                    type="conflict_start",
                    category="military",
                    importance=8,
                ))
            if conflict.end_date and start_date <= conflict.end_date <= end_date:
                timeline.append(TimelineEvent(
                    id=conflict.id,
                    title=f"{conflict.name} (End)",
                    date=conflict.end_date,
                    end_date=None,
                    type="conflict_end",
                    category="military",
                    importance=8,
                ))

        # Sort by date
        timeline.sort(key=lambda x: x.date, reverse=True)
        return timeline

    async def get_global_events_by_year(
        self,
        year: int,
        limit: int = 10,
    ) -> List[Event]:
        """Get the most important global events for a specific year."""
        start_of_year = date(year, 1, 1)
        end_of_year = date(year, 12, 31)
        
        query = (
            select(Event)
            .where(
                or_(
                    and_(
                        Event.start_date >= start_of_year,
                        Event.start_date <= end_of_year,
                    ),
                    and_(
                        Event.end_date.isnot(None),
                        Event.end_date >= start_of_year,
                        Event.end_date <= end_of_year,
                    ),
                )
            )
            .order_by(desc(Event.importance), Event.start_date)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return list(result.scalars().all())
