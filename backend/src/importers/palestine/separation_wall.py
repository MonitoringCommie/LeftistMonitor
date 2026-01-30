"""
Separation Wall Importer - Fixed for actual schema
"""
import asyncio
from datetime import date
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

WALL_SEGMENTS = [
    {"segment_name": "Northern West Bank - Jenin sector", "construction_start": "2002-06-16",
     "construction_end": "2003-07-31", "length_km": 45.0, "wall_type": "fence_with_barriers",
     "land_isolated_dunams": 35000, "lat_start": 32.4567, "lon_start": 35.2789,
     "lat_end": 32.3456, "lon_end": 35.1234, "source": "OCHA, B'Tselem"},
    {"segment_name": "Tulkarm-Qalqilya sector", "construction_start": "2002-08-01",
     "construction_end": "2004-12-31", "length_km": 56.0, "wall_type": "concrete_wall",
     "land_isolated_dunams": 52000, "lat_start": 32.3456, "lon_start": 35.1234,
     "lat_end": 32.1900, "lon_end": 35.0100, "source": "OCHA, B'Tselem"},
    {"segment_name": "Jerusalem envelope - North", "construction_start": "2003-01-15",
     "construction_end": "2006-06-30", "length_km": 28.0, "wall_type": "concrete_wall",
     "land_isolated_dunams": 45000, "lat_start": 31.8500, "lon_start": 35.2300,
     "lat_end": 31.7800, "lon_end": 35.2500, "source": "OCHA, B'Tselem"},
    {"segment_name": "Jerusalem envelope - South (Abu Dis-Bethlehem)", "construction_start": "2004-02-01",
     "construction_end": "2007-12-31", "length_km": 35.0, "wall_type": "concrete_wall",
     "land_isolated_dunams": 38000, "lat_start": 31.7800, "lon_start": 35.2500,
     "lat_end": 31.7000, "lon_end": 35.2000, "source": "OCHA, B'Tselem"},
    {"segment_name": "Ariel finger", "construction_start": "2005-03-01",
     "construction_end": "2010-12-31", "length_km": 45.0, "wall_type": "fence_with_barriers",
     "land_isolated_dunams": 78000, "lat_start": 32.1000, "lon_start": 35.1500,
     "lat_end": 32.1100, "lon_end": 35.2500, "source": "OCHA, B'Tselem, Peace Now"},
    {"segment_name": "Modi'in Illit sector", "construction_start": "2004-06-01",
     "construction_end": "2008-06-30", "length_km": 32.0, "wall_type": "fence_with_barriers",
     "land_isolated_dunams": 42000, "lat_start": 31.9500, "lon_start": 35.0500,
     "lat_end": 31.9000, "lon_end": 35.1000, "source": "OCHA, B'Tselem"},
    {"segment_name": "Cremisan Valley", "construction_start": "2006-01-01",
     "construction_end": "2015-09-01", "length_km": 12.0, "wall_type": "concrete_wall",
     "land_isolated_dunams": 15000, "lat_start": 31.7200, "lon_start": 35.1600,
     "lat_end": 31.7000, "lon_end": 35.1800, "source": "OCHA, Sabeel"},
    {"segment_name": "Hebron Hills - South", "construction_start": "2007-01-01",
     "construction_end": "2012-12-31", "length_km": 38.0, "wall_type": "fence_with_barriers",
     "land_isolated_dunams": 28000, "lat_start": 31.5000, "lon_start": 35.1000,
     "lat_end": 31.4000, "lon_end": 35.0500, "source": "OCHA, B'Tselem"},
]


class SeparationWallImporter:
    async def run(self):
        async with async_session_maker() as session:
            imported = 0
            for segment in WALL_SEGMENTS:
                try:
                    existing = await session.execute(
                        text("SELECT id FROM separation_wall WHERE segment_name = :name"),
                        {"name": segment["segment_name"]}
                    )
                    if existing.first():
                        continue

                    start_date = date.fromisoformat(segment["construction_start"]) if segment.get("construction_start") else None
                    end_date = date.fromisoformat(segment["construction_end"]) if segment.get("construction_end") else None
                    
                    if segment.get("lat_start") and segment.get("lat_end"):
                        geom = f"SRID=4326;LINESTRING({segment['lon_start']} {segment['lat_start']}, {segment['lon_end']} {segment['lat_end']})"
                    else:
                        geom = None

                    await session.execute(
                        text("""
                            INSERT INTO separation_wall (id, segment_name, construction_start, construction_end,
                                length_km, wall_type, land_isolated_dunams, geometry, icj_ruling_2004, source)
                            VALUES (:id, :segment_name, :construction_start, :construction_end,
                                :length_km, :wall_type, :land_isolated_dunams, ST_GeomFromEWKT(:geometry), :icj_ruling_2004, :source)
                        """),
                        {
                            "id": str(uuid4()),
                            "segment_name": segment["segment_name"],
                            "construction_start": start_date,
                            "construction_end": end_date,
                            "length_km": segment.get("length_km"),
                            "wall_type": segment.get("wall_type"),
                            "land_isolated_dunams": segment.get("land_isolated_dunams"),
                            "geometry": geom,
                            "icj_ruling_2004": True,
                            "source": segment.get("source"),
                        }
                    )
                    imported += 1
                except Exception as e:
                    print(f"Error importing {segment.get('segment_name')}: {e}")
                    await session.rollback()

            await session.commit()
            print(f"Imported {imported} wall segments")
            return imported


async def main():
    importer = SeparationWallImporter()
    await importer.run()

if __name__ == "__main__":
    asyncio.run(main())
