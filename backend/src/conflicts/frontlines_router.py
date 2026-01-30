"""Frontlines API routes."""
from typing import Optional, List
from uuid import UUID
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.functions import ST_AsGeoJSON
from pydantic import BaseModel

from ..database import get_db
import json

router = APIRouter()


class FrontlineFeature(BaseModel):
    id: str
    conflict_id: str
    conflict_name: str
    date: str
    controlled_by: str
    geometry_type: str
    color: Optional[str]
    notes: Optional[str]
    source: Optional[str]


class FrontlineGeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: List[dict]


@router.get("/conflicts-with-frontlines")
async def get_conflicts_with_frontlines(
    db: AsyncSession = Depends(get_db),
):
    """Get list of conflicts that have frontline data."""
    from ..events.models import Conflict
    
    query = text("""
        SELECT DISTINCT c.id, c.name, c.start_date, c.end_date, c.conflict_type,
               MIN(f.date) as first_frontline_date,
               MAX(f.date) as last_frontline_date,
               COUNT(DISTINCT f.date) as frontline_dates_count
        FROM conflicts c
        JOIN conflict_frontlines f ON c.id = f.conflict_id
        GROUP BY c.id, c.name, c.start_date, c.end_date, c.conflict_type
        ORDER BY c.start_date DESC
    """)
    
    result = await db.execute(query)
    rows = result.all()
    
    return [
        {
            "id": str(row.id),
            "name": row.name,
            "start_date": row.start_date.isoformat() if row.start_date else None,
            "end_date": row.end_date.isoformat() if row.end_date else None,
            "conflict_type": row.conflict_type,
            "first_frontline_date": row.first_frontline_date.isoformat() if row.first_frontline_date else None,
            "last_frontline_date": row.last_frontline_date.isoformat() if row.last_frontline_date else None,
            "frontline_dates_count": row.frontline_dates_count,
        }
        for row in rows
    ]


@router.get("/{conflict_id}/dates")
async def get_frontline_dates(
    conflict_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get all available frontline dates for a conflict."""
    query = text("""
        SELECT DISTINCT date, 
               array_agg(DISTINCT controlled_by) as sides
        FROM conflict_frontlines
        WHERE conflict_id = :conflict_id
        GROUP BY date
        ORDER BY date
    """)
    
    result = await db.execute(query, {"conflict_id": str(conflict_id)})
    rows = result.all()
    
    return [
        {
            "date": row.date.isoformat(),
            "sides": row.sides,
        }
        for row in rows
    ]


@router.get("/{conflict_id}/geojson")
async def get_frontline_geojson(
    conflict_id: UUID,
    target_date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: AsyncSession = Depends(get_db),
):
    """Get frontline GeoJSON for a conflict at a specific date."""
    from ..events.models import Conflict
    
    # Get conflict name
    conflict_result = await db.execute(
        select(Conflict.name).where(Conflict.id == conflict_id)
    )
    conflict_name = conflict_result.scalar_one_or_none() or "Unknown"
    
    if target_date:
        # Get frontlines for specific date
        query = text("""
            SELECT f.id, f.conflict_id, f.date, f.controlled_by, f.geometry_type,
                   f.color, f.notes, f.source,
                   ST_AsGeoJSON(f.geometry) as geometry
            FROM conflict_frontlines f
            WHERE f.conflict_id = :conflict_id AND f.date = :target_date
        """)
        result = await db.execute(query, {
            "conflict_id": str(conflict_id),
            "target_date": target_date
        })
    else:
        # Get all frontlines for this conflict
        query = text("""
            SELECT f.id, f.conflict_id, f.date, f.controlled_by, f.geometry_type,
                   f.color, f.notes, f.source,
                   ST_AsGeoJSON(f.geometry) as geometry
            FROM conflict_frontlines f
            WHERE f.conflict_id = :conflict_id
            ORDER BY f.date
        """)
        result = await db.execute(query, {"conflict_id": str(conflict_id)})
    
    rows = result.all()
    
    features = []
    for row in rows:
        feature = {
            "type": "Feature",
            "properties": {
                "id": str(row.id),
                "conflict_id": str(row.conflict_id),
                "conflict_name": conflict_name,
                "date": row.date.isoformat(),
                "controlled_by": row.controlled_by,
                "geometry_type": row.geometry_type,
                "color": row.color,
                "notes": row.notes,
                "source": row.source,
            },
            "geometry": json.loads(row.geometry) if row.geometry else None,
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/{conflict_id}/timeline")
async def get_frontline_timeline(
    conflict_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a summary timeline of frontline changes for a conflict."""
    from ..events.models import Conflict
    
    # Get conflict info
    conflict_result = await db.execute(
        select(Conflict).where(Conflict.id == conflict_id)
    )
    conflict = conflict_result.scalar_one_or_none()
    
    if not conflict:
        return {"error": "Conflict not found"}
    
    # Get timeline with notes
    query = text("""
        SELECT date, 
               array_agg(DISTINCT controlled_by) as sides,
               string_agg(DISTINCT notes, '; ') as notes
        FROM conflict_frontlines
        WHERE conflict_id = :conflict_id
        GROUP BY date
        ORDER BY date
    """)
    
    result = await db.execute(query, {"conflict_id": str(conflict_id)})
    rows = result.all()
    
    return {
        "conflict": {
            "id": str(conflict.id),
            "name": conflict.name,
            "start_date": conflict.start_date.isoformat() if conflict.start_date else None,
            "end_date": conflict.end_date.isoformat() if conflict.end_date else None,
        },
        "timeline": [
            {
                "date": row.date.isoformat(),
                "sides": row.sides,
                "notes": row.notes,
            }
            for row in rows
        ]
    }
