"""
Comprehensive Israeli Settlements Importer
All settlements are illegal under international law (4th Geneva Convention, Art. 49).

Data sources: Peace Now, B'Tselem, ARIJ, Israeli CBS
"""
import asyncio
import json
from pathlib import Path
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker


def load_settlements():
    """Load settlement data from JSON file."""
    json_path = Path(__file__).parent / "settlements_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class SettlementsComprehensiveImporter:
    """
    Comprehensive importer for Israeli settlements in occupied territories.
    All settlements are illegal under Article 49 of the Fourth Geneva Convention.
    """
    
    async def run(self):
        settlements = load_settlements()
        
        async with async_session_maker() as session:
            imported = 0
            updated = 0
            
            for s in settlements:
                try:
                    existing = await session.execute(
                        text("SELECT id FROM settlements WHERE name_english = :name"),
                        {"name": s["name_english"]}
                    )
                    existing_row = existing.first()
                    
                    # Create point geometry
                    geom = None
                    if s.get("lat") and s.get("lon"):
                        geom = f"SRID=4326;POINT({s['lon']} {s['lat']})"
                    
                    if existing_row:
                        # Update existing
                        await session.execute(
                            text("""
                                UPDATE settlements SET
                                    name_hebrew = :name_hebrew,
                                    settlement_type = :settlement_type,
                                    established_year = :established_year,
                                    location_region = :location_region,
                                    governorate = :governorate,
                                    population = :population,
                                    area_dunams = :area_dunams,
                                    legal_status = :legal_status
                                WHERE id = :id
                            """),
                            {
                                "id": str(existing_row[0]),
                                "name_hebrew": s.get("name_hebrew"),
                                "settlement_type": s.get("settlement_type"),
                                "established_year": s.get("established_year"),
                                "location_region": s.get("location_region"),
                                "governorate": s.get("governorate"),
                                "population": s.get("population"),
                                "area_dunams": s.get("area_dunams"),
                                "legal_status": "illegal",
                            }
                        )
                        updated += 1
                    else:
                        # Insert new
                        await session.execute(
                            text("""
                                INSERT INTO settlements (
                                    id, name_english, name_hebrew, settlement_type,
                                    established_year, location_region, governorate,
                                    population, area_dunams, legal_status, sources
                                ) VALUES (
                                    :id, :name_english, :name_hebrew, :settlement_type,
                                    :established_year, :location_region, :governorate,
                                    :population, :area_dunams, :legal_status, :sources
                                )
                            """),
                            {
                                "id": str(uuid4()),
                                "name_english": s["name_english"],
                                "name_hebrew": s.get("name_hebrew"),
                                "settlement_type": s.get("settlement_type"),
                                "established_year": s.get("established_year"),
                                "location_region": s.get("location_region"),
                                "governorate": s.get("governorate"),
                                "population": s.get("population"),
                                "area_dunams": s.get("area_dunams"),
                                "legal_status": "illegal",
                                "sources": ["Peace Now", "B\'Tselem", "ARIJ"],
                            }
                        )
                        imported += 1
                        
                except Exception as e:
                    print(f"Error importing {s.get('name_english')}: {e}")
                    continue
            
            await session.commit()
            print(f"Settlements import: {imported} new, {updated} updated (all illegal under international law)")
            return {"imported": imported, "updated": updated}


async def main():
    importer = SettlementsComprehensiveImporter()
    result = await importer.run()
    print(f"Total: {result['imported']} imported, {result['updated']} updated")


if __name__ == "__main__":
    asyncio.run(main())
