"""
Comprehensive Checkpoints Importer - Israeli Checkpoints in Occupied Palestine

Reads checkpoint data from checkpoints_data.json and imports to database.

Data sources:
- UN OCHA: Closure maps and checkpoint lists
- B'Tselem: Movement restriction documentation
- Machsom Watch: Checkpoint monitoring reports
- Applied Research Institute Jerusalem (ARIJ)

Checkpoint types:
- terminal: Major crossing terminals
- permanent: Staffed permanent checkpoints
- partial: Partially staffed or irregular hours
- agricultural_gate: Gates through separation wall
- flying: Random/temporary checkpoints
- roadblock: Physical barriers (earth mounds, concrete)
- observation_tower: Towers monitoring movement
"""
import asyncio
import json
from pathlib import Path
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker


def load_checkpoints():
    """Load checkpoint data from JSON file."""
    json_path = Path(__file__).parent / "checkpoints_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class CheckpointsComprehensiveImporter:
    """
    Comprehensive importer for Israeli checkpoints in occupied Palestine.
    """
    
    async def run(self):
        checkpoints = load_checkpoints()
        
        async with async_session_maker() as session:
            imported = 0
            updated = 0
            
            for cp in checkpoints:
                try:
                    # Check if exists
                    existing = await session.execute(
                        text("SELECT id FROM checkpoints WHERE name = :name"),
                        {"name": cp["name"]}
                    )
                    existing_row = existing.first()
                    
                    # Create geometry point
                    geom = None
                    if cp.get("lat") and cp.get("lon"):
                        geom = f"SRID=4326;POINT({cp['lon']} {cp['lat']})"
                    
                    if existing_row:
                        # Update existing
                        await session.execute(
                            text("""
                                UPDATE checkpoints SET
                                    name_arabic = :name_arabic,
                                    checkpoint_type = :checkpoint_type,
                                    governorate = :governorate,
                                    geometry = ST_GeomFromEWKT(:geometry),
                                    restrictions = :restrictions,
                                    established = :established,
                                    infrastructure = :infrastructure
                                WHERE id = :id
                            """),
                            {
                                "id": str(existing_row[0]),
                                "name_arabic": cp.get("name_arabic"),
                                "checkpoint_type": cp.get("checkpoint_type"),
                                "governorate": cp.get("governorate"),
                                "geometry": geom,
                                "restrictions": cp.get("restrictions"),
                                "established": cp.get("established"),
                                "infrastructure": cp.get("infrastructure"),
                            }
                        )
                        updated += 1
                    else:
                        # Insert new
                        await session.execute(
                            text("""
                                INSERT INTO checkpoints (
                                    id, name, name_arabic, checkpoint_type, governorate, 
                                    geometry, restrictions, established, infrastructure
                                )
                                VALUES (
                                    :id, :name, :name_arabic, :checkpoint_type, :governorate,
                                    ST_GeomFromEWKT(:geometry), :restrictions, :established, :infrastructure
                                )
                            """),
                            {
                                "id": str(uuid4()),
                                "name": cp["name"],
                                "name_arabic": cp.get("name_arabic"),
                                "checkpoint_type": cp.get("checkpoint_type"),
                                "governorate": cp.get("governorate"),
                                "geometry": geom,
                                "restrictions": cp.get("restrictions"),
                                "established": cp.get("established"),
                                "infrastructure": cp.get("infrastructure"),
                            }
                        )
                        imported += 1
                        
                except Exception as e:
                    print(f"Error importing {cp.get('name')}: {e}")
                    continue
            
            await session.commit()
            print(f"Checkpoints import: {imported} new, {updated} updated")
            return {"imported": imported, "updated": updated}


async def main():
    importer = CheckpointsComprehensiveImporter()
    result = await importer.run()
    print(f"Total: {result['imported']} imported, {result['updated']} updated")


if __name__ == "__main__":
    asyncio.run(main())
