#!/usr/bin/env python3
"""Import historical country relationships (alliances, conflicts, treaties)."""
import asyncio
import sys
from datetime import date
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from sqlalchemy import select
from src.database import async_session_maker
from src.geography.models import Country, CountryRelationship

# Major historical alliances and relationships
RELATIONSHIPS = [
    # Triple Alliance (1882-1914)
    {"countries": ["Germany", "Austria-Hungary"], "type": "alliance", "nature": "ally", 
     "name": "Triple Alliance", "from": "1882-05-20", "to": "1914-08-01"},
    {"countries": ["Germany", "Italy"], "type": "alliance", "nature": "ally",
     "name": "Triple Alliance", "from": "1882-05-20", "to": "1915-05-23"},
    {"countries": ["Austria-Hungary", "Italy"], "type": "alliance", "nature": "ally",
     "name": "Triple Alliance", "from": "1882-05-20", "to": "1915-05-23"},
    
    # Triple Entente (1907-1918)
    {"countries": ["France", "United Kingdom"], "type": "alliance", "nature": "ally",
     "name": "Entente Cordiale", "from": "1904-04-08", "to": "1918-11-11"},
    {"countries": ["France", "Russia"], "type": "alliance", "nature": "ally",
     "name": "Franco-Russian Alliance", "from": "1894-01-04", "to": "1917-11-07"},
    {"countries": ["United Kingdom", "Russia"], "type": "alliance", "nature": "ally",
     "name": "Anglo-Russian Entente", "from": "1907-08-31", "to": "1917-11-07"},
    
    # Axis Powers (1940-1945)
    {"countries": ["Germany", "Italy"], "type": "alliance", "nature": "ally",
     "name": "Axis Powers / Pact of Steel", "from": "1939-05-22", "to": "1945-05-08"},
    {"countries": ["Germany", "Japan"], "type": "alliance", "nature": "ally",
     "name": "Axis Powers / Tripartite Pact", "from": "1940-09-27", "to": "1945-05-08"},
    {"countries": ["Italy", "Japan"], "type": "alliance", "nature": "ally",
     "name": "Axis Powers / Tripartite Pact", "from": "1940-09-27", "to": "1943-09-08"},
    
    # Allied Powers WWII
    {"countries": ["United Kingdom", "United States of America"], "type": "alliance", "nature": "ally",
     "name": "Allied Powers WWII", "from": "1941-12-08", "to": "1945-09-02"},
    {"countries": ["United Kingdom", "Soviet Union"], "type": "alliance", "nature": "ally",
     "name": "Allied Powers WWII", "from": "1941-06-22", "to": "1945-09-02"},
    {"countries": ["United States of America", "Soviet Union"], "type": "alliance", "nature": "ally",
     "name": "Allied Powers WWII", "from": "1941-12-08", "to": "1945-09-02"},
    {"countries": ["United States of America", "France"], "type": "alliance", "nature": "ally",
     "name": "Allied Powers WWII", "from": "1941-12-08", "to": "1945-09-02"},
    
    # NATO founding members
    {"countries": ["United States of America", "United Kingdom"], "type": "alliance", "nature": "ally",
     "name": "NATO", "from": "1949-04-04", "to": None},
    {"countries": ["United States of America", "France"], "type": "alliance", "nature": "ally",
     "name": "NATO", "from": "1949-04-04", "to": None},
    {"countries": ["United States of America", "Canada"], "type": "alliance", "nature": "ally",
     "name": "NATO", "from": "1949-04-04", "to": None},
    {"countries": ["United Kingdom", "France"], "type": "alliance", "nature": "ally",
     "name": "NATO", "from": "1949-04-04", "to": None},
    {"countries": ["United States of America", "Netherlands"], "type": "alliance", "nature": "ally",
     "name": "NATO", "from": "1949-04-04", "to": None},
    {"countries": ["United States of America", "Belgium"], "type": "alliance", "nature": "ally",
     "name": "NATO", "from": "1949-04-04", "to": None},
    
    # Warsaw Pact
    {"countries": ["Soviet Union", "Poland"], "type": "alliance", "nature": "ally",
     "name": "Warsaw Pact", "from": "1955-05-14", "to": "1991-07-01"},
    {"countries": ["Soviet Union", "East Germany"], "type": "alliance", "nature": "ally",
     "name": "Warsaw Pact", "from": "1955-05-14", "to": "1990-10-03"},
    {"countries": ["Soviet Union", "Czechoslovakia"], "type": "alliance", "nature": "ally",
     "name": "Warsaw Pact", "from": "1955-05-14", "to": "1991-07-01"},
    {"countries": ["Soviet Union", "Hungary"], "type": "alliance", "nature": "ally",
     "name": "Warsaw Pact", "from": "1955-05-14", "to": "1991-07-01"},
    {"countries": ["Soviet Union", "Romania"], "type": "alliance", "nature": "ally",
     "name": "Warsaw Pact", "from": "1955-05-14", "to": "1991-07-01"},
    {"countries": ["Soviet Union", "Bulgaria"], "type": "alliance", "nature": "ally",
     "name": "Warsaw Pact", "from": "1955-05-14", "to": "1991-07-01"},
    
    # Cold War tensions
    {"countries": ["United States of America", "Soviet Union"], "type": "rivalry", "nature": "rival",
     "name": "Cold War", "from": "1947-03-12", "to": "1991-12-26"},
    {"countries": ["United States of America", "Cuba"], "type": "rivalry", "nature": "enemy",
     "name": "US-Cuba tensions", "from": "1959-01-01", "to": None},
    
    # WWI Conflicts
    {"countries": ["Germany", "France"], "type": "conflict", "nature": "enemy",
     "name": "World War I", "from": "1914-08-03", "to": "1918-11-11"},
    {"countries": ["Germany", "United Kingdom"], "type": "conflict", "nature": "enemy",
     "name": "World War I", "from": "1914-08-04", "to": "1918-11-11"},
    {"countries": ["Germany", "Russia"], "type": "conflict", "nature": "enemy",
     "name": "World War I", "from": "1914-08-01", "to": "1918-03-03"},
    {"countries": ["Austria-Hungary", "Serbia"], "type": "conflict", "nature": "enemy",
     "name": "World War I", "from": "1914-07-28", "to": "1918-11-11"},
    
    # WWII Conflicts
    {"countries": ["Germany", "Poland"], "type": "conflict", "nature": "enemy",
     "name": "World War II", "from": "1939-09-01", "to": "1945-05-08"},
    {"countries": ["Germany", "France"], "type": "conflict", "nature": "enemy",
     "name": "World War II", "from": "1939-09-03", "to": "1945-05-08"},
    {"countries": ["Germany", "United Kingdom"], "type": "conflict", "nature": "enemy",
     "name": "World War II", "from": "1939-09-03", "to": "1945-05-08"},
    {"countries": ["Germany", "Soviet Union"], "type": "conflict", "nature": "enemy",
     "name": "World War II", "from": "1941-06-22", "to": "1945-05-08"},
    {"countries": ["Germany", "United States of America"], "type": "conflict", "nature": "enemy",
     "name": "World War II", "from": "1941-12-11", "to": "1945-05-08"},
    {"countries": ["Japan", "United States of America"], "type": "conflict", "nature": "enemy",
     "name": "World War II", "from": "1941-12-07", "to": "1945-09-02"},
    {"countries": ["Japan", "China"], "type": "conflict", "nature": "enemy",
     "name": "Second Sino-Japanese War", "from": "1937-07-07", "to": "1945-09-02"},
    
    # Korean War
    {"countries": ["South Korea", "North Korea"], "type": "conflict", "nature": "enemy",
     "name": "Korean War", "from": "1950-06-25", "to": None},
    {"countries": ["United States of America", "North Korea"], "type": "conflict", "nature": "enemy",
     "name": "Korean War", "from": "1950-06-27", "to": "1953-07-27"},
    {"countries": ["China", "United States of America"], "type": "conflict", "nature": "enemy",
     "name": "Korean War", "from": "1950-10-19", "to": "1953-07-27"},
    
    # Vietnam War
    {"countries": ["United States of America", "North Vietnam"], "type": "conflict", "nature": "enemy",
     "name": "Vietnam War", "from": "1965-03-08", "to": "1973-01-27"},
    {"countries": ["South Vietnam", "North Vietnam"], "type": "conflict", "nature": "enemy",
     "name": "Vietnam War", "from": "1955-11-01", "to": "1975-04-30"},
    
    # Soviet-Chinese Split
    {"countries": ["Soviet Union", "China"], "type": "rivalry", "nature": "rival",
     "name": "Sino-Soviet Split", "from": "1960-01-01", "to": "1989-05-16"},
    
    # European Union core
    {"countries": ["France", "Germany"], "type": "treaty", "nature": "partner",
     "name": "European Union", "from": "1993-11-01", "to": None},
    {"countries": ["France", "Italy"], "type": "treaty", "nature": "partner",
     "name": "European Union", "from": "1993-11-01", "to": None},
    {"countries": ["Germany", "Italy"], "type": "treaty", "nature": "partner",
     "name": "European Union", "from": "1993-11-01", "to": None},
    {"countries": ["Germany", "Netherlands"], "type": "treaty", "nature": "partner",
     "name": "European Union", "from": "1993-11-01", "to": None},
    {"countries": ["France", "Spain"], "type": "treaty", "nature": "partner",
     "name": "European Union", "from": "1993-11-01", "to": None},
]

async def find_country(session, name: str):
    """Find a country by name (various forms)."""
    # Try exact match first
    result = await session.execute(
        select(Country).where(Country.name_en == name)
    )
    country = result.scalar_one_or_none()
    if country:
        return country
    
    # Try partial match
    result = await session.execute(
        select(Country).where(Country.name_en.ilike(f"%{name}%"))
    )
    countries = result.scalars().all()
    if len(countries) == 1:
        return countries[0]
    
    # For common cases, use specific handling
    name_map = {
        "United States of America": ["United States", "USA"],
        "United Kingdom": ["Britain", "Great Britain", "UK"],
        "Soviet Union": ["USSR", "Russia"],
        "East Germany": ["German Democratic Republic", "GDR"],
        "West Germany": ["Federal Republic of Germany", "FRG"],
        "North Korea": ["DPRK", "Democratic People's Republic of Korea"],
        "South Korea": ["Republic of Korea", "ROK"],
        "North Vietnam": ["Democratic Republic of Vietnam"],
        "South Vietnam": ["Republic of Vietnam"],
    }
    
    for key, alternatives in name_map.items():
        if name in [key] + alternatives:
            for alt in [key] + alternatives:
                result = await session.execute(
                    select(Country).where(Country.name_en.ilike(f"%{alt}%"))
                )
                country = result.scalar_one_or_none()
                if country:
                    return country
    
    return None

async def main():
    async with async_session_maker() as session:
        count = 0
        skipped = 0
        
        for rel in RELATIONSHIPS:
            country_a = await find_country(session, rel["countries"][0])
            country_b = await find_country(session, rel["countries"][1])
            
            if not country_a:
                print(f"  Skipping: Country not found: {rel['countries'][0]}")
                skipped += 1
                continue
            if not country_b:
                print(f"  Skipping: Country not found: {rel['countries'][1]}")
                skipped += 1
                continue
            
            valid_from = date.fromisoformat(rel["from"])
            valid_to = date.fromisoformat(rel["to"]) if rel["to"] else None
            
            relationship = CountryRelationship(
                country_a_id=country_a.id,
                country_b_id=country_b.id,
                relationship_type=rel["type"],
                relationship_nature=rel["nature"],
                name=rel["name"],
                valid_from=valid_from,
                valid_to=valid_to,
            )
            session.add(relationship)
            count += 1
        
        await session.commit()
        print(f"Imported {count} relationships, skipped {skipped}")

if __name__ == "__main__":
    asyncio.run(main())
