"""Bulk data export service for researchers."""
from typing import Optional, Literal, List
from datetime import date
import json
import csv
import io

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..database import get_db


router = APIRouter()


class ExportMetadata(BaseModel):
    entity_type: str
    record_count: int
    filters_applied: dict
    export_date: str
    format: str


@router.get("/elections")
async def export_elections(
    country_id: Optional[str] = Query(None),
    start_year: Optional[int] = Query(None, ge=1800, le=2100),
    end_year: Optional[int] = Query(None, ge=1800, le=2100),
    format: Literal["json", "csv"] = Query("json"),
    db: AsyncSession = Depends(get_db),
):
    """Export election data in JSON or CSV format."""
    from ..politics.models import Election, ElectionResult, PoliticalParty
    from ..geography.models import Country
    
    query = (
        select(
            Election.id,
            Election.date,
            Election.election_type,
            Election.turnout,
            Election.total_votes,
            Election.total_seats,
            Country.name_en.label('country_name'),
            Country.iso_alpha2.label('country_code'),
        )
        .join(Country, Election.country_id == Country.id)
    )
    
    filters = {}
    if country_id:
        query = query.where(Election.country_id == country_id)
        filters['country_id'] = country_id
    if start_year:
        query = query.where(Election.date >= date(start_year, 1, 1))
        filters['start_year'] = start_year
    if end_year:
        query = query.where(Election.date <= date(end_year, 12, 31))
        filters['end_year'] = end_year
    
    query = query.order_by(Election.date)
    result = await db.execute(query)
    rows = result.all()
    
    data = [
        {
            'id': str(row.id),
            'date': row.date.isoformat() if row.date else None,
            'election_type': row.election_type,
            'turnout': float(row.turnout) if row.turnout else None,
            'total_votes': row.total_votes,
            'total_seats': row.total_seats,
            'country_name': row.country_name,
            'country_code': row.country_code,
        }
        for row in rows
    ]
    
    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=elections_export.csv"}
        )
    
    return {
        "metadata": {
            "entity_type": "elections",
            "record_count": len(data),
            "filters_applied": filters,
            "export_date": date.today().isoformat(),
            "format": format,
        },
        "data": data,
    }


@router.get("/parties")
async def export_parties(
    country_id: Optional[str] = Query(None),
    party_family: Optional[str] = Query(None),
    format: Literal["json", "csv"] = Query("json"),
    db: AsyncSession = Depends(get_db),
):
    """Export political party data."""
    from ..politics.models import PoliticalParty
    from ..geography.models import Country
    
    query = (
        select(
            PoliticalParty.id,
            PoliticalParty.name,
            PoliticalParty.abbreviation,
            PoliticalParty.founded,
            PoliticalParty.dissolved,
            PoliticalParty.party_family,
            PoliticalParty.left_right_score,
            PoliticalParty.wikidata_id,
            Country.name_en.label('country_name'),
            Country.iso_alpha2.label('country_code'),
        )
        .join(Country, PoliticalParty.country_id == Country.id)
    )
    
    filters = {}
    if country_id:
        query = query.where(PoliticalParty.country_id == country_id)
        filters['country_id'] = country_id
    if party_family:
        query = query.where(PoliticalParty.party_family == party_family)
        filters['party_family'] = party_family
    
    query = query.order_by(PoliticalParty.name)
    result = await db.execute(query)
    rows = result.all()
    
    data = [
        {
            'id': str(row.id),
            'name': row.name,
            'abbreviation': row.abbreviation,
            'founded': row.founded.isoformat() if row.founded else None,
            'dissolved': row.dissolved.isoformat() if row.dissolved else None,
            'party_family': row.party_family,
            'left_right_score': float(row.left_right_score) if row.left_right_score else None,
            'wikidata_id': row.wikidata_id,
            'country_name': row.country_name,
            'country_code': row.country_code,
        }
        for row in rows
    ]
    
    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=parties_export.csv"}
        )
    
    return {
        "metadata": {
            "entity_type": "parties",
            "record_count": len(data),
            "filters_applied": filters,
            "export_date": date.today().isoformat(),
            "format": format,
        },
        "data": data,
    }


@router.get("/conflicts")
async def export_conflicts(
    start_year: Optional[int] = Query(None, ge=1800, le=2100),
    end_year: Optional[int] = Query(None, ge=1800, le=2100),
    conflict_type: Optional[str] = Query(None),
    format: Literal["json", "csv"] = Query("json"),
    db: AsyncSession = Depends(get_db),
):
    """Export conflict data."""
    from ..events.models import Conflict
    
    query = select(
        Conflict.id,
        Conflict.name,
        Conflict.start_date,
        Conflict.end_date,
        Conflict.conflict_type,
        Conflict.intensity,
        Conflict.casualties_low,
        Conflict.casualties_high,
        Conflict.ucdp_id,
        Conflict.wikidata_id,
    )
    
    filters = {}
    if start_year:
        query = query.where(Conflict.start_date >= date(start_year, 1, 1))
        filters['start_year'] = start_year
    if end_year:
        query = query.where(Conflict.start_date <= date(end_year, 12, 31))
        filters['end_year'] = end_year
    if conflict_type:
        query = query.where(Conflict.conflict_type == conflict_type)
        filters['conflict_type'] = conflict_type
    
    query = query.order_by(Conflict.start_date)
    result = await db.execute(query)
    rows = result.all()
    
    data = [
        {
            'id': str(row.id),
            'name': row.name,
            'start_date': row.start_date.isoformat() if row.start_date else None,
            'end_date': row.end_date.isoformat() if row.end_date else None,
            'conflict_type': row.conflict_type,
            'intensity': row.intensity,
            'casualties_low': row.casualties_low,
            'casualties_high': row.casualties_high,
            'ucdp_id': row.ucdp_id,
            'wikidata_id': row.wikidata_id,
        }
        for row in rows
    ]
    
    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=conflicts_export.csv"}
        )
    
    return {
        "metadata": {
            "entity_type": "conflicts",
            "record_count": len(data),
            "filters_applied": filters,
            "export_date": date.today().isoformat(),
            "format": format,
        },
        "data": data,
    }


@router.get("/events")
async def export_events(
    country_id: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    start_year: Optional[int] = Query(None, ge=1800, le=2100),
    end_year: Optional[int] = Query(None, ge=1800, le=2100),
    format: Literal["json", "csv"] = Query("json"),
    limit: int = Query(1000, ge=1, le=10000),
    db: AsyncSession = Depends(get_db),
):
    """Export historical events data."""
    from ..events.models import Event
    from ..geography.models import Country
    
    query = (
        select(
            Event.id,
            Event.title,
            Event.start_date,
            Event.end_date,
            Event.category,
            Event.event_type,
            Event.importance,
            Event.wikidata_id,
            Country.name_en.label('country_name'),
        )
        .outerjoin(Country, Event.primary_country_id == Country.id)
    )
    
    filters = {}
    if country_id:
        query = query.where(Event.primary_country_id == country_id)
        filters['country_id'] = country_id
    if category:
        query = query.where(Event.category == category)
        filters['category'] = category
    if start_year:
        query = query.where(Event.start_date >= date(start_year, 1, 1))
        filters['start_year'] = start_year
    if end_year:
        query = query.where(Event.start_date <= date(end_year, 12, 31))
        filters['end_year'] = end_year
    
    query = query.order_by(Event.start_date).limit(limit)
    result = await db.execute(query)
    rows = result.all()
    
    data = [
        {
            'id': str(row.id),
            'title': row.title,
            'start_date': row.start_date.isoformat() if row.start_date else None,
            'end_date': row.end_date.isoformat() if row.end_date else None,
            'category': row.category,
            'event_type': row.event_type,
            'importance': row.importance,
            'wikidata_id': row.wikidata_id,
            'country_name': row.country_name,
        }
        for row in rows
    ]
    
    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=data[0].keys())
            writer.writeheader()
            writer.writerows(data)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=events_export.csv"}
        )
    
    return {
        "metadata": {
            "entity_type": "events",
            "record_count": len(data),
            "filters_applied": filters,
            "export_date": date.today().isoformat(),
            "format": format,
        },
        "data": data,
    }
