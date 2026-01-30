"""
Palestinian Massacres Importer
Documents massacres committed against Palestinians from 1948 to present.
Data sources: B'Tselem, Al-Haq, PCHR, UN reports
"""
import asyncio
from datetime import date
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker

# Documented massacres against Palestinians
MASSACRES = [
    # 1948 NAKBA MASSACRES
    {"name": "Deir Yassin massacre", "date_start": "1948-04-09", "date_end": "1948-04-09",
     "location_name": "Deir Yassin", "lat": 31.7847, "lon": 35.1786,
     "perpetrator": "Irgun and Lehi", "total_killed": 107, "civilians_killed": 107,
     "children_killed": 25, "women_killed": 30,
     "description": "Zionist paramilitaries attacked the village of Deir Yassin near Jerusalem. Survivors reported executions, mutilations, and sexual violence.",
     "progressive_analysis": "The Deir Yassin massacre was a deliberate act of terror designed to cause the flight of Palestinians. News of the massacre spread panic and contributed significantly to the mass exodus during the Nakba."},
    {"name": "Tantura massacre", "date_start": "1948-05-22", "date_end": "1948-05-23",
     "location_name": "Tantura", "lat": 32.6186, "lon": 34.9006,
     "perpetrator": "Alexandroni Brigade", "total_killed": 200, "civilians_killed": 200,
     "description": "After the village surrendered, men were separated and executed. Mass graves were dug on the beach.",
     "progressive_analysis": "For decades denied by Israel, testimonies from Israeli soldiers and Palestinian survivors confirmed the massacre. The beach where victims were buried is now a parking lot for an Israeli resort."},
    {"name": "Lydda massacre", "date_start": "1948-07-11", "date_end": "1948-07-12",
     "location_name": "Lydda (Lod)", "lat": 31.9515, "lon": 34.8885,
     "perpetrator": "IDF", "total_killed": 426, "civilians_killed": 426,
     "description": "After Lydda surrendered, IDF troops killed hundreds in the Dahmash mosque and streets. 50,000 were expelled in the Lydda Death March.",
     "progressive_analysis": "The Lydda massacre and subsequent death march exemplify the systematic nature of ethnic cleansing during the Nakba. Ben-Gurion personally ordered the expulsion."},
    {"name": "Safsaf massacre", "date_start": "1948-10-29", "date_end": "1948-10-29",
     "location_name": "Safsaf", "lat": 33.0167, "lon": 35.5167,
     "perpetrator": "IDF 7th Brigade", "total_killed": 70, "civilians_killed": 70,
     "description": "Men were lined up and shot. Women were raped before being killed. Bodies were thrown into a pit.",
     "progressive_analysis": "Israeli military archives document this massacre but it remains largely unknown internationally."},
    {"name": "al-Dawayima massacre", "date_start": "1948-10-29", "date_end": "1948-10-29",
     "location_name": "al-Dawayima", "lat": 31.5400, "lon": 34.9600,
     "perpetrator": "IDF Battalion 89", "total_killed": 100, "civilians_killed": 100, "children_killed": 30,
     "description": "Israeli soldiers killed villagers with automatic weapons and bayonets. Children were killed by smashing their skulls.",
     "progressive_analysis": "Israeli soldiers who participated later described the atrocities to military investigators, but no prosecutions followed."},
     
    # 1950s-1960s
    {"name": "Kafr Qasim massacre", "date_start": "1956-10-29", "date_end": "1956-10-29",
     "location_name": "Kafr Qasim", "lat": 32.1144, "lon": 34.9764,
     "perpetrator": "Israeli Border Police", "total_killed": 49, "civilians_killed": 49,
     "children_killed": 15, "women_killed": 12,
     "description": "During the Suez Crisis, Israeli Border Police shot Palestinian citizens returning from work, unaware of a sudden curfew.",
     "progressive_analysis": "The massacre of Israeli citizens showed that Palestinian citizens of Israel were not safe from state violence. Perpetrators received light sentences."},
    {"name": "Khan Yunis massacre", "date_start": "1956-11-03", "date_end": "1956-11-03",
     "location_name": "Khan Yunis", "lat": 31.3447, "lon": 34.3033,
     "perpetrator": "IDF", "total_killed": 275, "civilians_killed": 275,
     "description": "During the Suez Crisis, IDF troops lined up and shot Palestinian refugees.",
     "progressive_analysis": "The UN documented this massacre but Israel has never acknowledged it."},
     
    # 1982 LEBANON
    {"name": "Sabra and Shatila massacre", "date_start": "1982-09-16", "date_end": "1982-09-18",
     "location_name": "Sabra and Shatila, Beirut", "lat": 33.8547, "lon": 35.4989,
     "perpetrator": "Phalangist militia (Israeli-backed)", "total_killed": 3500, "civilians_killed": 3500,
     "children_killed": 500, "women_killed": 800,
     "description": "Lebanese Phalangist militia, with IDF coordination and logistical support, massacred Palestinian refugees. IDF surrounded the camps and provided illumination.",
     "progressive_analysis": "The Kahan Commission found Ariel Sharon 'personally responsible' but he later became Prime Minister. This massacre shows the colonial alliance between Israel and local right-wing forces."},
     
    # FIRST INTIFADA
    {"name": "Al-Aqsa Mosque massacre", "date_start": "1990-10-08", "date_end": "1990-10-08",
     "location_name": "Al-Aqsa Mosque, Jerusalem", "lat": 31.7761, "lon": 35.2358,
     "perpetrator": "Israeli Border Police", "total_killed": 22, "civilians_killed": 22,
     "description": "Israeli forces opened fire on Palestinian worshippers protesting Temple Mount provocation.",
     "progressive_analysis": "The massacre demonstrated the explosive nature of Israeli violations of Al-Aqsa and set a pattern repeated in subsequent decades."},
     
    # SECOND INTIFADA
    {"name": "Jenin massacre", "date_start": "2002-04-03", "date_end": "2002-04-11",
     "location_name": "Jenin refugee camp", "lat": 32.4642, "lon": 35.2953,
     "perpetrator": "IDF", "total_killed": 52, "civilians_killed": 23,
     "description": "IDF attacked Jenin refugee camp, destroying much of it. Prevented ambulances and journalists from entering.",
     "progressive_analysis": "Israel blocked UN investigation. The destruction of the refugee camp and killing of civilians was condemned internationally but without consequence."},
     
    # GAZA WARS
    {"name": "Operation Cast Lead", "date_start": "2008-12-27", "date_end": "2009-01-18",
     "location_name": "Gaza Strip", "lat": 31.5, "lon": 34.47,
     "perpetrator": "IDF", "total_killed": 1417, "civilians_killed": 926, "children_killed": 313,
     "description": "22-day assault on Gaza killed over 1,400 Palestinians. UN Goldstone Report documented potential war crimes.",
     "progressive_analysis": "The assault used white phosphorus in civilian areas and deliberately targeted civilian infrastructure including schools and hospitals."},
    {"name": "Operation Protective Edge", "date_start": "2014-07-08", "date_end": "2014-08-26",
     "location_name": "Gaza Strip", "lat": 31.5, "lon": 34.47,
     "perpetrator": "IDF", "total_killed": 2251, "civilians_killed": 1462, "children_killed": 551,
     "description": "51-day assault killed over 2,200 Palestinians, destroyed 18,000 housing units, and displaced 500,000.",
     "progressive_analysis": "The assault demonstrated the asymmetry of violence and the failure of international law to protect Palestinians under occupation."},
    {"name": "Great March of Return killings", "date_start": "2018-03-30", "date_end": "2019-12-27",
     "location_name": "Gaza-Israel fence", "lat": 31.35, "lon": 34.35,
     "perpetrator": "IDF snipers", "total_killed": 223, "civilians_killed": 223, "children_killed": 48,
     "description": "IDF snipers shot unarmed protesters at the Gaza fence during weekly demonstrations demanding the right of return.",
     "progressive_analysis": "The deliberate targeting of medics, journalists, and children was documented by UN. Snipers shot protesters posing no threat."},
    {"name": "Gaza genocide (ongoing)", "date_start": "2023-10-07", "date_end": None,
     "location_name": "Gaza Strip", "lat": 31.5, "lon": 34.47,
     "perpetrator": "IDF", "total_killed": 40000, "civilians_killed": 35000, "children_killed": 15000,
     "description": "Ongoing assault has killed over 40,000 Palestinians, destroyed most of Gaza, displaced 2 million, and created famine conditions.",
     "progressive_analysis": "South Africa filed genocide case at ICJ. The deliberate starvation, targeting of hospitals, schools, and homes, and stated intent to destroy Gaza constitute genocide under international law."},
]


class MassacresImporter:
    async def run(self):
        async with async_session_maker() as session:
            # Get Palestine country ID
            result = await session.execute(
                text("SELECT id FROM countries WHERE name_en ILIKE '%palest%' LIMIT 1")
            )
            row = result.first()
            palestine_id = str(row[0]) if row else None
            
            imported = 0
            for m in MASSACRES:
                try:
                    existing = await session.execute(
                        text("SELECT id FROM massacres WHERE name = :name"),
                        {"name": m["name"]}
                    )
                    if existing.first():
                        continue
                    
                    geom = f"SRID=4326;POINT({m['lon']} {m['lat']})" if m.get("lat") else None
                    start = date.fromisoformat(m["date_start"]) if m.get("date_start") else None
                    end = date.fromisoformat(m["date_end"]) if m.get("date_end") else None
                    
                    await session.execute(
                        text("""
                            INSERT INTO massacres (
                                id, name, date_start, date_end, location_name,
                                country_id, geometry, perpetrator, total_killed,
                                civilians_killed, children_killed, description,
                                progressive_analysis, sources
                            ) VALUES (
                                :id, :name, :date_start, :date_end, :location_name,
                                :country_id, ST_GeomFromEWKT(:geometry), :perpetrator,
                                :total_killed, :civilians_killed, :children_killed,
                                :description, :progressive_analysis, :sources
                            )
                        """),
                        {
                            "id": str(uuid4()),
                            "name": m["name"],
                            "date_start": start,
                            "date_end": end,
                            "location_name": m.get("location_name"),
                            "country_id": palestine_id,
                            "geometry": geom,
                            "perpetrator": m.get("perpetrator"),
                            "total_killed": m.get("total_killed"),
                            "civilians_killed": m.get("civilians_killed"),
                            "children_killed": m.get("children_killed"),
                            "description": m.get("description"),
                            "progressive_analysis": m.get("progressive_analysis"),
                            "sources": ["B'Tselem", "Al-Haq", "PCHR", "UN OCHA"],
                        }
                    )
                    imported += 1
                except Exception as e:
                    print(f"Error importing {m.get('name')}: {e}")
            
            await session.commit()
            print(f"Imported {imported} massacres")
            return imported


async def main():
    importer = MassacresImporter()
    await importer.run()

if __name__ == "__main__":
    asyncio.run(main())
