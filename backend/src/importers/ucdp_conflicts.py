"""
Import conflicts from UCDP (Uppsala Conflict Data Program) API
https://ucdp.uu.se/apidocs/
"""
import asyncio
import uuid
from datetime import date
import httpx
from src.database import async_session_maker
from sqlalchemy import text

UCDP_BASE = "https://ucdpapi.pcr.uu.se/api"

# Static conflict data since API may have restrictions
CONFLICTS = [
    # Major ongoing/recent conflicts
    {"name": "Syrian Civil War", "start": "2011-03-15", "end": None, "type": "civil war",
     "description": "Armed conflict between Syrian government and various opposition groups. Massive humanitarian crisis.",
     "intensity": "war", "region": "Middle East"},
    {"name": "Yemen Civil War", "start": "2014-09-21", "end": None, "type": "civil war",
     "description": "Conflict between Houthi forces and internationally recognized government. Saudi-led intervention.",
     "intensity": "war", "region": "Middle East"},
    {"name": "Russo-Ukrainian War", "start": "2014-02-20", "end": None, "type": "interstate",
     "description": "Conflict beginning with Crimea annexation, escalating to full-scale invasion in 2022.",
     "intensity": "war", "region": "Europe"},
    {"name": "Ethiopian Civil War", "start": "2020-11-04", "end": None, "type": "civil war",
     "description": "Conflict in Tigray region between federal government and TPLF forces.",
     "intensity": "war", "region": "Africa"},
    {"name": "Myanmar Civil War", "start": "2021-02-01", "end": None, "type": "civil war",
     "description": "Conflict following military coup. Resistance forces fighting junta.",
     "intensity": "war", "region": "Asia"},
    
    # Historical Cold War conflicts
    {"name": "Korean War", "start": "1950-06-25", "end": "1953-07-27", "type": "interstate",
     "description": "War between North and South Korea with US/UN and Chinese intervention.",
     "intensity": "war", "region": "Asia"},
    {"name": "Vietnam War", "start": "1955-11-01", "end": "1975-04-30", "type": "civil war",
     "description": "Conflict between communist North Vietnam and US-backed South Vietnam.",
     "intensity": "war", "region": "Asia"},
    {"name": "Angolan Civil War", "start": "1975-11-11", "end": "2002-04-04", "type": "civil war",
     "description": "Conflict between MPLA government and UNITA rebels. Cold War proxy war.",
     "intensity": "war", "region": "Africa"},
    {"name": "Mozambican Civil War", "start": "1977-01-01", "end": "1992-10-04", "type": "civil war",
     "description": "Conflict between FRELIMO government and RENAMO rebels.",
     "intensity": "war", "region": "Africa"},
    {"name": "Afghan-Soviet War", "start": "1979-12-24", "end": "1989-02-15", "type": "civil war",
     "description": "Soviet intervention in Afghanistan against mujahideen. US-backed resistance.",
     "intensity": "war", "region": "Asia"},
    {"name": "Salvadoran Civil War", "start": "1979-10-15", "end": "1992-01-16", "type": "civil war",
     "description": "Conflict between military government and FMLN leftist guerrillas.",
     "intensity": "war", "region": "Central America"},
    {"name": "Nicaraguan Contra War", "start": "1981-01-01", "end": "1990-01-01", "type": "civil war",
     "description": "US-backed Contras fighting against Sandinista government.",
     "intensity": "minor", "region": "Central America"},
    {"name": "Guatemalan Civil War", "start": "1960-11-13", "end": "1996-12-29", "type": "civil war",
     "description": "36-year conflict between government and leftist guerrillas. Genocide of Maya peoples.",
     "intensity": "war", "region": "Central America"},
    
    # Post-Cold War conflicts
    {"name": "Yugoslav Wars", "start": "1991-06-27", "end": "2001-11-12", "type": "civil war",
     "description": "Series of ethnic conflicts during breakup of Yugoslavia. Bosnia genocide.",
     "intensity": "war", "region": "Europe"},
    {"name": "Rwandan Civil War & Genocide", "start": "1990-10-01", "end": "1994-07-18", "type": "civil war",
     "description": "Conflict ending in genocide of 800,000 Tutsis and moderate Hutus.",
     "intensity": "war", "region": "Africa"},
    {"name": "First Chechen War", "start": "1994-12-11", "end": "1996-08-31", "type": "civil war",
     "description": "Russian military intervention in Chechnya seeking independence.",
     "intensity": "war", "region": "Europe"},
    {"name": "Second Chechen War", "start": "1999-08-26", "end": "2009-04-16", "type": "civil war",
     "description": "Russian counter-insurgency in Chechnya after apartment bombings.",
     "intensity": "war", "region": "Europe"},
    {"name": "War in Afghanistan", "start": "2001-10-07", "end": "2021-08-30", "type": "civil war",
     "description": "US-led intervention following 9/11. Taliban regained power in 2021.",
     "intensity": "war", "region": "Asia"},
    {"name": "Iraq War", "start": "2003-03-20", "end": "2011-12-18", "type": "interstate",
     "description": "US-led invasion of Iraq. Toppled Saddam Hussein, long insurgency followed.",
     "intensity": "war", "region": "Middle East"},
    {"name": "Libyan Civil War", "start": "2011-02-15", "end": None, "type": "civil war",
     "description": "Conflict beginning with Arab Spring protests. NATO intervention. Ongoing instability.",
     "intensity": "minor", "region": "Africa"},
    
    # Latin American conflicts
    {"name": "Colombian Conflict", "start": "1964-05-27", "end": "2016-11-24", "type": "civil war",
     "description": "Decades-long conflict involving FARC, ELN, paramilitaries, and government.",
     "intensity": "war", "region": "South America"},
    {"name": "Peruvian Internal Conflict", "start": "1980-05-17", "end": "2000-01-01", "type": "civil war",
     "description": "Conflict between Shining Path/MRTA and government. Truth commission documented abuses.",
     "intensity": "war", "region": "South America"},
    
    # Historical 20th century
    {"name": "Spanish Civil War", "start": "1936-07-17", "end": "1939-04-01", "type": "civil war",
     "description": "Conflict between Republican government and Nationalist forces led by Franco.",
     "intensity": "war", "region": "Europe"},
    {"name": "Chinese Civil War", "start": "1927-08-01", "end": "1949-12-07", "type": "civil war",
     "description": "Conflict between Nationalists (KMT) and Communists (CCP). CCP victory.",
     "intensity": "war", "region": "Asia"},
    {"name": "Greek Civil War", "start": "1946-03-30", "end": "1949-10-16", "type": "civil war",
     "description": "Conflict between communist-led forces and government backed by UK/US.",
     "intensity": "war", "region": "Europe"},
]

def parse_date(date_str):
    if not date_str:
        return None
    try:
        parts = date_str.split("-")
        return date(int(parts[0]), int(parts[1]), int(parts[2]))
    except:
        return None

async def import_conflicts():
    count = 0
    async with async_session_maker() as session:
        for c in CONFLICTS:
            existing = await session.execute(
                text("SELECT id FROM conflicts WHERE name = :name"),
                {"name": c["name"]}
            )
            if existing.fetchone():
                continue
            
            await session.execute(
                text("""
                    INSERT INTO conflicts (id, name, start_date, end_date, conflict_type, description, intensity)
                    VALUES (:id, :name, :start_date, :end_date, :conflict_type, :description, :intensity)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "name": c["name"],
                    "start_date": parse_date(c.get("start")),
                    "end_date": parse_date(c.get("end")),
                    "conflict_type": c.get("type"),
                    "description": c.get("description", ""),
                    "intensity": c.get("intensity")
                }
            )
            count += 1
            print(f"  Conflict: {c['name']}")
        
        await session.commit()
    return count

async def main():
    print("=" * 60)
    print("IMPORTING CONFLICTS DATA")
    print("=" * 60)
    
    count = await import_conflicts()
    
    print("\n" + "=" * 60)
    print(f"IMPORTED: {count} conflicts")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
