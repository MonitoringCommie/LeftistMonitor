"""Policies business logic."""
from datetime import date
from typing import Optional, List
from uuid import UUID

from sqlalchemy import and_, or_, select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .models import Policy, PolicyTopic, PolicyVote
from .schemas import PolicyListItem, PolicyTopicResponse


class PoliciesService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_topics(self) -> List[PolicyTopic]:
        result = await self.db.execute(
            select(PolicyTopic).order_by(PolicyTopic.name)
        )
        return list(result.scalars().all())

    async def get_policies_by_country(
        self,
        country_id: UUID,
        topic_id: Optional[UUID] = None,
        policy_type: Optional[str] = None,
        year: Optional[int] = None,
        page: int = 1,
        per_page: int = 50,
    ) -> tuple[List[Policy], int]:
        query = select(Policy).where(Policy.country_id == country_id)

        if topic_id:
            query = query.join(Policy.topics).where(PolicyTopic.id == topic_id)

        if policy_type:
            query = query.where(Policy.policy_type == policy_type)

        if year:
            start_date = date(year, 1, 1)
            end_date = date(year, 12, 31)
            query = query.where(
                or_(
                    and_(Policy.date_enacted >= start_date, Policy.date_enacted <= end_date),
                    and_(Policy.date_passed >= start_date, Policy.date_passed <= end_date),
                )
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = await self.db.scalar(count_query) or 0

        query = query.order_by(desc(Policy.date_enacted), desc(Policy.date_passed))
        query = query.offset((page - 1) * per_page).limit(per_page)
        query = query.options(selectinload(Policy.topics))

        result = await self.db.execute(query)
        policies = result.scalars().unique().all()

        return list(policies), total

    async def get_policy(self, policy_id: UUID) -> Optional[Policy]:
        result = await self.db.execute(
            select(Policy)
            .where(Policy.id == policy_id)
            .options(selectinload(Policy.topics), selectinload(Policy.votes))
        )
        return result.scalar_one_or_none()
