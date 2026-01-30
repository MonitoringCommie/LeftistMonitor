"""Multi-country comparison API for electoral and political analysis."""
from typing import Optional, List
from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


class PartyElectionData(BaseModel):
    party_id: str
    party_name: str
    party_family: Optional[str]
    vote_share: float
    seats: Optional[int]


class ElectionComparisonItem(BaseModel):
    election_id: str
    country_id: str
    country_name: str
    date: str
    election_type: str
    turnout: Optional[float]
    parties: List[PartyElectionData]


class ElectionComparisonResponse(BaseModel):
    countries: List[str]
    start_year: int
    end_year: int
    elections: List[ElectionComparisonItem]
    summary: dict


class PartyFamilyTrend(BaseModel):
    year: int
    country_id: str
    country_name: str
    family: str
    total_vote_share: float


class IdeologyComparisonResponse(BaseModel):
    countries: List[str]
    trends: List[PartyFamilyTrend]
    summary: dict


@router.get("/elections", response_model=ElectionComparisonResponse)
async def compare_elections(
    countries: str = Query(..., description="Comma-separated country IDs"),
    start_year: int = Query(1900, ge=1800, le=2100),
    end_year: int = Query(2024, ge=1800, le=2100),
    election_type: Optional[str] = Query(None, description="Filter by election type"),
    db: AsyncSession = Depends(get_db),
):
    """Compare elections across multiple countries over a time period."""
    from ..politics.models import Election, ElectionResult, PoliticalParty
    from ..geography.models import Country
    
    country_ids = [c.strip() for c in countries.split(",")]
    if len(country_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 countries required for comparison")
    if len(country_ids) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 countries for comparison")
    
    # Get country names
    country_result = await db.execute(
        select(Country.id, Country.name_en).where(Country.id.in_(country_ids))
    )
    country_names = {str(row.id): row.name_en for row in country_result.all()}
    
    # Get elections
    query = (
        select(Election)
        .where(
            and_(
                Election.country_id.in_(country_ids),
                Election.date >= date(start_year, 1, 1),
                Election.date <= date(end_year, 12, 31),
            )
        )
        .order_by(Election.date)
    )
    
    if election_type:
        query = query.where(Election.election_type == election_type)
    
    elections_result = await db.execute(query)
    elections = elections_result.scalars().all()
    
    comparison_items = []
    total_by_country = {cid: 0 for cid in country_ids}
    
    for election in elections:
        # Get results for this election
        results_query = (
            select(
                ElectionResult.vote_share,
                ElectionResult.seats,
                PoliticalParty.id.label('party_id'),
                PoliticalParty.name.label('party_name'),
                PoliticalParty.party_family,
            )
            .join(PoliticalParty, ElectionResult.party_id == PoliticalParty.id)
            .where(ElectionResult.election_id == election.id)
            .order_by(ElectionResult.vote_share.desc())
        )
        results_result = await db.execute(results_query)
        
        parties = [
            PartyElectionData(
                party_id=str(row.party_id),
                party_name=row.party_name,
                party_family=row.party_family,
                vote_share=float(row.vote_share) if row.vote_share else 0,
                seats=row.seats,
            )
            for row in results_result.all()
        ]
        
        country_id_str = str(election.country_id)
        total_by_country[country_id_str] = total_by_country.get(country_id_str, 0) + 1
        
        comparison_items.append(ElectionComparisonItem(
            election_id=str(election.id),
            country_id=country_id_str,
            country_name=country_names.get(country_id_str, "Unknown"),
            date=election.date.isoformat() if election.date else "",
            election_type=election.election_type or "",
            turnout=float(election.turnout) if election.turnout else None,
            parties=parties,
        ))
    
    return ElectionComparisonResponse(
        countries=list(country_names.values()),
        start_year=start_year,
        end_year=end_year,
        elections=comparison_items,
        summary={
            "total_elections": len(comparison_items),
            "elections_per_country": {country_names.get(k, k): v for k, v in total_by_country.items()},
        },
    )


@router.get("/ideology-trends", response_model=IdeologyComparisonResponse)
async def compare_ideology_trends(
    countries: str = Query(..., description="Comma-separated country IDs"),
    start_year: int = Query(1900, ge=1800, le=2100),
    end_year: int = Query(2024, ge=1800, le=2100),
    db: AsyncSession = Depends(get_db),
):
    """Compare party family vote share trends across countries."""
    from ..politics.models import Election, ElectionResult, PoliticalParty
    from ..geography.models import Country
    
    country_ids = [c.strip() for c in countries.split(",")]
    
    # Get country names
    country_result = await db.execute(
        select(Country.id, Country.name_en).where(Country.id.in_(country_ids))
    )
    country_names = {str(row.id): row.name_en for row in country_result.all()}
    
    # Aggregate vote share by party family per election
    query = (
        select(
            func.extract('year', Election.date).label('year'),
            Election.country_id,
            PoliticalParty.party_family,
            func.sum(ElectionResult.vote_share).label('total_share'),
        )
        .join(ElectionResult, Election.id == ElectionResult.election_id)
        .join(PoliticalParty, ElectionResult.party_id == PoliticalParty.id)
        .where(
            and_(
                Election.country_id.in_(country_ids),
                Election.date >= date(start_year, 1, 1),
                Election.date <= date(end_year, 12, 31),
                PoliticalParty.party_family.isnot(None),
            )
        )
        .group_by(
            func.extract('year', Election.date),
            Election.country_id,
            PoliticalParty.party_family,
        )
        .order_by(func.extract('year', Election.date))
    )
    
    result = await db.execute(query)
    
    trends = []
    family_totals = {}
    
    for row in result.all():
        country_id_str = str(row.country_id)
        family = row.party_family or "other"
        
        trends.append(PartyFamilyTrend(
            year=int(row.year),
            country_id=country_id_str,
            country_name=country_names.get(country_id_str, "Unknown"),
            family=family,
            total_vote_share=float(row.total_share) if row.total_share else 0,
        ))
        
        family_totals[family] = family_totals.get(family, 0) + (float(row.total_share) if row.total_share else 0)
    
    return IdeologyComparisonResponse(
        countries=list(country_names.values()),
        trends=trends,
        summary={
            "total_data_points": len(trends),
            "party_families": list(family_totals.keys()),
            "dominant_families": sorted(family_totals.items(), key=lambda x: x[1], reverse=True)[:5],
        },
    )


@router.get("/left-performance")
async def compare_left_performance(
    countries: str = Query(..., description="Comma-separated country IDs"),
    start_year: int = Query(1900, ge=1800, le=2100),
    end_year: int = Query(2024, ge=1800, le=2100),
    db: AsyncSession = Depends(get_db),
):
    """Compare leftist party performance across countries over time."""
    from ..politics.models import Election, ElectionResult, PoliticalParty
    from ..geography.models import Country
    
    country_ids = [c.strip() for c in countries.split(",")]
    left_families = ['communist', 'socialist', 'social_democratic', 'green', 'left']
    
    # Get country names
    country_result = await db.execute(
        select(Country.id, Country.name_en).where(Country.id.in_(country_ids))
    )
    country_names = {str(row.id): row.name_en for row in country_result.all()}
    
    # Aggregate left vote share per election
    query = (
        select(
            func.extract('year', Election.date).label('year'),
            Election.country_id,
            func.sum(ElectionResult.vote_share).label('left_share'),
        )
        .join(ElectionResult, Election.id == ElectionResult.election_id)
        .join(PoliticalParty, ElectionResult.party_id == PoliticalParty.id)
        .where(
            and_(
                Election.country_id.in_(country_ids),
                Election.date >= date(start_year, 1, 1),
                Election.date <= date(end_year, 12, 31),
                PoliticalParty.party_family.in_(left_families),
            )
        )
        .group_by(func.extract('year', Election.date), Election.country_id)
        .order_by(func.extract('year', Election.date))
    )
    
    result = await db.execute(query)
    
    data_points = []
    for row in result.all():
        country_id_str = str(row.country_id)
        data_points.append({
            "year": int(row.year),
            "country_id": country_id_str,
            "country_name": country_names.get(country_id_str, "Unknown"),
            "left_vote_share": float(row.left_share) if row.left_share else 0,
        })
    
    # Calculate averages per country
    country_averages = {}
    for point in data_points:
        cname = point["country_name"]
        if cname not in country_averages:
            country_averages[cname] = {"total": 0, "count": 0}
        country_averages[cname]["total"] += point["left_vote_share"]
        country_averages[cname]["count"] += 1
    
    averages = {
        k: round(v["total"] / v["count"], 2) if v["count"] > 0 else 0
        for k, v in country_averages.items()
    }
    
    return {
        "countries": list(country_names.values()),
        "start_year": start_year,
        "end_year": end_year,
        "data": data_points,
        "summary": {
            "average_left_share_by_country": averages,
            "left_families_included": left_families,
        },
    }
