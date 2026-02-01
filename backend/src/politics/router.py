"""Politics API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.exceptions import NotFoundError
from ..core.pagination import PaginatedResponse
from ..database import get_db
from .schemas import (
    PartyListItem, PartyResponse, PartyDetailResponse,
    ElectionListItem, ElectionResponse, IdeologyResponse
)
from .service import PoliticsService

router = APIRouter()


@router.get("/countries/{country_id}/parties", response_model=PaginatedResponse[PartyListItem])
async def list_parties_by_country(
    country_id: UUID,
    year: Optional[int] = Query(None, ge=1800, le=2100),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get political parties for a country."""
    service = PoliticsService(db)
    parties, total = await service.get_parties_by_country(
        country_id=country_id,
        year=year,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[PartyListItem.model_validate(p) for p in parties],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/parties/{party_id}", response_model=PartyDetailResponse)
async def get_party(
    party_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a political party with election history."""
    service = PoliticsService(db)
    party = await service.get_party(party_id)

    if not party:
        raise NotFoundError(f"Party {party_id} not found")

    election_history = await service.get_party_election_history(party_id)

    response = PartyDetailResponse.model_validate(party)
    response.election_history = election_history
    return response


@router.get("/countries/{country_id}/elections", response_model=PaginatedResponse[ElectionListItem])
async def list_elections_by_country(
    country_id: UUID,
    election_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get elections for a country."""
    service = PoliticsService(db)
    elections, total = await service.get_elections_by_country(
        country_id=country_id,
        election_type=election_type,
        page=page,
        per_page=per_page,
    )

    return PaginatedResponse.create(
        items=[ElectionListItem.model_validate(e) for e in elections],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/elections/{election_id}", response_model=ElectionResponse)
async def get_election(
    election_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get an election with results."""
    service = PoliticsService(db)
    election = await service.get_election(election_id)

    if not election:
        raise NotFoundError(f"Election {election_id} not found")

    return election


@router.get("/ideologies", response_model=list[IdeologyResponse])
async def list_ideologies(
    db: AsyncSession = Depends(get_db),
):
    """Get all political ideologies."""
    service = PoliticsService(db)
    ideologies = await service.get_ideologies()
    return [IdeologyResponse.model_validate(i) for i in ideologies]


@router.get("/countries/{country_id}/voting-trends")
async def get_voting_trends(
    country_id: UUID,
    election_type: str = Query("parliament"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get historical voting trends for a country."""
    service = PoliticsService(db)
    trends = await service.get_voting_trends(
        country_id=country_id,
        election_type=election_type,
        limit=limit,
    )
    return trends


@router.get("/elections", response_model=PaginatedResponse[ElectionListItem])
async def list_all_elections(
    search: Optional[str] = Query(None),
    election_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get all elections with optional filtering."""
    from sqlalchemy import or_
    from .models import Election
    
    query = select(Election)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Election.name.ilike(search_term),
                Election.election_type.ilike(search_term)
            )
        )
    
    if election_type:
        query = query.where(Election.election_type == election_type)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Get page
    offset = (page - 1) * per_page
    query = query.order_by(Election.date.desc().nullslast()).offset(offset).limit(per_page)
    result = await db.execute(query)
    elections = result.scalars().all()
    
    return PaginatedResponse.create(
        items=[ElectionListItem.model_validate(e) for e in elections],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/parties", response_model=PaginatedResponse[PartyListItem])
async def list_all_parties(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get all political parties with optional filtering."""
    from sqlalchemy import or_
    from .models import PoliticalParty
    
    query = select(PoliticalParty)
    
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                PoliticalParty.name.ilike(search_term),
                PoliticalParty.abbreviation.ilike(search_term)
            )
        )
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Get page
    offset = (page - 1) * per_page
    query = query.order_by(PoliticalParty.name).offset(offset).limit(per_page)
    result = await db.execute(query)
    parties = result.scalars().all()
    
    return PaginatedResponse.create(
        items=[PartyListItem.model_validate(p) for p in parties],
        total=total,
        page=page,
        per_page=per_page,
    )
