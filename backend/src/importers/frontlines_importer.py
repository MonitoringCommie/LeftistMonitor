"""Import frontline data from various sources."""
import asyncio
import json
import uuid
from datetime import date, datetime
from pathlib import Path

import geopandas as gpd
from shapely.geometry import mapping
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.database import async_session_maker
from src.events.models import Conflict


# Color scheme for different sides
SIDE_COLORS = {
    "allies": "#3B82F6",      # Blue
    "axis": "#DC2626",        # Red  
    "russia": "#DC2626",      # Red
    "ukraine": "#FBBF24",     # Yellow
    "republicans": "#DC2626", # Red (Spanish Civil War)
    "nationalists": "#1E3A8A", # Dark Blue (Spanish Civil War)
    "north_korea": "#DC2626", # Red
    "south_korea": "#3B82F6", # Blue
    "un_forces": "#3B82F6",   # Blue
    "north_vietnam": "#DC2626", # Red
    "south_vietnam": "#3B82F6", # Blue
}


async def get_or_create_conflict(session: AsyncSession, name: str, start_date: date, end_date: date, conflict_type: str) -> uuid.UUID:
    """Get existing conflict or create new one."""
    result = await session.execute(
        select(Conflict).where(Conflict.name == name)
    )
    conflict = result.scalar_one_or_none()
    
    if conflict:
        return conflict.id
    
    conflict_id = uuid.uuid4()
    await session.execute(
        text("""
            INSERT INTO conflicts (id, name, start_date, end_date, conflict_type, intensity)
            VALUES (:id, :name, :start_date, :end_date, :conflict_type, 'major')
        """),
        {
            "id": str(conflict_id),
            "name": name,
            "start_date": start_date,
            "end_date": end_date,
            "conflict_type": conflict_type,
        }
    )
    await session.commit()
    return conflict_id


async def import_ww2_allied_lines():
    """Import WW2 Allied Lines of Control from shapefile."""
    print("Importing WW2 Allied Lines of Control...")
    
    data_path = Path(__file__).parent.parent.parent.parent / "data" / "frontlines" / "allied_lines_of_control" / "allied_lines_of_control.shp"
    
    if not data_path.exists():
        print(f"Data file not found: {data_path}")
        return 0
    
    gdf = gpd.read_file(data_path)
    
    async with async_session_maker() as session:
        # Get or create WW2 conflict
        conflict_id = await get_or_create_conflict(
            session,
            "World War II",
            date(1939, 9, 1),
            date(1945, 9, 2),
            "interstate"
        )
        
        count = 0
        for _, row in gdf.iterrows():
            frontline_date = row['date']
            if isinstance(frontline_date, str):
                frontline_date = datetime.strptime(frontline_date, "%Y-%m-%d").date()
            elif hasattr(frontline_date, 'date'):
                frontline_date = frontline_date.date()
            
            geometry = row.geometry
            geom_json = json.dumps(mapping(geometry))
            geom_type = "polygon" if "Polygon" in geometry.geom_type else "line"
            
            # Check if already exists
            existing = await session.execute(
                text("""
                    SELECT id FROM conflict_frontlines 
                    WHERE conflict_id = :conflict_id AND date = :date AND controlled_by = 'allies'
                """),
                {"conflict_id": str(conflict_id), "date": frontline_date}
            )
            if existing.scalar_one_or_none():
                continue
            
            await session.execute(
                text("""
                    INSERT INTO conflict_frontlines 
                    (id, conflict_id, date, controlled_by, geometry, geometry_type, source, color)
                    VALUES (:id, :conflict_id, :date, :controlled_by, ST_GeomFromGeoJSON(:geometry), :geometry_type, :source, :color)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "conflict_id": str(conflict_id),
                    "date": frontline_date,
                    "controlled_by": "allies",
                    "geometry": geom_json,
                    "geometry_type": geom_type,
                    "source": "Atlas of the World Battle Fronts",
                    "color": SIDE_COLORS["allies"],
                }
            )
            count += 1
        
        await session.commit()
    
    print(f"Imported {count} WW2 frontline snapshots")
    return count


async def import_ukraine_unit_positions():
    """Import Ukraine war unit positions from GeoJSON."""
    print("Importing Ukraine war unit positions...")
    
    data_path = Path(__file__).parent.parent.parent.parent / "data" / "frontlines" / "ukraine_btgs.geojson"
    
    if not data_path.exists():
        print(f"Data file not found: {data_path}")
        return 0
    
    with open(data_path) as f:
        data = json.load(f)
    
    async with async_session_maker() as session:
        # Get or create Ukraine conflict
        conflict_id = await get_or_create_conflict(
            session,
            "Russo-Ukrainian War",
            date(2022, 2, 24),
            None,  # Ongoing
            "interstate"
        )
        
        # Group points by date and country to create approximate front zones
        # We'll store individual unit positions as points
        count = 0
        dates_processed = set()
        
        for feature in data["features"]:
            props = feature["properties"]
            unit_date = datetime.strptime(props["date"], "%Y-%m-%d").date()
            country = props["country"]
            
            # Map country codes to sides
            controlled_by = "russia" if country == "ru" else "ukraine"
            
            # Only import sample of dates to avoid too much data
            date_key = (unit_date, controlled_by)
            
            geometry = feature["geometry"]
            geom_json = json.dumps(geometry)
            
            await session.execute(
                text("""
                    INSERT INTO conflict_frontlines 
                    (id, conflict_id, date, controlled_by, geometry, geometry_type, source, notes, color)
                    VALUES (:id, :conflict_id, :date, :controlled_by, ST_GeomFromGeoJSON(:geometry), :geometry_type, :source, :notes, :color)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "conflict_id": str(conflict_id),
                    "date": unit_date,
                    "controlled_by": controlled_by,
                    "geometry": geom_json,
                    "geometry_type": "point",
                    "source": "UAWarData",
                    "notes": f"Unit: {props.get('unit', 'Unknown')}",
                    "color": SIDE_COLORS[controlled_by],
                }
            )
            count += 1
        
        await session.commit()
    
    print(f"Imported {count} Ukraine unit positions")
    return count


async def import_manual_frontlines():
    """Import manually curated frontline data for other conflicts."""
    print("Importing manual frontline data for historical conflicts...")
    
    # Spanish Civil War - simplified frontlines
    spanish_civil_war_data = [
        {
            "date": "1936-07-20",
            "controlled_by": "nationalists",
            "description": "Initial Nationalist-held territory after coup",
            # Simplified polygon covering Nationalist areas (Galicia, Navarra, parts of Castile)
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # Northern Spain (Galicia, Asturias coast excluded, Navarra)
                    [[[-8.9, 42.0], [-8.9, 43.7], [-5.5, 43.7], [-5.5, 42.8], [-2.0, 42.8], [-2.0, 43.3], [-1.5, 43.3], [-1.5, 42.0], [-8.9, 42.0]]],
                    # Spanish Morocco
                    [[[-5.5, 35.0], [-5.5, 35.9], [-2.0, 35.9], [-2.0, 35.0], [-5.5, 35.0]]],
                ]
            }
        },
        {
            "date": "1937-06-19",
            "controlled_by": "nationalists",
            "description": "After fall of Bilbao",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-8.9, 42.0], [-8.9, 43.7], [-2.0, 43.7], [-2.0, 42.0], [-1.5, 42.0], [-1.5, 38.5], [-5.0, 38.5], [-5.0, 36.0], [-8.9, 36.0], [-8.9, 42.0]]]
            }
        },
        {
            "date": "1938-04-15",
            "controlled_by": "nationalists",
            "description": "After Aragon offensive, Republic split",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-8.9, 36.0], [-8.9, 43.7], [0.5, 43.7], [0.5, 40.5], [-1.0, 40.5], [-1.0, 38.0], [-5.0, 38.0], [-5.0, 36.0], [-8.9, 36.0]]]
            }
        },
        {
            "date": "1939-02-10",
            "controlled_by": "nationalists", 
            "description": "After fall of Catalonia",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[-8.9, 36.0], [-8.9, 43.7], [3.3, 43.7], [3.3, 36.0], [-8.9, 36.0]]]
            }
        },
    ]
    
    # Korean War frontlines
    korean_war_data = [
        {
            "date": "1950-06-25",
            "controlled_by": "north_korea",
            "description": "Initial invasion - 38th parallel",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[124.0, 38.0], [124.0, 43.0], [131.0, 43.0], [131.0, 38.0], [124.0, 38.0]]]
            }
        },
        {
            "date": "1950-09-15",
            "controlled_by": "north_korea",
            "description": "Maximum DPRK advance - Pusan Perimeter",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[124.0, 35.5], [124.0, 43.0], [131.0, 43.0], [131.0, 35.5], [129.0, 35.5], [129.0, 36.0], [128.5, 36.0], [128.5, 35.5], [124.0, 35.5]]]
            }
        },
        {
            "date": "1950-11-24",
            "controlled_by": "un_forces",
            "description": "Maximum UN advance before Chinese intervention",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[124.0, 33.0], [124.0, 40.5], [131.0, 40.5], [131.0, 33.0], [124.0, 33.0]]]
            }
        },
        {
            "date": "1951-01-15",
            "controlled_by": "north_korea",
            "description": "After Chinese offensive",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[124.0, 37.0], [124.0, 43.0], [131.0, 43.0], [131.0, 37.0], [124.0, 37.0]]]
            }
        },
        {
            "date": "1953-07-27",
            "controlled_by": "north_korea",
            "description": "Armistice line",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[124.0, 38.0], [124.0, 43.0], [131.0, 43.0], [131.0, 38.3], [127.0, 38.3], [126.0, 37.8], [124.0, 38.0]]]
            }
        },
    ]
    
    # Vietnam War
    vietnam_war_data = [
        {
            "date": "1965-03-08",
            "controlled_by": "north_vietnam",
            "description": "NLF/North Vietnam controlled areas",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # North Vietnam
                    [[[102.0, 17.0], [102.0, 23.5], [109.5, 23.5], [109.5, 17.0], [102.0, 17.0]]],
                    # NLF areas in South
                    [[[106.0, 9.5], [106.0, 11.0], [107.5, 11.0], [107.5, 9.5], [106.0, 9.5]]],
                ]
            }
        },
        {
            "date": "1968-01-30",
            "controlled_by": "north_vietnam",
            "description": "Tet Offensive - areas attacked",
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    # North Vietnam
                    [[[102.0, 17.0], [102.0, 23.5], [109.5, 23.5], [109.5, 17.0], [102.0, 17.0]]],
                ]
            }
        },
        {
            "date": "1975-04-30",
            "controlled_by": "north_vietnam",
            "description": "Fall of Saigon - complete victory",
            "geometry": {
                "type": "Polygon",
                "coordinates": [[[102.0, 8.5], [102.0, 23.5], [109.5, 23.5], [109.5, 8.5], [102.0, 8.5]]]
            }
        },
    ]
    
    conflicts_data = [
        ("Spanish Civil War", date(1936, 7, 17), date(1939, 4, 1), "civil_war", spanish_civil_war_data),
        ("Korean War", date(1950, 6, 25), date(1953, 7, 27), "interstate", korean_war_data),
        ("Vietnam War", date(1955, 11, 1), date(1975, 4, 30), "civil_war", vietnam_war_data),
    ]
    
    total_count = 0
    
    async with async_session_maker() as session:
        for conflict_name, start, end, conflict_type, frontlines in conflicts_data:
            conflict_id = await get_or_create_conflict(session, conflict_name, start, end, conflict_type)
            
            for fl in frontlines:
                frontline_date = datetime.strptime(fl["date"], "%Y-%m-%d").date()
                controlled_by = fl["controlled_by"]
                
                # Check if already exists
                existing = await session.execute(
                    text("""
                        SELECT id FROM conflict_frontlines 
                        WHERE conflict_id = :conflict_id AND date = :date AND controlled_by = :controlled_by
                    """),
                    {"conflict_id": str(conflict_id), "date": frontline_date, "controlled_by": controlled_by}
                )
                if existing.scalar_one_or_none():
                    continue
                
                await session.execute(
                    text("""
                        INSERT INTO conflict_frontlines 
                        (id, conflict_id, date, controlled_by, geometry, geometry_type, source, notes, color)
                        VALUES (:id, :conflict_id, :date, :controlled_by, ST_GeomFromGeoJSON(:geometry), :geometry_type, :source, :notes, :color)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "conflict_id": str(conflict_id),
                        "date": frontline_date,
                        "controlled_by": controlled_by,
                        "geometry": json.dumps(fl["geometry"]),
                        "geometry_type": "polygon",
                        "source": "Manual curation",
                        "notes": fl.get("description", ""),
                        "color": SIDE_COLORS.get(controlled_by, "#888888"),
                    }
                )
                total_count += 1
            
            print(f"  Imported frontlines for {conflict_name}")
        
        await session.commit()
    
    print(f"Imported {total_count} manual frontline snapshots")
    return total_count


async def main():
    print("=" * 50)
    print("Frontlines Data Importer")
    print("=" * 50)
    
    await import_ww2_allied_lines()
    await import_ukraine_unit_positions()
    await import_manual_frontlines()
    
    print("\nDone!")


if __name__ == "__main__":
    asyncio.run(main())
