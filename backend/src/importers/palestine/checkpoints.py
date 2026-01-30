"""
Checkpoints Importer - Fixed for actual schema
"""
import asyncio
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

CHECKPOINTS = [
    {"name": "Qalandia Checkpoint", "checkpoint_type": "terminal", "governorate": "Jerusalem",
     "lat": 31.8631, "lon": 35.2236, "restrictions": "Full terminal with biometric scanning, long waits, permit required"},
    {"name": "Checkpoint 300 (Bethlehem)", "checkpoint_type": "terminal", "governorate": "Bethlehem",
     "lat": 31.7167, "lon": 35.2097, "restrictions": "Terminal checkpoint, long processing times, permit required"},
    {"name": "Huwwara Checkpoint", "checkpoint_type": "permanent", "governorate": "Nablus",
     "lat": 32.1489, "lon": 35.2622, "restrictions": "ID checks, vehicle searches, frequent closures"},
    {"name": "Container Checkpoint", "checkpoint_type": "permanent", "governorate": "Jerusalem",
     "lat": 31.7303, "lon": 35.2797, "restrictions": "Divides West Bank, checks all traffic"},
    {"name": "Za'tara (Tapuah) Checkpoint", "checkpoint_type": "permanent", "governorate": "Nablus",
     "lat": 32.1017, "lon": 35.2397, "restrictions": "ID checks, vehicle searches"},
    {"name": "DCO Checkpoint (Beit El)", "checkpoint_type": "permanent", "governorate": "Ramallah",
     "lat": 31.9447, "lon": 35.2336, "restrictions": "Permit coordination, bureaucratic control point"},
    {"name": "Jit Checkpoint", "checkpoint_type": "permanent", "governorate": "Qalqilya",
     "lat": 32.1744, "lon": 35.1083, "restrictions": "Controls access to Qalqilya area"},
    {"name": "Ennab Checkpoint", "checkpoint_type": "permanent", "governorate": "Tulkarm",
     "lat": 32.3131, "lon": 35.0986, "restrictions": "ID checks, controls Tulkarm access"},
    {"name": "Checkpoint 56 (Shuhada Street)", "checkpoint_type": "permanent", "governorate": "Hebron",
     "lat": 31.5247, "lon": 35.1103, "restrictions": "Palestinians banned from Shuhada Street"},
    {"name": "Gilbert Checkpoint", "checkpoint_type": "permanent", "governorate": "Hebron",
     "lat": 31.5239, "lon": 35.1117, "restrictions": "Turnstiles, ID checks for Palestinians only"},
    {"name": "Ibrahimi Mosque Checkpoint", "checkpoint_type": "permanent", "governorate": "Hebron",
     "lat": 31.5244, "lon": 35.1108, "restrictions": "Segregated access, Palestinians heavily restricted"},
    {"name": "A-Ram Checkpoint", "checkpoint_type": "permanent", "governorate": "Jerusalem",
     "lat": 31.8522, "lon": 35.2261, "restrictions": "Separates A-Ram from Jerusalem"},
    {"name": "Shu'fat Checkpoint", "checkpoint_type": "permanent", "governorate": "Jerusalem",
     "lat": 31.8106, "lon": 35.2342, "restrictions": "Controls camp access, severe crowding"},
    {"name": "Hamra Checkpoint", "checkpoint_type": "permanent", "governorate": "Jordan Valley",
     "lat": 32.1383, "lon": 35.4661, "restrictions": "Controls access to Jordan Valley"},
    {"name": "Tayasir Checkpoint", "checkpoint_type": "permanent", "governorate": "Jordan Valley",
     "lat": 32.2758, "lon": 35.4389, "restrictions": "Controls access, agricultural restrictions"},
    {"name": "Ras Atiya Gate", "checkpoint_type": "agricultural_gate", "governorate": "Qalqilya",
     "lat": 32.1564, "lon": 35.0278, "restrictions": "Permit required, seasonal opening"},
    {"name": "Falamya Gate", "checkpoint_type": "agricultural_gate", "governorate": "Qalqilya",
     "lat": 32.1833, "lon": 35.0167, "restrictions": "Special permit, irregular opening"},
    {"name": "Jayyus Gates", "checkpoint_type": "agricultural_gate", "governorate": "Qalqilya",
     "lat": 32.1897, "lon": 35.0356, "restrictions": "3 times daily, 15-45 minutes each"},
]


class CheckpointsImporter:
    async def run(self):
        async with async_session_maker() as session:
            imported = 0
            for cp in CHECKPOINTS:
                try:
                    existing = await session.execute(
                        text("SELECT id FROM checkpoints WHERE name = :name"),
                        {"name": cp["name"]}
                    )
                    if existing.first():
                        continue

                    geom = f"SRID=4326;POINT({cp['lon']} {cp['lat']})" if cp.get("lat") else None

                    await session.execute(
                        text("""
                            INSERT INTO checkpoints (id, name, checkpoint_type, governorate, geometry, restrictions)
                            VALUES (:id, :name, :checkpoint_type, :governorate, ST_GeomFromEWKT(:geometry), :restrictions)
                        """),
                        {
                            "id": str(uuid4()),
                            "name": cp["name"],
                            "checkpoint_type": cp.get("checkpoint_type"),
                            "governorate": cp.get("governorate"),
                            "geometry": geom,
                            "restrictions": cp.get("restrictions"),
                        }
                    )
                    imported += 1
                except Exception as e:
                    print(f"Error importing {cp.get('name')}: {e}")
                    await session.rollback()

            await session.commit()
            print(f"Imported {imported} checkpoints")
            return imported


async def main():
    importer = CheckpointsImporter()
    await importer.run()

if __name__ == "__main__":
    asyncio.run(main())
