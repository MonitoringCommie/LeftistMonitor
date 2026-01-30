"""
Nakba Villages Importer
Imports data about Palestinian villages destroyed during the 1948 Nakba.
"""
import asyncio
from datetime import date
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

NAKBA_VILLAGES = [
    {"name_arabic": "دير ياسين", "name_english": "Deir Yassin", "district": "Jerusalem",
     "population_1945": 400, "land_area_dunams": 2857, "depopulation_date": "1948-04-09",
     "depopulation_cause": "military_assault", "current_status": "Kfar Shaul mental hospital",
     "israeli_locality_on_lands": "Givat Shaul", "lat": 31.7847, "lon": 35.1786,
     "massacre_occurred": True, "massacre_deaths": 107},
    {"name_arabic": "يافا", "name_english": "Jaffa", "district": "Jaffa",
     "population_1945": 70000, "land_area_dunams": 10800, "depopulation_date": "1948-05-13",
     "depopulation_cause": "military_assault", "current_status": "absorbed into Tel Aviv",
     "israeli_locality_on_lands": "Tel Aviv-Yafo", "lat": 32.0522, "lon": 34.7518,
     "massacre_occurred": False, "refugees_displaced": 60000},
    {"name_arabic": "اللد", "name_english": "Lydda", "district": "Ramle",
     "population_1945": 18250, "land_area_dunams": 44775, "depopulation_date": "1948-07-12",
     "depopulation_cause": "expulsion_order", "current_status": "Israeli city of Lod",
     "israeli_locality_on_lands": "Lod", "lat": 31.9515, "lon": 34.8885,
     "massacre_occurred": True, "massacre_deaths": 426, "refugees_displaced": 50000},
    {"name_arabic": "صفورية", "name_english": "Saffuriyya", "district": "Nazareth",
     "population_1945": 4320, "land_area_dunams": 55397, "depopulation_date": "1948-07-16",
     "depopulation_cause": "military_assault", "current_status": "destroyed, Tzipori park",
     "israeli_locality_on_lands": "Tzipori", "lat": 32.7500, "lon": 35.2800,
     "massacre_occurred": False},
    {"name_arabic": "لفتا", "name_english": "Lifta", "district": "Jerusalem",
     "population_1945": 2550, "land_area_dunams": 8296, "depopulation_date": "1948-01-01",
     "depopulation_cause": "military_assault", "current_status": "partially standing",
     "lat": 31.7889, "lon": 35.2028, "massacre_occurred": False},
    {"name_arabic": "عين كارم", "name_english": "Ein Karem", "district": "Jerusalem",
     "population_1945": 3180, "land_area_dunams": 15029, "depopulation_date": "1948-07-14",
     "depopulation_cause": "military_assault", "current_status": "Israeli neighborhood",
     "israeli_locality_on_lands": "Ein Kerem", "lat": 31.7650, "lon": 35.1600,
     "massacre_occurred": False},
    {"name_arabic": "صفد", "name_english": "Safad", "district": "Safad",
     "population_1945": 9530, "land_area_dunams": 2653, "depopulation_date": "1948-05-11",
     "depopulation_cause": "military_assault", "current_status": "Israeli city of Tzfat",
     "israeli_locality_on_lands": "Tzfat", "lat": 32.9658, "lon": 35.4983,
     "massacre_occurred": False, "refugees_displaced": 10000},
    {"name_arabic": "حيفا", "name_english": "Haifa (Arab neighborhoods)", "district": "Haifa",
     "population_1945": 71000, "land_area_dunams": 100000, "depopulation_date": "1948-04-22",
     "depopulation_cause": "military_assault", "current_status": "Israeli city of Haifa",
     "israeli_locality_on_lands": "Haifa", "lat": 32.8191, "lon": 34.9983,
     "massacre_occurred": False, "refugees_displaced": 65000},
    {"name_arabic": "عكا", "name_english": "Acre", "district": "Acre",
     "population_1945": 12360, "land_area_dunams": 13517, "depopulation_date": "1948-05-17",
     "depopulation_cause": "military_assault", "current_status": "Israeli city of Akko",
     "israeli_locality_on_lands": "Akko", "lat": 32.9281, "lon": 35.0756,
     "massacre_occurred": False, "refugees_displaced": 10000},
    {"name_arabic": "الرملة", "name_english": "Ramle", "district": "Ramle",
     "population_1945": 15160, "land_area_dunams": 38983, "depopulation_date": "1948-07-13",
     "depopulation_cause": "expulsion_order", "current_status": "Israeli city of Ramla",
     "israeli_locality_on_lands": "Ramla", "lat": 31.9279, "lon": 34.8622,
     "massacre_occurred": False, "refugees_displaced": 40000},
    {"name_arabic": "المجدل", "name_english": "al-Majdal (Ashkelon)", "district": "Gaza",
     "population_1945": 10900, "land_area_dunams": 43680, "depopulation_date": "1950-10-21",
     "depopulation_cause": "expulsion_order", "current_status": "Israeli city of Ashkelon",
     "israeli_locality_on_lands": "Ashkelon", "lat": 31.6689, "lon": 34.5743,
     "massacre_occurred": False, "refugees_displaced": 11000},
    {"name_arabic": "طبريا", "name_english": "Tiberias", "district": "Tiberias",
     "population_1945": 5770, "land_area_dunams": 14028, "depopulation_date": "1948-04-18",
     "depopulation_cause": "military_assault", "current_status": "Israeli city of Tiberias",
     "israeli_locality_on_lands": "Tverya", "lat": 32.7958, "lon": 35.5308,
     "massacre_occurred": False},
    {"name_arabic": "بيسان", "name_english": "Beisan", "district": "Beisan",
     "population_1945": 5180, "land_area_dunams": 28322, "depopulation_date": "1948-05-12",
     "depopulation_cause": "military_assault", "current_status": "Israeli city of Beit Shean",
     "israeli_locality_on_lands": "Beit Shean", "lat": 32.5004, "lon": 35.4967,
     "massacre_occurred": False},
    {"name_arabic": "بئر السبع", "name_english": "Beersheba", "district": "Beersheba",
     "population_1945": 5570, "land_area_dunams": 81000, "depopulation_date": "1948-10-21",
     "depopulation_cause": "military_assault", "current_status": "Israeli city of Beersheva",
     "israeli_locality_on_lands": "Beersheva", "lat": 31.2518, "lon": 34.7915,
     "massacre_occurred": False},
    {"name_arabic": "الطنطورة", "name_english": "Tantura", "district": "Haifa",
     "population_1945": 1490, "land_area_dunams": 14624, "depopulation_date": "1948-05-22",
     "depopulation_cause": "military_assault", "current_status": "Dor beach resort",
     "israeli_locality_on_lands": "Dor", "lat": 32.6186, "lon": 34.9006,
     "massacre_occurred": True, "massacre_deaths": 200},
]


class NakbaVillagesImporter:
    async def run(self):
        async with async_session_maker() as session:
            imported = 0
            for v in NAKBA_VILLAGES:
                try:
                    existing = await session.execute(
                        text("SELECT id FROM nakba_villages WHERE name_arabic = :name"),
                        {"name": v["name_arabic"]}
                    )
                    if existing.first():
                        continue
                    
                    geom = f"SRID=4326;POINT({v['lon']} {v['lat']})" if v.get("lat") else None
                    dep_date = date.fromisoformat(v["depopulation_date"]) if v.get("depopulation_date") else None
                    
                    await session.execute(
                        text("""
                            INSERT INTO nakba_villages (
                                id, name_arabic, name_english, district, population_1945,
                                land_area_dunams, depopulation_date, depopulation_cause,
                                current_status, israeli_locality_on_lands, geometry,
                                refugees_displaced, massacre_occurred, massacre_deaths, sources
                            ) VALUES (
                                :id, :name_arabic, :name_english, :district, :population_1945,
                                :land_area_dunams, :depopulation_date, :depopulation_cause,
                                :current_status, :israeli_locality_on_lands,
                                ST_GeomFromEWKT(:geometry), :refugees_displaced,
                                :massacre_occurred, :massacre_deaths, :sources
                            )
                        """),
                        {
                            "id": str(uuid4()),
                            "name_arabic": v["name_arabic"],
                            "name_english": v.get("name_english"),
                            "district": v.get("district"),
                            "population_1945": v.get("population_1945"),
                            "land_area_dunams": v.get("land_area_dunams"),
                            "depopulation_date": dep_date,
                            "depopulation_cause": v.get("depopulation_cause"),
                            "current_status": v.get("current_status"),
                            "israeli_locality_on_lands": v.get("israeli_locality_on_lands"),
                            "geometry": geom,
                            "refugees_displaced": v.get("refugees_displaced"),
                            "massacre_occurred": v.get("massacre_occurred", False),
                            "massacre_deaths": v.get("massacre_deaths"),
                            "sources": ["Walid Khalidi - All That Remains", "Zochrot", "Palestine Remembered"],
                        }
                    )
                    imported += 1
                except Exception as e:
                    print(f"Error importing {v.get('name_english')}: {e}")
            
            await session.commit()
            print(f"Imported {imported} Nakba villages")
            return imported


async def main():
    importer = NakbaVillagesImporter()
    await importer.run()

if __name__ == "__main__":
    asyncio.run(main())
