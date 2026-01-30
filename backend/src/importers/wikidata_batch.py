import asyncio
import aiohttp
from src.database import async_session_maker
from src.events.models import Event
from src.people.models import Person
from sqlalchemy import text

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
HEADERS = {
    "User-Agent": "LeftistMonitor/1.0 (Educational Project)",
    "Accept": "application/json"
}

async def fetch_wikidata(session, query):
    await asyncio.sleep(2)
    try:
        async with session.get(
            WIKIDATA_ENDPOINT,
            params={"query": query, "format": "json"},
            headers=HEADERS,
            timeout=aiohttp.ClientTimeout(total=30)
        ) as response:
            if response.status == 200:
                return await response.json()
            print(f"Error {response.status}")
            return None
    except Exception as e:
        print(f"Request failed: {e}")
        return None

async def import_revolutions():
    query = """
    SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
      ?event wdt:P31/wdt:P279* wd:Q210017 .
      OPTIONAL { ?event wdt:P585 ?date . }
      OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 100
    """
    
    async with aiohttp.ClientSession() as http_session:
        print("Fetching revolutions...")
        data = await fetch_wikidata(http_session, query)
        if not data:
            return 0
        
        results = data.get("results", {}).get("bindings", [])
        print(f"Found {len(results)} revolutions")
        
        count = 0
        async with async_session_maker() as db_session:
            for item in results:
                name = item.get("eventLabel", {}).get("value", "")
                if not name or name.startswith("Q"):
                    continue
                
                existing = await db_session.execute(
                    text("SELECT id FROM events WHERE title = :title"),
                    {"title": name}
                )
                if existing.fetchone():
                    continue
                
                date_str = item.get("date", {}).get("value", "")
                date = date_str.split("T")[0] if date_str else None
                description = item.get("description", {}).get("value", "")
                
                event = Event(
                    title=name,
                    description=description or "Historical revolution",
                    date=date,
                    category="political",
                    tags=["revolution", "uprising"]
                )
                db_session.add(event)
                count += 1
                print(f"  Added: {name}")
            
            await db_session.commit()
        return count

async def import_strikes():
    query = """
    SELECT DISTINCT ?event ?eventLabel ?date ?description WHERE {
      ?event wdt:P31/wdt:P279* wd:Q49776 .
      OPTIONAL { ?event wdt:P585 ?date . }
      OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 100
    """
    
    async with aiohttp.ClientSession() as http_session:
        print("\nFetching labor strikes...")
        data = await fetch_wikidata(http_session, query)
        if not data:
            return 0
        
        results = data.get("results", {}).get("bindings", [])
        print(f"Found {len(results)} strikes")
        
        count = 0
        async with async_session_maker() as db_session:
            for item in results:
                name = item.get("eventLabel", {}).get("value", "")
                if not name or name.startswith("Q"):
                    continue
                
                existing = await db_session.execute(
                    text("SELECT id FROM events WHERE title = :title"),
                    {"title": name}
                )
                if existing.fetchone():
                    continue
                
                date_str = item.get("date", {}).get("value", "")
                date = date_str.split("T")[0] if date_str else None
                description = item.get("description", {}).get("value", "")
                
                event = Event(
                    title=name,
                    description=description or "Labor strike",
                    date=date,
                    category="social",
                    tags=["strike", "labor"]
                )
                db_session.add(event)
                count += 1
                print(f"  Added: {name}")
            
            await db_session.commit()
        return count

async def import_socialists():
    query = """
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?description WHERE {
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P106 wd:Q82955 .
      ?person wdt:P102 ?party .
      ?party wdt:P1142/wdt:P279* wd:Q7272 .
      OPTIONAL { ?person wdt:P569 ?birthDate . }
      OPTIONAL { ?person wdt:P570 ?deathDate . }
      OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 150
    """
    
    async with aiohttp.ClientSession() as http_session:
        print("\nFetching socialist politicians...")
        data = await fetch_wikidata(http_session, query)
        if not data:
            return 0
        
        results = data.get("results", {}).get("bindings", [])
        print(f"Found {len(results)} socialists")
        
        count = 0
        async with async_session_maker() as db_session:
            for item in results:
                name = item.get("personLabel", {}).get("value", "")
                if not name or name.startswith("Q"):
                    continue
                
                existing = await db_session.execute(
                    text("SELECT id FROM people WHERE name = :name"),
                    {"name": name}
                )
                if existing.fetchone():
                    continue
                
                birth = item.get("birthDate", {}).get("value", "")
                death = item.get("deathDate", {}).get("value", "")
                description = item.get("description", {}).get("value", "")
                
                person = Person(
                    name=name,
                    birth_date=birth.split("T")[0] if birth else None,
                    death_date=death.split("T")[0] if death else None,
                    bio=description or "Socialist politician",
                    person_type=["politician", "socialist"],
                    ideology_tags=["socialism"]
                )
                db_session.add(person)
                count += 1
                print(f"  Added: {name}")
            
            await db_session.commit()
        return count

async def main():
    print("=" * 60)
    print("WIKIDATA BATCH IMPORT")
    print("=" * 60)
    
    rev = await import_revolutions()
    strikes = await import_strikes()
    socialists = await import_socialists()
    
    print("\n" + "=" * 60)
    print(f"TOTAL: {rev + strikes + socialists} new records")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
