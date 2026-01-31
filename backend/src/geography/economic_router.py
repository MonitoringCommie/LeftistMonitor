"""Economic data API routes for country dashboards."""
from typing import Optional, List
from uuid import UUID
import random
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db
from .service import GeographyService

router = APIRouter()


# Schemas
class GDPDataPoint(BaseModel):
    year: int
    gdp: float
    gdp_per_capita: Optional[float] = None
    growth_rate: Optional[float] = None


class BudgetCategory(BaseModel):
    name: str
    value: float
    percent: Optional[float] = None
    color: Optional[str] = None


class MilitarySpending(BaseModel):
    year: int
    spending: float
    gdp_percent: Optional[float] = None
    personnel: Optional[int] = None


class PopulationData(BaseModel):
    year: int
    population: int
    urban_population: Optional[int] = None
    rural_population: Optional[int] = None
    growth_rate: Optional[float] = None


class EconomicOverview(BaseModel):
    gdp_current: Optional[float] = None
    gdp_per_capita: Optional[float] = None
    gdp_growth: Optional[float] = None
    inflation: Optional[float] = None
    unemployment: Optional[float] = None
    debt_to_gdp: Optional[float] = None
    trade_balance: Optional[float] = None
    currency: Optional[str] = None
    year: Optional[int] = None


# Country-specific base data for more realistic mock data
COUNTRY_BASE_DATA = {
    # Major economies
    "united states": {"gdp_base": 20e12, "pop_base": 330e6, "military_pct": 3.5},
    "china": {"gdp_base": 14e12, "pop_base": 1400e6, "military_pct": 1.7},
    "germany": {"gdp_base": 4e12, "pop_base": 83e6, "military_pct": 1.4},
    "japan": {"gdp_base": 5e12, "pop_base": 125e6, "military_pct": 1.0},
    "united kingdom": {"gdp_base": 2.8e12, "pop_base": 67e6, "military_pct": 2.2},
    "france": {"gdp_base": 2.7e12, "pop_base": 67e6, "military_pct": 2.0},
    "india": {"gdp_base": 3e12, "pop_base": 1380e6, "military_pct": 2.4},
    "russia": {"gdp_base": 1.5e12, "pop_base": 144e6, "military_pct": 4.1},
    "brazil": {"gdp_base": 1.8e12, "pop_base": 212e6, "military_pct": 1.4},
    # Middle powers
    "australia": {"gdp_base": 1.4e12, "pop_base": 26e6, "military_pct": 2.0},
    "canada": {"gdp_base": 1.7e12, "pop_base": 38e6, "military_pct": 1.3},
    "south korea": {"gdp_base": 1.6e12, "pop_base": 52e6, "military_pct": 2.7},
    "mexico": {"gdp_base": 1.3e12, "pop_base": 128e6, "military_pct": 0.5},
    "indonesia": {"gdp_base": 1.1e12, "pop_base": 273e6, "military_pct": 0.8},
    # Smaller economies
    "israel": {"gdp_base": 400e9, "pop_base": 9e6, "military_pct": 5.2},
    "ireland": {"gdp_base": 400e9, "pop_base": 5e6, "military_pct": 0.3},
    "palestine": {"gdp_base": 15e9, "pop_base": 5e6, "military_pct": 0},
    "cuba": {"gdp_base": 100e9, "pop_base": 11e6, "military_pct": 2.9},
    "vietnam": {"gdp_base": 340e9, "pop_base": 97e6, "military_pct": 2.3},
}

def get_country_base(country_name: str) -> dict:
    """Get base economic data for a country."""
    name_lower = country_name.lower() if country_name else ""
    for key, data in COUNTRY_BASE_DATA.items():
        if key in name_lower or name_lower in key:
            return data
    # Default for unknown countries
    return {"gdp_base": 100e9, "pop_base": 20e6, "military_pct": 1.5}


def generate_gdp_history(country_name: str, start_year: int, end_year: int) -> List[GDPDataPoint]:
    """Generate realistic GDP history data."""
    base = get_country_base(country_name)
    data = []
    
    # Calculate initial GDP based on year (exponential growth backwards)
    years_from_2023 = 2023 - start_year
    initial_gdp = base["gdp_base"] / (1.03 ** years_from_2023)
    
    gdp = initial_gdp
    for year in range(start_year, end_year + 1):
        # Simulate growth with some variation
        growth = 0.02 + random.uniform(-0.03, 0.05)
        
        # Add recession years
        if year in [2008, 2009, 2020]:
            growth = random.uniform(-0.08, -0.02)
        
        gdp = gdp * (1 + growth)
        pop = base["pop_base"] * (1 + 0.01 * (year - 2023))
        
        data.append(GDPDataPoint(
            year=year,
            gdp=round(gdp),
            gdp_per_capita=round(gdp / max(pop, 1)),
            growth_rate=round(growth * 100, 1)
        ))
    
    return data


def generate_budget_data(country_name: str) -> List[BudgetCategory]:
    """Generate realistic budget breakdown."""
    base = get_country_base(country_name)
    total_budget = base["gdp_base"] * 0.35  # ~35% of GDP is government spending
    military_pct = base["military_pct"] / 35 * 100  # Convert to % of budget
    
    categories = [
        {"name": "Healthcare", "pct": 20 + random.uniform(-3, 3), "color": "#22c55e"},
        {"name": "Education", "pct": 15 + random.uniform(-2, 2), "color": "#3b82f6"},
        {"name": "Defense", "pct": military_pct * 2 + random.uniform(-1, 1), "color": "#ef4444"},
        {"name": "Social Services", "pct": 18 + random.uniform(-3, 3), "color": "#8b5cf6"},
        {"name": "Infrastructure", "pct": 10 + random.uniform(-2, 2), "color": "#f59e0b"},
        {"name": "Debt Service", "pct": 8 + random.uniform(-2, 2), "color": "#6366f1"},
        {"name": "Administration", "pct": 5 + random.uniform(-1, 1), "color": "#ec4899"},
    ]
    
    # Normalize to 100%
    total_pct = sum(c["pct"] for c in categories)
    
    result = []
    for cat in categories:
        normalized_pct = cat["pct"] / total_pct * 100
        result.append(BudgetCategory(
            name=cat["name"],
            value=round(total_budget * normalized_pct / 100),
            percent=round(normalized_pct, 1),
            color=cat["color"]
        ))
    
    # Add "Other"
    other_value = total_budget - sum(c.value for c in result)
    if other_value > 0:
        result.append(BudgetCategory(
            name="Other",
            value=round(other_value),
            percent=round(other_value / total_budget * 100, 1),
            color="#14b8a6"
        ))
    
    return result


def generate_military_data(country_name: str, start_year: int, end_year: int) -> List[MilitarySpending]:
    """Generate military spending history."""
    base = get_country_base(country_name)
    data = []
    
    base_spending = base["gdp_base"] * base["military_pct"] / 100
    spending = base_spending / (1.02 ** (2023 - start_year))
    
    for year in range(start_year, end_year + 1):
        growth = 0.02 + random.uniform(-0.02, 0.04)
        spending = spending * (1 + growth)
        gdp_pct = base["military_pct"] + random.uniform(-0.3, 0.3)
        
        data.append(MilitarySpending(
            year=year,
            spending=round(spending),
            gdp_percent=round(gdp_pct, 2),
            personnel=round(base["pop_base"] * 0.005 * (1 + random.uniform(-0.1, 0.1)))
        ))
    
    return data


def generate_population_data(country_name: str, start_year: int, end_year: int) -> List[PopulationData]:
    """Generate population history."""
    base = get_country_base(country_name)
    data = []
    
    # Calculate initial population
    initial_pop = base["pop_base"] / (1.012 ** (2023 - start_year))
    pop = initial_pop
    urban_ratio = 0.3 + (start_year - 1960) * 0.008  # Urbanization trend
    
    for year in range(start_year, end_year + 1):
        growth = 0.012 + random.uniform(-0.005, 0.005)
        pop = pop * (1 + growth)
        urban_ratio = min(0.9, urban_ratio + 0.005)
        
        data.append(PopulationData(
            year=year,
            population=round(pop),
            urban_population=round(pop * urban_ratio),
            rural_population=round(pop * (1 - urban_ratio)),
            growth_rate=round(growth * 100, 2)
        ))
    
    return data


# Routes
@router.get("/countries/{country_id}/economic/gdp", response_model=List[GDPDataPoint])
async def get_gdp_history(
    country_id: UUID,
    start_year: int = Query(1980, ge=1900, le=2023),
    end_year: int = Query(2023, ge=1900, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get GDP history for a country."""
    service = GeographyService(db)
    country = await service.get_country(country_id)
    country_name = country.name_en if country else "Unknown"
    
    return generate_gdp_history(country_name, start_year, end_year)


@router.get("/countries/{country_id}/economic/budget", response_model=List[BudgetCategory])
async def get_budget_breakdown(
    country_id: UUID,
    year: Optional[int] = Query(None, ge=1990, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get government budget breakdown for a country."""
    service = GeographyService(db)
    country = await service.get_country(country_id)
    country_name = country.name_en if country else "Unknown"
    
    return generate_budget_data(country_name)


@router.get("/countries/{country_id}/economic/military", response_model=List[MilitarySpending])
async def get_military_spending(
    country_id: UUID,
    start_year: int = Query(1990, ge=1950, le=2023),
    end_year: int = Query(2023, ge=1950, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get military spending history for a country."""
    service = GeographyService(db)
    country = await service.get_country(country_id)
    country_name = country.name_en if country else "Unknown"
    
    return generate_military_data(country_name, start_year, end_year)


@router.get("/countries/{country_id}/demographics/population", response_model=List[PopulationData])
async def get_population_history(
    country_id: UUID,
    start_year: int = Query(1960, ge=1900, le=2023),
    end_year: int = Query(2023, ge=1900, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get population history for a country."""
    service = GeographyService(db)
    country = await service.get_country(country_id)
    country_name = country.name_en if country else "Unknown"
    
    return generate_population_data(country_name, start_year, end_year)


@router.get("/countries/{country_id}/economic/overview", response_model=EconomicOverview)
async def get_economic_overview(
    country_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get current economic overview for a country."""
    service = GeographyService(db)
    country = await service.get_country(country_id)
    country_name = country.name_en if country else "Unknown"
    
    base = get_country_base(country_name)
    
    return EconomicOverview(
        gdp_current=round(base["gdp_base"]),
        gdp_per_capita=round(base["gdp_base"] / base["pop_base"]),
        gdp_growth=round(random.uniform(1, 5), 1),
        inflation=round(random.uniform(1, 8), 1),
        unemployment=round(random.uniform(3, 12), 1),
        debt_to_gdp=round(random.uniform(40, 120), 1),
        trade_balance=round(base["gdp_base"] * random.uniform(-0.05, 0.05)),
        currency="USD",
        year=2023
    )
