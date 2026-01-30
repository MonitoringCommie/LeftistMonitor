"""Territories and Occupations API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db

router = APIRouter()


@router.get("/occupations")
async def list_occupations(
    response: Response,
    year: Optional[int] = Query(None, ge=1800, le=2100, description="Filter by active in year"),
    ongoing: Optional[bool] = Query(None, description="Filter ongoing occupations only"),
    db: AsyncSession = Depends(get_db),
):
    """List all occupations with optional filtering."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    
    query = """
        SELECT 
            o.id, o.name, o.occupier_country_id, c.name_en as occupier_name,
            o.occupied_territory, o.occupied_people, o.start_date, o.end_date,
            o.occupation_type, o.international_law_status, o.un_resolutions,
            o.population_displaced, o.settlements_built, o.land_confiscated_km2,
            o.description, o.progressive_analysis
        FROM occupations o
        LEFT JOIN countries c ON o.occupier_country_id = c.id
        WHERE 1=1
    """
    params = {}
    
    if year:
        query += " AND o.start_date <= :year_end AND (o.end_date IS NULL OR o.end_date >= :year_start)"
        params["year_start"] = f"{year}-01-01"
        params["year_end"] = f"{year}-12-31"
    
    if ongoing:
        query += " AND o.end_date IS NULL"
    
    query += " ORDER BY o.start_date DESC"
    
    result = await db.execute(text(query), params)
    rows = result.fetchall()
    
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "occupier_country_id": str(r.occupier_country_id) if r.occupier_country_id else None,
            "occupier_name": r.occupier_name,
            "occupied_territory": r.occupied_territory,
            "occupied_people": r.occupied_people,
            "start_date": r.start_date.isoformat() if r.start_date else None,
            "end_date": r.end_date.isoformat() if r.end_date else None,
            "occupation_type": r.occupation_type,
            "international_law_status": r.international_law_status,
            "un_resolutions": r.un_resolutions or [],
            "population_displaced": r.population_displaced,
            "settlements_built": r.settlements_built,
            "land_confiscated_km2": float(r.land_confiscated_km2) if r.land_confiscated_km2 else None,
            "description": r.description,
            "progressive_analysis": r.progressive_analysis,
        }
        for r in rows
    ]


@router.get("/resistance-movements")
async def list_resistance_movements(
    response: Response,
    occupation_id: Optional[UUID] = Query(None, description="Filter by occupation"),
    active: Optional[bool] = Query(None, description="Filter active movements only"),
    db: AsyncSession = Depends(get_db),
):
    """List resistance movements."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    
    query = """
        SELECT r.id, r.name, r.occupation_id, o.name as occupation_name,
            r.founded_date, r.dissolved_date, r.ideology_tags,
            r.armed_wing, r.political_wing, r.description, r.progressive_analysis
        FROM resistance_movements r
        LEFT JOIN occupations o ON r.occupation_id = o.id
        WHERE 1=1
    """
    params = {}
    
    if occupation_id:
        query += " AND r.occupation_id = :occupation_id"
        params["occupation_id"] = str(occupation_id)
    
    if active:
        query += " AND r.dissolved_date IS NULL"
    
    query += " ORDER BY r.founded_date DESC"
    
    result = await db.execute(text(query), params)
    rows = result.fetchall()
    
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "occupation_id": str(r.occupation_id) if r.occupation_id else None,
            "occupation_name": r.occupation_name,
            "founded_date": r.founded_date.isoformat() if r.founded_date else None,
            "dissolved_date": r.dissolved_date.isoformat() if r.dissolved_date else None,
            "ideology_tags": r.ideology_tags or [],
            "armed_wing": r.armed_wing,
            "political_wing": r.political_wing,
            "description": r.description,
            "progressive_analysis": r.progressive_analysis,
        }
        for r in rows
    ]


@router.get("/palestine/nakba-villages/geojson")
async def get_nakba_villages_geojson(
    response: Response,
    district: Optional[str] = Query(None, description="Filter by district"),
    db: AsyncSession = Depends(get_db),
):
    """Get Nakba villages as GeoJSON for map visualization."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, name_arabic, name_english, district, sub_district,
            population_1945, land_area_dunams, depopulation_date, depopulation_cause,
            current_status, israeli_locality_on_lands, refugees_displaced,
            massacre_occurred, massacre_deaths, ST_AsGeoJSON(geometry)::json as geometry
        FROM nakba_villages WHERE geometry IS NOT NULL
    """
    params = {}
    
    if district:
        query += " AND district = :district"
        params["district"] = district
    
    query += " ORDER BY population_1945 DESC NULLS LAST"
    
    result = await db.execute(text(query), params)
    rows = result.fetchall()
    
    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id), "name_arabic": r.name_arabic, "name_english": r.name_english,
                    "district": r.district, "sub_district": r.sub_district,
                    "population_1945": r.population_1945, "land_area_dunams": r.land_area_dunams,
                    "depopulation_date": r.depopulation_date.isoformat() if r.depopulation_date else None,
                    "depopulation_cause": r.depopulation_cause, "current_status": r.current_status,
                    "israeli_locality_on_lands": r.israeli_locality_on_lands,
                    "refugees_displaced": r.refugees_displaced, "massacre_occurred": r.massacre_occurred,
                    "massacre_deaths": r.massacre_deaths,
                },
                "geometry": r.geometry,
            })
    
    return {"type": "FeatureCollection", "features": features}


@router.get("/palestine/settlements/geojson")
async def get_settlements_geojson(
    response: Response,
    region: Optional[str] = Query(None, description="Filter by region"),
    db: AsyncSession = Depends(get_db),
):
    """Get Israeli settlements as GeoJSON. All settlements are illegal under international law."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, name_english, name_hebrew, settlement_type, established_year,
            location_region, governorate, population, population_year,
            built_on_village, area_dunams, legal_status, ST_AsGeoJSON(geometry)::json as geometry
        FROM settlements WHERE geometry IS NOT NULL
    """
    params = {}
    
    if region:
        query += " AND location_region = :region"
        params["region"] = region
    
    query += " ORDER BY established_year ASC NULLS LAST"
    
    result = await db.execute(text(query), params)
    rows = result.fetchall()
    
    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id), "name_english": r.name_english, "name_hebrew": r.name_hebrew,
                    "settlement_type": r.settlement_type, "established_year": r.established_year,
                    "location_region": r.location_region, "governorate": r.governorate,
                    "population": r.population, "population_year": r.population_year,
                    "built_on_village": r.built_on_village, "area_dunams": r.area_dunams,
                    "legal_status": r.legal_status,
                },
                "geometry": r.geometry,
            })
    
    return {"type": "FeatureCollection", "features": features}


@router.get("/palestine/checkpoints/geojson")
async def get_checkpoints_geojson(
    response: Response,
    governorate: Optional[str] = Query(None, description="Filter by governorate"),
    db: AsyncSession = Depends(get_db),
):
    """Get checkpoints as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, name, checkpoint_type, governorate, restrictions,
            ST_AsGeoJSON(geometry)::json as geometry
        FROM checkpoints WHERE geometry IS NOT NULL
    """
    params = {}
    
    if governorate:
        query += " AND governorate = :governorate"
        params["governorate"] = governorate
    
    result = await db.execute(text(query), params)
    rows = result.fetchall()
    
    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id), "name": r.name, "checkpoint_type": r.checkpoint_type,
                    "governorate": r.governorate, "restrictions": r.restrictions,
                },
                "geometry": r.geometry,
            })
    
    return {"type": "FeatureCollection", "features": features}


@router.get("/palestine/separation-wall/geojson")
async def get_separation_wall_geojson(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get separation wall segments as GeoJSON. The wall was ruled illegal by the ICJ in 2004."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, segment_name, construction_start, construction_end, length_km,
            wall_type, land_isolated_dunams, icj_ruling_2004, ST_AsGeoJSON(geometry)::json as geometry
        FROM separation_wall WHERE geometry IS NOT NULL
        ORDER BY construction_start ASC NULLS LAST
    """
    
    result = await db.execute(text(query))
    rows = result.fetchall()
    
    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id), "segment_name": r.segment_name,
                    "construction_start": r.construction_start.isoformat() if r.construction_start else None,
                    "construction_end": r.construction_end.isoformat() if r.construction_end else None,
                    "length_km": float(r.length_km) if r.length_km else None,
                    "wall_type": r.wall_type, "land_isolated_dunams": r.land_isolated_dunams,
                    "icj_ruling_2004": r.icj_ruling_2004,
                },
                "geometry": r.geometry,
            })
    
    return {"type": "FeatureCollection", "features": features}


@router.get("/palestine/massacres/geojson")
async def get_massacres_geojson(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get documented massacres as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, name, date, location, palestinian_deaths, description, perpetrator,
            ST_AsGeoJSON(geometry)::json as geometry
        FROM massacres WHERE geometry IS NOT NULL
        ORDER BY date ASC NULLS LAST
    """
    
    result = await db.execute(text(query))
    rows = result.fetchall()
    
    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id), "name": r.name,
                    "date": r.date.isoformat() if r.date else None,
                    "location": r.location, "palestinian_deaths": r.palestinian_deaths,
                    "description": r.description, "perpetrator": r.perpetrator,
                },
                "geometry": r.geometry,
            })
    
    return {"type": "FeatureCollection", "features": features}


@router.get("/palestine/summary")
async def get_palestine_summary(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get summary statistics for Palestine data."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    
    stats = {}
    
    result = await db.execute(text("""
        SELECT COUNT(*) as count, SUM(population_1945) as total_population,
            SUM(refugees_displaced) as total_displaced,
            SUM(CASE WHEN massacre_occurred THEN 1 ELSE 0 END) as villages_with_massacres
        FROM nakba_villages
    """))
    r = result.fetchone()
    stats["nakba_villages"] = {
        "count": r.count, "total_population_1945": r.total_population,
        "total_refugees_displaced": r.total_displaced, "villages_with_massacres": r.villages_with_massacres,
    }
    
    result = await db.execute(text("""
        SELECT COUNT(*) as count, SUM(population) as total_population,
            MIN(established_year) as earliest, MAX(established_year) as latest
        FROM settlements
    """))
    r = result.fetchone()
    stats["settlements"] = {
        "count": r.count, "total_population": r.total_population,
        "earliest_year": r.earliest, "latest_year": r.latest,
    }
    
    result = await db.execute(text("SELECT COUNT(*) as count FROM checkpoints"))
    r = result.fetchone()
    stats["checkpoints"] = {"count": r.count}
    
    result = await db.execute(text("""
        SELECT COUNT(*) as segments, SUM(length_km) as total_length, SUM(land_isolated_dunams) as land_isolated
        FROM separation_wall
    """))
    r = result.fetchone()
    stats["separation_wall"] = {
        "segments": r.segments,
        "total_length_km": float(r.total_length) if r.total_length else None,
        "land_isolated_dunams": r.land_isolated,
    }
    
    result = await db.execute(text("""
        SELECT COUNT(*) as count, SUM(palestinian_deaths) as total_deaths FROM massacres
    """))
    r = result.fetchone()
    stats["massacres"] = {"count": r.count, "total_deaths": r.total_deaths}
    
    return stats


@router.get("/ireland/troubles/geojson")
async def get_troubles_events_geojson(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get Troubles events as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, name, date, location_name, event_type, perpetrator, perpetrator_side,
            civilian_deaths, total_deaths, collusion_documented, description,
            ST_AsGeoJSON(geometry)::json as geometry
        FROM troubles_events WHERE geometry IS NOT NULL
        ORDER BY date ASC NULLS LAST
    """
    
    result = await db.execute(text(query))
    rows = result.fetchall()
    
    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id), "name": r.name,
                    "date": r.date.isoformat() if r.date else None,
                    "location_name": r.location_name, "category": r.event_type,
                    "perpetrator": r.perpetrator, "perpetrator_side": r.perpetrator_side,
                    "civilian_deaths": r.civilian_deaths, "total_deaths": r.total_deaths,
                    "collusion_documented": r.collusion_documented, "description": r.description,
                },
                "geometry": r.geometry,
            })
    
    return {"type": "FeatureCollection", "features": features}


@router.get("/ireland/famine")
async def get_famine_data(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get Irish Famine data by county."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    
    query = """
        SELECT id, county, province, population_1841, population_1851,
            population_decline_percent, estimated_deaths, estimated_emigration,
            evictions, workhouse_deaths, lat, lon, description, progressive_analysis
        FROM famine_data ORDER BY population_decline_percent DESC NULLS LAST
    """
    
    result = await db.execute(text(query))
    rows = result.fetchall()
    
    return [
        {
            "id": str(r.id), "county": r.county, "province": r.province,
            "population_1841": r.population_1841, "population_1851": r.population_1851,
            "population_decline_percent": float(r.population_decline_percent) if r.population_decline_percent else None,
            "estimated_deaths": r.estimated_deaths, "estimated_emigration": r.estimated_emigration,
            "evictions": r.evictions, "workhouse_deaths": r.workhouse_deaths,
            "lat": float(r.lat) if r.lat else None, "lon": float(r.lon) if r.lon else None,
            "description": r.description, "progressive_analysis": r.progressive_analysis,
        }
        for r in rows
    ]


# ==========================================
# KASHMIR - Indian Occupation
# ==========================================

@router.get("/kashmir/events/geojson")
async def get_kashmir_events_geojson(
    response: Response,
    event_type: Optional[str] = Query(None, description="Filter by type: military_installation, checkpoint, massacre, mass_grave"),
    db: AsyncSession = Depends(get_db),
):
    """Get Kashmir occupation data as GeoJSON from historical events."""
    response.headers["Cache-Control"] = "public, max-age=86400"

    query = """
        SELECT he.id, he.title, he.description, he.start_date, he.category,
            he.progressive_analysis, ST_AsGeoJSON(he.location)::json as geometry
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en = 'India'
        AND he.category IN ('military_installation', 'checkpoint', 'massacre', 'mass_grave', 'kashmir_history')
        AND he.location IS NOT NULL
    """
    params = {}

    if event_type:
        query += " AND he.category = :event_type"
        params["event_type"] = event_type

    query += " ORDER BY he.start_date ASC NULLS LAST"

    result = await db.execute(text(query), params)
    rows = result.fetchall()

    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id),
                    "name": r.title,
                    "description": r.description,
                    "date": r.start_date.isoformat() if r.start_date else None,
                    "category": r.category,
                    "progressive_analysis": r.progressive_analysis,
                },
                "geometry": r.geometry,
            })

    return {"type": "FeatureCollection", "features": features}


@router.get("/kashmir/summary")
async def get_kashmir_summary(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get summary statistics for Kashmir occupation data."""
    response.headers["Cache-Control"] = "public, max-age=3600"

    stats = {}

    query = """
        SELECT he.category, COUNT(*) as count
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en = 'India'
        AND he.category IN ('military_installation', 'checkpoint', 'massacre', 'mass_grave', 'kashmir_history')
        GROUP BY he.category
    """
    result = await db.execute(text(query))
    for r in result.fetchall():
        stats[r.category] = {"count": r.count}

    return stats


# ==========================================
# TIBET - Chinese Occupation
# ==========================================

@router.get("/tibet/events/geojson")
async def get_tibet_events_geojson(
    response: Response,
    event_type: Optional[str] = Query(None, description="Filter by type: destroyed_monastery, military_installation, self_immolation, massacre, political_imprisonment, settler_colonialism"),
    db: AsyncSession = Depends(get_db),
):
    """Get Tibet occupation data as GeoJSON from historical events."""
    response.headers["Cache-Control"] = "public, max-age=86400"

    query = """
        SELECT he.id, he.title, he.description, he.start_date, he.category,
            he.progressive_analysis, ST_AsGeoJSON(he.location)::json as geometry
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en = 'China'
        AND he.category IN ('monastery_destruction', 'self_immolation', 'political_prisoner', 'political', 'military', 
                              'massacre', 'political_prisoner', 'settler_colonialism', 'tibet_history')
        AND he.location IS NOT NULL
    """
    params = {}

    if event_type:
        query += " AND he.category = :event_type"
        params["event_type"] = event_type

    query += " ORDER BY he.start_date ASC NULLS LAST"

    result = await db.execute(text(query), params)
    rows = result.fetchall()

    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id),
                    "name": r.title,
                    "description": r.description,
                    "date": r.start_date.isoformat() if r.start_date else None,
                    "category": r.category,
                    "progressive_analysis": r.progressive_analysis,
                },
                "geometry": r.geometry,
            })

    return {"type": "FeatureCollection", "features": features}


@router.get("/tibet/summary")
async def get_tibet_summary(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get summary statistics for Tibet occupation data."""
    response.headers["Cache-Control"] = "public, max-age=3600"

    stats = {}

    query = """
        SELECT he.category, COUNT(*) as count
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en = 'China'
        AND he.category IN ('monastery_destruction', 'self_immolation', 'political_prisoner', 'political', 'military', 
                              'massacre', 'political_prisoner', 'settler_colonialism', 'tibet_history')
        GROUP BY he.category
    """
    result = await db.execute(text(query))
    for r in result.fetchall():
        stats[r.category] = {"count": r.count}

    return stats


# ==========================================
# KURDISTAN - Multi-state Oppression (Turkey focus)
# ==========================================

@router.get("/kurdistan/events/geojson")
async def get_kurdistan_events_geojson(
    response: Response,
    event_type: Optional[str] = Query(None, description="Filter by type: destroyed_village, military_installation, dam_project, massacre, political_imprisonment"),
    db: AsyncSession = Depends(get_db),
):
    """Get Kurdistan occupation/oppression data as GeoJSON from historical events."""
    response.headers["Cache-Control"] = "public, max-age=86400"

    query = """
        SELECT he.id, he.title, he.description, he.start_date, he.category,
            he.progressive_analysis, ST_AsGeoJSON(he.location)::json as geometry
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en LIKE 'Turkey%'
        AND he.category IN ('destroyed_village', 'military_installation', 'dam_project', 
                              'massacre', 'political_prisoner', 'kurdistan_history', 'cultural_suppression')
        AND he.location IS NOT NULL
    """
    params = {}

    if event_type:
        query += " AND he.category = :event_type"
        params["event_type"] = event_type

    query += " ORDER BY he.start_date ASC NULLS LAST"

    result = await db.execute(text(query), params)
    rows = result.fetchall()

    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id),
                    "name": r.title,
                    "description": r.description,
                    "date": r.start_date.isoformat() if r.start_date else None,
                    "category": r.category,
                    "progressive_analysis": r.progressive_analysis,
                },
                "geometry": r.geometry,
            })

    return {"type": "FeatureCollection", "features": features}


@router.get("/kurdistan/summary")
async def get_kurdistan_summary(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get summary statistics for Kurdistan data."""
    response.headers["Cache-Control"] = "public, max-age=3600"

    stats = {}

    query = """
        SELECT he.category, COUNT(*) as count
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en LIKE 'Turkey%'
        AND he.category IN ('destroyed_village', 'military_installation', 'dam_project', 
                              'massacre', 'political_prisoner', 'kurdistan_history', 'cultural_suppression')
        GROUP BY he.category
    """
    result = await db.execute(text(query))
    for r in result.fetchall():
        stats[r.category] = {"count": r.count}

    return stats


# ==========================================
# WESTERN SAHARA - Moroccan Occupation
# ==========================================

@router.get("/western-sahara/events/geojson")
async def get_western_sahara_events_geojson(
    response: Response,
    event_type: Optional[str] = Query(None, description="Filter by type: sand_berm, settlement, military_installation, mine_field, refugee_camp"),
    db: AsyncSession = Depends(get_db),
):
    """Get Western Sahara occupation data as GeoJSON from historical events."""
    response.headers["Cache-Control"] = "public, max-age=86400"

    query = """
        SELECT he.id, he.title, he.description, he.start_date, he.category,
            he.progressive_analysis, ST_AsGeoJSON(he.location)::json as geometry
        FROM events he
        LEFT JOIN countries c ON he.primary_country_id = c.id
        WHERE (c.name_en = 'Morocco' OR c.name_en = 'Western Sahara' OR he.title ILIKE '%Western Sahara%' OR he.title ILIKE '%Sahrawi%')
        AND he.category IN ('sand_berm', 'settlement', 'military_installation', 'mine_field', 
                              'refugee_camp', 'western_sahara_history', 'resource_extraction')
        AND he.location IS NOT NULL
    """
    params = {}

    if event_type:
        query += " AND he.category = :event_type"
        params["event_type"] = event_type

    query += " ORDER BY he.start_date ASC NULLS LAST"

    result = await db.execute(text(query), params)
    rows = result.fetchall()

    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id),
                    "name": r.title,
                    "description": r.description,
                    "date": r.start_date.isoformat() if r.start_date else None,
                    "category": r.category,
                    "progressive_analysis": r.progressive_analysis,
                },
                "geometry": r.geometry,
            })

    return {"type": "FeatureCollection", "features": features}


@router.get("/western-sahara/summary")
async def get_western_sahara_summary(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get summary statistics for Western Sahara occupation data."""
    response.headers["Cache-Control"] = "public, max-age=3600"

    stats = {}

    query = """
        SELECT he.category, COUNT(*) as count
        FROM events he
        LEFT JOIN countries c ON he.primary_country_id = c.id
        WHERE (c.name_en = 'Morocco' OR c.name_en = 'Western Sahara' OR he.title ILIKE '%Western Sahara%' OR he.title ILIKE '%Sahrawi%')
        AND he.category IN ('sand_berm', 'settlement', 'military_installation', 'mine_field', 
                              'refugee_camp', 'western_sahara_history', 'resource_extraction')
        GROUP BY he.category
    """
    result = await db.execute(text(query))
    for r in result.fetchall():
        stats[r.category] = {"count": r.count}

    return stats


# ==========================================
# WEST PAPUA - Indonesian Occupation
# ==========================================

@router.get("/west-papua/events/geojson")
async def get_west_papua_events_geojson(
    response: Response,
    event_type: Optional[str] = Query(None, description="Filter by type: military_installation, massacre, resource_extraction, transmigration"),
    db: AsyncSession = Depends(get_db),
):
    """Get West Papua occupation data as GeoJSON from historical events."""
    response.headers["Cache-Control"] = "public, max-age=86400"

    query = """
        SELECT he.id, he.title, he.description, he.start_date, he.category,
            he.progressive_analysis, ST_AsGeoJSON(he.location)::json as geometry
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en = 'Indonesia'
        AND he.category IN ('military_installation', 'massacre', 'resource_extraction', 
                              'transmigration', 'west_papua_history')
        AND he.location IS NOT NULL
    """
    params = {}

    if event_type:
        query += " AND he.category = :event_type"
        params["event_type"] = event_type

    query += " ORDER BY he.start_date ASC NULLS LAST"

    result = await db.execute(text(query), params)
    rows = result.fetchall()

    features = []
    for r in rows:
        if r.geometry:
            features.append({
                "type": "Feature",
                "properties": {
                    "id": str(r.id),
                    "name": r.title,
                    "description": r.description,
                    "date": r.start_date.isoformat() if r.start_date else None,
                    "category": r.category,
                    "progressive_analysis": r.progressive_analysis,
                },
                "geometry": r.geometry,
            })

    return {"type": "FeatureCollection", "features": features}


@router.get("/west-papua/summary")
async def get_west_papua_summary(
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Get summary statistics for West Papua occupation data."""
    response.headers["Cache-Control"] = "public, max-age=3600"

    stats = {}

    query = """
        SELECT he.category, COUNT(*) as count
        FROM events he
        JOIN countries c ON he.primary_country_id = c.id
        WHERE c.name_en = 'Indonesia'
        AND he.category IN ('military_installation', 'massacre', 'resource_extraction', 
                              'transmigration', 'west_papua_history')
        GROUP BY he.category
    """
    result = await db.execute(text(query))
    for r in result.fetchall():
        stats[r.category] = {"count": r.count}

    return stats
