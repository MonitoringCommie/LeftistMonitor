"""Labor movement API routes."""
from typing import Optional, List
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from ..database import get_db
from .models import LaborOrganization, Strike


router = APIRouter()


class LaborOrgResponse(BaseModel):
    id: str
    name: str
    abbreviation: Optional[str]
    organization_type: str
    industry_sectors: Optional[List[str]]
    founded: Optional[str]
    dissolved: Optional[str]
    country_id: str
    peak_membership: Optional[int]
    ideology_tags: Optional[List[str]]
    description: Optional[str]

    class Config:
        from_attributes = True


class StrikeResponse(BaseModel):
    id: str
    name: str
    strike_type: str
    start_date: Optional[str]
    end_date: Optional[str]
    country_id: str
    location_name: Optional[str]
    participants: Optional[int]
    outcome: Optional[str]
    demands: Optional[List[str]]
    casualties: Optional[int]
    description: Optional[str]

    class Config:
        from_attributes = True


@router.get("/organizations", response_model=List[LaborOrgResponse])
async def list_labor_organizations(
    country_id: Optional[str] = Query(None),
    organization_type: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    active_in_year: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List labor organizations with optional filters."""
    query = select(LaborOrganization)
    
    if country_id:
        query = query.where(LaborOrganization.country_id == country_id)
    if organization_type:
        query = query.where(LaborOrganization.organization_type == organization_type)
    if industry:
        query = query.where(LaborOrganization.industry_sectors.contains([industry]))
    if active_in_year:
        target = date(active_in_year, 7, 1)
        query = query.where(
            and_(
                or_(LaborOrganization.founded.is_(None), LaborOrganization.founded <= target),
                or_(LaborOrganization.dissolved.is_(None), LaborOrganization.dissolved >= target),
            )
        )
    
    query = query.order_by(LaborOrganization.name).offset(offset).limit(limit)
    result = await db.execute(query)
    
    return [
        LaborOrgResponse(
            id=str(org.id),
            name=org.name,
            abbreviation=org.abbreviation,
            organization_type=org.organization_type,
            industry_sectors=org.industry_sectors,
            founded=org.founded.isoformat() if org.founded else None,
            dissolved=org.dissolved.isoformat() if org.dissolved else None,
            country_id=str(org.country_id),
            peak_membership=org.peak_membership,
            ideology_tags=org.ideology_tags,
            description=org.description,
        )
        for org in result.scalars().all()
    ]


@router.get("/organizations/{org_id}", response_model=LaborOrgResponse)
async def get_labor_organization(
    org_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific labor organization."""
    result = await db.execute(
        select(LaborOrganization).where(LaborOrganization.id == org_id)
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    return LaborOrgResponse(
        id=str(org.id),
        name=org.name,
        abbreviation=org.abbreviation,
        organization_type=org.organization_type,
        industry_sectors=org.industry_sectors,
        founded=org.founded.isoformat() if org.founded else None,
        dissolved=org.dissolved.isoformat() if org.dissolved else None,
        country_id=str(org.country_id),
        peak_membership=org.peak_membership,
        ideology_tags=org.ideology_tags,
        description=org.description,
    )


@router.get("/strikes", response_model=List[StrikeResponse])
async def list_strikes(
    country_id: Optional[str] = Query(None),
    strike_type: Optional[str] = Query(None),
    outcome: Optional[str] = Query(None),
    start_year: Optional[int] = Query(None),
    end_year: Optional[int] = Query(None),
    min_participants: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List strikes with optional filters."""
    query = select(Strike)
    
    if country_id:
        query = query.where(Strike.country_id == country_id)
    if strike_type:
        query = query.where(Strike.strike_type == strike_type)
    if outcome:
        query = query.where(Strike.outcome == outcome)
    if start_year:
        query = query.where(Strike.start_date >= date(start_year, 1, 1))
    if end_year:
        query = query.where(Strike.start_date <= date(end_year, 12, 31))
    if min_participants:
        query = query.where(Strike.participants >= min_participants)
    
    query = query.order_by(Strike.start_date.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    
    return [
        StrikeResponse(
            id=str(strike.id),
            name=strike.name,
            strike_type=strike.strike_type,
            start_date=strike.start_date.isoformat() if strike.start_date else None,
            end_date=strike.end_date.isoformat() if strike.end_date else None,
            country_id=str(strike.country_id),
            location_name=strike.location_name,
            participants=strike.participants,
            outcome=strike.outcome,
            demands=strike.demands,
            casualties=strike.casualties,
            description=strike.description,
        )
        for strike in result.scalars().all()
    ]


@router.get("/strikes/{strike_id}", response_model=StrikeResponse)
async def get_strike(
    strike_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get details of a specific strike."""
    result = await db.execute(
        select(Strike).where(Strike.id == strike_id)
    )
    strike = result.scalar_one_or_none()
    if not strike:
        raise HTTPException(status_code=404, detail="Strike not found")
    
    return StrikeResponse(
        id=str(strike.id),
        name=strike.name,
        strike_type=strike.strike_type,
        start_date=strike.start_date.isoformat() if strike.start_date else None,
        end_date=strike.end_date.isoformat() if strike.end_date else None,
        country_id=str(strike.country_id),
        location_name=strike.location_name,
        participants=strike.participants,
        outcome=strike.outcome,
        demands=strike.demands,
        casualties=strike.casualties,
        description=strike.description,
    )


@router.get("/statistics")
async def get_labor_statistics(
    country_id: Optional[str] = Query(None),
    start_year: int = Query(1900),
    end_year: int = Query(2024),
    db: AsyncSession = Depends(get_db),
):
    """Get labor movement statistics."""
    # Count organizations by type
    org_query = select(
        LaborOrganization.organization_type,
        func.count(LaborOrganization.id).label('count'),
    ).group_by(LaborOrganization.organization_type)
    
    if country_id:
        org_query = org_query.where(LaborOrganization.country_id == country_id)
    
    org_result = await db.execute(org_query)
    orgs_by_type = {row.organization_type: row.count for row in org_result.all()}
    
    # Count strikes by outcome
    strike_query = select(
        Strike.outcome,
        func.count(Strike.id).label('count'),
    ).where(
        and_(
            Strike.start_date >= date(start_year, 1, 1),
            Strike.start_date <= date(end_year, 12, 31),
        )
    ).group_by(Strike.outcome)
    
    if country_id:
        strike_query = strike_query.where(Strike.country_id == country_id)
    
    strike_result = await db.execute(strike_query)
    strikes_by_outcome = {row.outcome or 'unknown': row.count for row in strike_result.all()}
    
    # Strikes by year
    yearly_query = select(
        func.extract('year', Strike.start_date).label('year'),
        func.count(Strike.id).label('count'),
        func.sum(Strike.participants).label('total_participants'),
    ).where(
        and_(
            Strike.start_date >= date(start_year, 1, 1),
            Strike.start_date <= date(end_year, 12, 31),
        )
    ).group_by(func.extract('year', Strike.start_date)).order_by('year')
    
    if country_id:
        yearly_query = yearly_query.where(Strike.country_id == country_id)
    
    yearly_result = await db.execute(yearly_query)
    strikes_by_year = [
        {
            "year": int(row.year),
            "count": row.count,
            "participants": row.total_participants,
        }
        for row in yearly_result.all()
    ]
    
    return {
        "organizations_by_type": orgs_by_type,
        "strikes_by_outcome": strikes_by_outcome,
        "strikes_by_year": strikes_by_year,
        "filters": {
            "country_id": country_id,
            "start_year": start_year,
            "end_year": end_year,
        },
    }
