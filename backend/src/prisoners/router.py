"""
Political prisoner data API endpoints.
"""

import json
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Query, Response

router = APIRouter(prefix="/prisoners", tags=["political-prisoners"])

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped" / "prisoners"


def load_prisoner_data():
    """Load political prisoner data from JSON file."""
    data_file = DATA_DIR / "political_prisoners.json"
    if data_file.exists():
        with open(data_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"current_prisoners": [], "historical_prisoners": [], "statistics": {}}


@router.get("/")
async def get_prisoners_overview(response: Response):
    """Get overview of political prisoner database."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    data = load_prisoner_data()
    return {
        "metadata": data.get("metadata", {}),
        "statistics": data.get("statistics", {}),
        "current_count": len(data.get("current_prisoners", [])),
        "historical_count": len(data.get("historical_prisoners", [])),
    }


@router.get("/current")
async def get_current_prisoners(
    response: Response,
    country: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
):
    """Get currently detained political prisoners."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    data = load_prisoner_data()
    prisoners = data.get("current_prisoners", [])
    
    if country:
        prisoners = [p for p in prisoners if p.get("country", "").lower() == country.lower()]
    if category:
        prisoners = [p for p in prisoners if p.get("category", "").lower() == category.lower()]
    
    total = len(prisoners)
    prisoners = prisoners[offset:offset + limit]
    
    return {"total": total, "offset": offset, "limit": limit, "data": prisoners}


@router.get("/historical")
async def get_historical_prisoners(
    response: Response,
    country: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0),
):
    """Get historical political prisoners."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    data = load_prisoner_data()
    prisoners = data.get("historical_prisoners", [])
    
    if country:
        prisoners = [p for p in prisoners if p.get("country", "").lower() == country.lower()]
    
    total = len(prisoners)
    prisoners = prisoners[offset:offset + limit]
    
    return {"total": total, "offset": offset, "limit": limit, "data": prisoners}


@router.get("/statistics")
async def get_prisoner_statistics(response: Response):
    """Get statistics about political prisoners."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    data = load_prisoner_data()
    return data.get("statistics", {})


@router.get("/search")
async def search_prisoners(
    response: Response,
    q: str = Query(..., min_length=2),
    limit: int = Query(50, le=200),
):
    """Search political prisoners by name."""
    response.headers["Cache-Control"] = "public, max-age=1800"
    data = load_prisoner_data()
    
    query = q.lower()
    results = []
    
    for prisoner in data.get("current_prisoners", []):
        if query in prisoner.get("name", "").lower():
            prisoner["status_type"] = "current"
            results.append(prisoner)
    
    for prisoner in data.get("historical_prisoners", []):
        if query in prisoner.get("name", "").lower():
            prisoner["status_type"] = "historical"
            results.append(prisoner)
    
    return {"query": q, "total": len(results), "data": results[:limit]}


@router.get("/nobel-laureates")
async def get_nobel_laureates(response: Response):
    """Get political prisoners who received Nobel Peace Prize."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    data = load_prisoner_data()
    
    laureates = []
    for prisoner in data.get("current_prisoners", []) + data.get("historical_prisoners", []):
        awards = prisoner.get("awards", [])
        if any("Nobel" in award for award in awards):
            laureates.append(prisoner)
    
    return {"total": len(laureates), "data": laureates}
