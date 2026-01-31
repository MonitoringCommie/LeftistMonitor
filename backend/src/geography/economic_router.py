"""Economic data API routes using real World Bank data."""
from typing import Optional, List
from uuid import UUID
import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from ..database import get_db
from .models import Country

router = APIRouter()

# Data directory
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped" / "economic"

# Load World Bank data
_worldbank_data = None
_country_code_map = None

def load_worldbank_data():
    """Load World Bank combined data."""
    global _worldbank_data, _country_code_map
    
    if _worldbank_data is None:
        combined_file = DATA_DIR / "worldbank_combined.json"
        if combined_file.exists():
            with open(combined_file, 'r') as f:
                data = json.load(f)
                _worldbank_data = {item["country_code"]: item for item in data}
                _country_code_map = {item["country_name"].lower(): item["country_code"] for item in data}
        else:
            _worldbank_data = {}
            _country_code_map = {}
    
    return _worldbank_data, _country_code_map

def get_country_code(country_name: str) -> Optional[str]:
    """Get ISO3 country code from name."""
    _, code_map = load_worldbank_data()
    
    name_lower = country_name.lower()
    
    # Direct match
    if name_lower in code_map:
        return code_map[name_lower]
    
    # Partial match
    for name, code in code_map.items():
        if name_lower in name or name in name_lower:
            return code
    
    # Common aliases
    aliases = {
        "united states": "USA",
        "usa": "USA",
        "uk": "GBR",
        "united kingdom": "GBR",
        "russia": "RUS",
        "russian federation": "RUS",
        "south korea": "KOR",
        "north korea": "PRK",
        "iran": "IRN",
        "syria": "SYR",
        "vietnam": "VNM",
        "laos": "LAO",
    }
    
    if name_lower in aliases:
        return aliases[name_lower]
    
    return None


# Schemas
class GDPDataPoint(BaseModel):
    year: int
    gdp: Optional[float] = None
    gdp_per_capita: Optional[float] = None
    growth_rate: Optional[float] = None


class BudgetCategory(BaseModel):
    name: str
    value: float
    percent: Optional[float] = None
    color: Optional[str] = None


class MilitarySpending(BaseModel):
    year: int
    spending: Optional[float] = None
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


async def get_country_name(country_id: UUID, db: AsyncSession) -> str:
    """Get country name from ID."""
    result = await db.execute(select(Country).where(Country.id == country_id))
    country = result.scalar_one_or_none()
    return country.name_en if country else "Unknown"


@router.get("/countries/stats", response_model=List[dict])
async def get_global_country_stats(
    db: AsyncSession = Depends(get_db),
):
    """Get statistics for all countries for global rankings."""
    wb_data, _ = load_worldbank_data()
    
    # Get all countries from database
    result = await db.execute(select(Country).where(Country.entity_type == 'country'))
    countries = result.scalars().all()
    
    stats = []
    for country in countries:
        country_code = get_country_code(country.name_en)
        
        stat = {
            "id": str(country.id),
            "name": country.name_en,
            "iso_alpha3": country.iso_alpha3,
            "gdp": None,
            "population": None,
            "military_spending_pct": None,
        }
        
        if country_code and country_code in wb_data:
            country_wb = wb_data[country_code]
            for year in range(2023, 2000, -1):
                year_str = str(year)
                year_data = country_wb.get("data", {}).get(year_str, {})
                
                if stat["gdp"] is None and year_data.get("gdp_current_usd"):
                    stat["gdp"] = year_data["gdp_current_usd"]
                
                if stat["population"] is None and year_data.get("population"):
                    stat["population"] = year_data["population"]
                
                if stat["military_spending_pct"] is None and year_data.get("military_spending_gdp_pct"):
                    stat["military_spending_pct"] = year_data["military_spending_gdp_pct"]
                
                if all([stat["gdp"], stat["population"], stat["military_spending_pct"]]):
                    break
        
        stats.append(stat)
    
    return stats


@router.get("/countries/{country_id}/economic/gdp", response_model=List[GDPDataPoint])
async def get_gdp_history(
    country_id: UUID,
    start_year: int = Query(1980, ge=1960, le=2023),
    end_year: int = Query(2023, ge=1960, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get GDP history for a country using World Bank data."""
    country_name = await get_country_name(country_id, db)
    country_code = get_country_code(country_name)
    
    wb_data, _ = load_worldbank_data()
    
    if not country_code or country_code not in wb_data:
        return []
    
    country_wb = wb_data[country_code]
    data_points = []
    
    for year in range(start_year, min(end_year + 1, 2024)):
        year_str = str(year)
        year_data = country_wb.get("data", {}).get(year_str, {})
        
        gdp = year_data.get("gdp_current_usd")
        gdp_pc = year_data.get("gdp_per_capita")
        growth = year_data.get("gdp_growth")
        
        if gdp or gdp_pc or growth:
            data_points.append(GDPDataPoint(
                year=year,
                gdp=gdp,
                gdp_per_capita=gdp_pc,
                growth_rate=growth
            ))
    
    return data_points


@router.get("/countries/{country_id}/economic/budget", response_model=List[BudgetCategory])
async def get_budget_breakdown(
    country_id: UUID,
    year: Optional[int] = Query(None, ge=1990, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get government budget breakdown for a country."""
    country_name = await get_country_name(country_id, db)
    country_code = get_country_code(country_name)
    
    wb_data, _ = load_worldbank_data()
    
    if not country_code or country_code not in wb_data:
        return []
    
    country_wb = wb_data[country_code]
    target_year = year or 2022
    
    # Find latest year with data
    for y in range(target_year, 2000, -1):
        year_str = str(y)
        year_data = country_wb.get("data", {}).get(year_str, {})
        
        gdp = year_data.get("gdp_current_usd")
        military_pct = year_data.get("military_spending_gdp_pct")
        education_pct = year_data.get("education_spending_gdp_pct")
        health_pct = year_data.get("health_spending_gdp_pct")
        
        if gdp and (military_pct or education_pct or health_pct):
            # Estimate budget as ~35% of GDP
            total_budget = gdp * 0.35
            
            categories = []
            
            if health_pct:
                health_val = gdp * health_pct / 100
                categories.append(BudgetCategory(
                    name="Healthcare",
                    value=health_val,
                    percent=health_pct * 100 / 35,
                    color="#22c55e"
                ))
            
            if education_pct:
                edu_val = gdp * education_pct / 100
                categories.append(BudgetCategory(
                    name="Education",
                    value=edu_val,
                    percent=education_pct * 100 / 35,
                    color="#3b82f6"
                ))
            
            if military_pct:
                mil_val = gdp * military_pct / 100
                categories.append(BudgetCategory(
                    name="Defense",
                    value=mil_val,
                    percent=military_pct * 100 / 35,
                    color="#ef4444"
                ))
            
            # Add estimated categories
            remaining = 100 - sum(c.percent or 0 for c in categories)
            if remaining > 0:
                categories.extend([
                    BudgetCategory(name="Social Services", value=total_budget * 0.15, percent=15, color="#8b5cf6"),
                    BudgetCategory(name="Infrastructure", value=total_budget * 0.08, percent=8, color="#f59e0b"),
                    BudgetCategory(name="Other", value=total_budget * (remaining - 23) / 100, percent=remaining - 23, color="#14b8a6"),
                ])
            
            return categories
    
    return []


@router.get("/countries/{country_id}/economic/military", response_model=List[MilitarySpending])
async def get_military_spending(
    country_id: UUID,
    start_year: int = Query(1990, ge=1960, le=2023),
    end_year: int = Query(2023, ge=1960, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get military spending history for a country."""
    country_name = await get_country_name(country_id, db)
    country_code = get_country_code(country_name)
    
    wb_data, _ = load_worldbank_data()
    
    if not country_code or country_code not in wb_data:
        return []
    
    country_wb = wb_data[country_code]
    data_points = []
    
    for year in range(start_year, min(end_year + 1, 2024)):
        year_str = str(year)
        year_data = country_wb.get("data", {}).get(year_str, {})
        
        gdp = year_data.get("gdp_current_usd")
        military_pct = year_data.get("military_spending_gdp_pct")
        
        if military_pct:
            spending = gdp * military_pct / 100 if gdp else None
            data_points.append(MilitarySpending(
                year=year,
                spending=spending,
                gdp_percent=military_pct
            ))
    
    return data_points


@router.get("/countries/{country_id}/demographics/population", response_model=List[PopulationData])
async def get_population_history(
    country_id: UUID,
    start_year: int = Query(1960, ge=1960, le=2023),
    end_year: int = Query(2023, ge=1960, le=2030),
    db: AsyncSession = Depends(get_db),
):
    """Get population history for a country."""
    country_name = await get_country_name(country_id, db)
    country_code = get_country_code(country_name)
    
    wb_data, _ = load_worldbank_data()
    
    if not country_code or country_code not in wb_data:
        return []
    
    country_wb = wb_data[country_code]
    data_points = []
    prev_pop = None
    
    for year in range(start_year, min(end_year + 1, 2024)):
        year_str = str(year)
        year_data = country_wb.get("data", {}).get(year_str, {})
        
        population = year_data.get("population")
        urban_pct = year_data.get("urban_population_pct")
        
        if population:
            pop_int = int(population)
            urban = int(population * urban_pct / 100) if urban_pct else None
            rural = pop_int - urban if urban else None
            
            growth_rate = None
            if prev_pop:
                growth_rate = round((pop_int - prev_pop) / prev_pop * 100, 2)
            prev_pop = pop_int
            
            data_points.append(PopulationData(
                year=year,
                population=pop_int,
                urban_population=urban,
                rural_population=rural,
                growth_rate=growth_rate
            ))
    
    return data_points


@router.get("/countries/{country_id}/economic/overview", response_model=EconomicOverview)
async def get_economic_overview(
    country_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get current economic overview for a country."""
    country_name = await get_country_name(country_id, db)
    country_code = get_country_code(country_name)
    
    wb_data, _ = load_worldbank_data()
    
    if not country_code or country_code not in wb_data:
        return EconomicOverview()
    
    country_wb = wb_data[country_code]
    
    # Find latest year with GDP data
    for year in range(2023, 2000, -1):
        year_str = str(year)
        year_data = country_wb.get("data", {}).get(year_str, {})
        
        gdp = year_data.get("gdp_current_usd")
        if gdp:
            return EconomicOverview(
                gdp_current=gdp,
                gdp_per_capita=year_data.get("gdp_per_capita"),
                gdp_growth=year_data.get("gdp_growth"),
                inflation=year_data.get("inflation"),
                unemployment=year_data.get("unemployment"),
                debt_to_gdp=year_data.get("debt_to_gdp"),
                currency="USD",
                year=year
            )
    
    return EconomicOverview()



