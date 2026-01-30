"""
Israeli Settlements Importer
All settlements are illegal under international law (4th Geneva Convention).
Data sources: Peace Now, B'Tselem, ARIJ
"""
import asyncio
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

# Major Israeli settlements in occupied territories
SETTLEMENTS = [
    # WEST BANK - Major settlement blocs
    {"name_english": "Maale Adumim", "name_hebrew": "מעלה אדומים", 
     "settlement_type": "city", "established_year": 1975, "location_region": "west_bank",
     "governorate": "Jerusalem", "population": 38000, "population_year": 2022,
     "lat": 31.7771, "lon": 35.3100, "area_dunams": 48000,
     "built_on_village": "Khan al-Ahmar area"},
    {"name_english": "Ariel", "name_hebrew": "אריאל",
     "settlement_type": "city", "established_year": 1978, "location_region": "west_bank",
     "governorate": "Salfit", "population": 20000, "population_year": 2022,
     "lat": 32.1056, "lon": 35.1731, "area_dunams": 15000},
    {"name_english": "Modi'in Illit", "name_hebrew": "מודיעין עילית",
     "settlement_type": "city", "established_year": 1996, "location_region": "west_bank",
     "governorate": "Ramallah", "population": 77000, "population_year": 2022,
     "lat": 31.9333, "lon": 35.0500, "area_dunams": 4700},
    {"name_english": "Beitar Illit", "name_hebrew": "ביתר עילית",
     "settlement_type": "city", "established_year": 1985, "location_region": "west_bank",
     "governorate": "Bethlehem", "population": 60000, "population_year": 2022,
     "lat": 31.6950, "lon": 35.1178, "area_dunams": 3000},
    {"name_english": "Gush Etzion", "name_hebrew": "גוש עציון",
     "settlement_type": "bloc", "established_year": 1967, "location_region": "west_bank",
     "governorate": "Bethlehem", "population": 25000, "population_year": 2022,
     "lat": 31.6500, "lon": 35.1167, "area_dunams": 20000},
    {"name_english": "Efrat", "name_hebrew": "אפרת",
     "settlement_type": "settlement", "established_year": 1983, "location_region": "west_bank",
     "governorate": "Bethlehem", "population": 10000, "population_year": 2022,
     "lat": 31.6558, "lon": 35.1497, "area_dunams": 4500},
    
    # EAST JERUSALEM settlements
    {"name_english": "Pisgat Ze'ev", "name_hebrew": "פסגת זאב",
     "settlement_type": "neighborhood", "established_year": 1985, "location_region": "east_jerusalem",
     "governorate": "Jerusalem", "population": 50000, "population_year": 2022,
     "lat": 31.8278, "lon": 35.2417, "area_dunams": 6000},
    {"name_english": "Ramot", "name_hebrew": "רמות",
     "settlement_type": "neighborhood", "established_year": 1973, "location_region": "east_jerusalem",
     "governorate": "Jerusalem", "population": 45000, "population_year": 2022,
     "lat": 31.8100, "lon": 35.1967, "area_dunams": 5500},
    {"name_english": "Neve Ya'akov", "name_hebrew": "נווה יעקב",
     "settlement_type": "neighborhood", "established_year": 1972, "location_region": "east_jerusalem",
     "governorate": "Jerusalem", "population": 25000, "population_year": 2022,
     "lat": 31.8411, "lon": 35.2342, "area_dunams": 2500},
    {"name_english": "Gilo", "name_hebrew": "גילה",
     "settlement_type": "neighborhood", "established_year": 1971, "location_region": "east_jerusalem",
     "governorate": "Jerusalem", "population": 40000, "population_year": 2022,
     "lat": 31.7333, "lon": 35.1833, "area_dunams": 4000},
    {"name_english": "French Hill", "name_hebrew": "גבעת צרפתית",
     "settlement_type": "neighborhood", "established_year": 1969, "location_region": "east_jerusalem",
     "governorate": "Jerusalem", "population": 7000, "population_year": 2022,
     "lat": 31.8014, "lon": 35.2308, "area_dunams": 1000},
    
    # HEBRON area
    {"name_english": "Kiryat Arba", "name_hebrew": "קרית ארבע",
     "settlement_type": "settlement", "established_year": 1968, "location_region": "west_bank",
     "governorate": "Hebron", "population": 8000, "population_year": 2022,
     "lat": 31.5247, "lon": 35.1186, "area_dunams": 4000},
    {"name_english": "Hebron settlements", "name_hebrew": "יישובי חברון",
     "settlement_type": "settlement", "established_year": 1979, "location_region": "west_bank",
     "governorate": "Hebron", "population": 800, "population_year": 2022,
     "lat": 31.5294, "lon": 35.1036, "area_dunams": 500,
     "built_on_village": "Inside Hebron old city"},
    
    # JORDAN VALLEY settlements
    {"name_english": "Mevo'ot Yericho", "name_hebrew": "מבואות יריחו",
     "settlement_type": "regional_council", "established_year": 1975, "location_region": "west_bank",
     "governorate": "Jericho", "population": 2500, "population_year": 2022,
     "lat": 31.8800, "lon": 35.4500, "area_dunams": 50000},
    
    # GOLAN HEIGHTS
    {"name_english": "Katzrin", "name_hebrew": "קצרין",
     "settlement_type": "city", "established_year": 1977, "location_region": "golan",
     "governorate": "Golan Heights", "population": 8000, "population_year": 2022,
     "lat": 32.9939, "lon": 35.6919, "area_dunams": 15000},
]


class SettlementsImporter:
    async def run(self):
        async with async_session_maker() as session:
            imported = 0
            for s in SETTLEMENTS:
                try:
                    existing = await session.execute(
                        text("SELECT id FROM settlements WHERE name_english = :name"),
                        {"name": s["name_english"]}
                    )
                    if existing.first():
                        continue
                    
                    # Create point geometry for now
                    geom = f"SRID=4326;POINT({s['lon']} {s['lat']})" if s.get("lat") else None
                    
                    await session.execute(
                        text("""
                            INSERT INTO settlements (
                                id, name_english, name_hebrew, settlement_type,
                                established_year, location_region, governorate,
                                population, population_year, area_dunams,
                                built_on_village, legal_status, sources
                            ) VALUES (
                                :id, :name_english, :name_hebrew, :settlement_type,
                                :established_year, :location_region, :governorate,
                                :population, :population_year, :area_dunams,
                                :built_on_village, :legal_status, :sources
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
                            "population_year": s.get("population_year"),
                            "area_dunams": s.get("area_dunams"),
                            "built_on_village": s.get("built_on_village"),
                            "legal_status": "illegal",
                            "sources": ["Peace Now", "B'Tselem", "ARIJ"],
                        }
                    )
                    imported += 1
                except Exception as e:
                    print(f"Error importing {s.get('name_english')}: {e}")
            
            await session.commit()
            print(f"Imported {imported} settlements (all illegal under international law)")
            return imported


async def main():
    importer = SettlementsImporter()
    await importer.run()

if __name__ == "__main__":
    asyncio.run(main())
