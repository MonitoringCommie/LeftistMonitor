"""Policies API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import NotFoundError
from ..core.pagination import PaginatedResponse
from ..database import get_db
from .schemas import PolicyListItem, PolicyResponse, PolicyTopicResponse
from .service import PoliciesService

router = APIRouter()


@router.get("/topics", response_model=list[PolicyTopicResponse])
async def list_topics(db: AsyncSession = Depends(get_db)):
    service = PoliciesService(db)
    topics = await service.get_topics()
    return [PolicyTopicResponse.model_validate(t) for t in topics]


@router.get("/countries/{country_id}/policies", response_model=PaginatedResponse[PolicyListItem])
async def list_policies_by_country(
    country_id: UUID,
    topic_id: Optional[UUID] = Query(None),
    policy_type: Optional[str] = Query(None),
    year: Optional[int] = Query(None, ge=1800, le=2100),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    service = PoliciesService(db)
    policies, total = await service.get_policies_by_country(
        country_id=country_id,
        topic_id=topic_id,
        policy_type=policy_type,
        year=year,
        page=page,
        per_page=per_page,
    )
    return PaginatedResponse.create(
        items=[PolicyListItem.model_validate(p) for p in policies],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/policies/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    service = PoliciesService(db)
    policy = await service.get_policy(policy_id)
    if not policy:
        raise NotFoundError(f"Policy {policy_id} not found")
    return PolicyResponse.model_validate(policy)
