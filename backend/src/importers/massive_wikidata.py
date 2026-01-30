"""Massive data importer for leftist figures, books, and events from Wikidata."""
import asyncio
import httpx
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import date, datetime
import time

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import async_session_maker
from ..geography.models import Country
from ..people.models import Person, Book, BookAuthor, PersonConnection
from ..events.models import Event


WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql"

# Query for socialist/communist politicians and activists
LEFTIST_POLITICIANS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?deathPlaceLabel 
       ?image ?countryLabel ?description
WHERE {
  {
    ?person wdt:P106 wd:Q82955 .
    ?person wdt:P102 ?party .
    ?party wdt:P1142 ?ideology .
    VALUES ?ideology { 
      wd:Q6186 wd:Q7264 wd:Q49892 wd:Q7272 wd:Q6199 wd:Q182090 wd:Q183744 wd:Q131254 wd:Q201843
    }
  }
  UNION {
    ?person wdt:P106 wd:Q15978355 .
  }
  UNION {
    ?person wdt:P106 wd:Q2393388 .
  }
  UNION {
    ?person wdt:P106 wd:Q17124576 .
  }
  UNION {
    ?person wdt:P106 wd:Q1734564 .
  }
  
  ?person wdt:P31 wd:Q5 .
  
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person wdt:P20 ?deathPlace . }
  OPTIONAL { ?person wdt:P18 ?image . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 1000
"""

# Query for socialist/communist writers and philosophers
LEFTIST_WRITERS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?deathPlaceLabel 
       ?image ?countryLabel ?description
WHERE {
  {
    ?person wdt:P106 wd:Q36180 .
    ?person wdt:P135 ?movement .
    VALUES ?movement { wd:Q7264 wd:Q6186 wd:Q6199 wd:Q7272 }
  }
  UNION {
    ?person wdt:P106 wd:Q4964182 .
    ?person wdt:P135 ?movement .
    VALUES ?movement { wd:Q7264 wd:Q6186 wd:Q6199 wd:Q7272 }
  }
  UNION {
    ?person wdt:P106 wd:Q188094 .
    ?person wdt:P135 ?movement .
    VALUES ?movement { wd:Q7264 wd:Q6186 }
  }
  
  ?person wdt:P31 wd:Q5 .
  
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person wdt:P20 ?deathPlace . }
  OPTIONAL { ?person wdt:P18 ?image . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 500
"""

# Query for labor leaders
LABOR_LEADERS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?deathPlaceLabel 
       ?image ?countryLabel ?description
WHERE {
  {
    ?person wdt:P106 wd:Q17351648 .
  }
  UNION {
    ?person wdt:P106 wd:Q15627169 .
  }
  
  ?person wdt:P31 wd:Q5 .
  
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person wdt:P20 ?deathPlace . }
  OPTIONAL { ?person wdt:P18 ?image . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 500
"""

# Query for revolutions
REVOLUTIONS_QUERY = """
SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?locationLabel ?countryLabel ?description
WHERE {
  {
    ?event wdt:P31 wd:Q10931 .
  }
  UNION {
    ?event wdt:P31 wd:Q124734 .
  }
  UNION {
    ?event wdt:P31 wd:Q13418847 .
  }
  UNION {
    ?event wdt:P31 wd:Q273120 .
  }
  
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 500
"""

# Query for strikes
STRIKES_QUERY = """
SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31 wd:Q49776 .
  
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 300
"""

# Protests query
PROTESTS_QUERY = """
SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31 wd:Q273120 .
  
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 300
"""


class MassiveDataImporter:
    """Import large amounts of data from Wikidata."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.country_cache: Dict[str, UUID] = {}
        self.http_client = httpx.AsyncClient(timeout=60.0)

    async def close(self):
        await self.http_client.aclose()

    async def query_wikidata(self, query: str) -> List[Dict]:
        """Execute SPARQL query against Wikidata."""
        headers = {
            "Accept": "application/sparql-results+json",
            "User-Agent": "LeftistMonitor/1.0"
        }
        
        try:
            response = await self.http_client.get(
                WIKIDATA_SPARQL_URL,
                params={"query": query},
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data.get("results", {}).get("bindings", [])
        except Exception as e:
            print(f"  Error querying Wikidata: {e}")
            return []

    def extract_id(self, uri: str) -> str:
        if uri and "/" in uri:
            return uri.split("/")[-1]
        return uri

    def parse_date(self, date_str: Optional[str]) -> Optional[date]:
        if not date_str:
            return None
        try:
            if "T" in date_str:
                date_str = date_str.split("T")[0]
            if len(date_str) >= 10:
                return date.fromisoformat(date_str[:10])
            elif len(date_str) == 4:
                return date(int(date_str), 1, 1)
        except:
            pass
        return None

    async def get_country_id(self, name: str) -> Optional[UUID]:
        if not name:
            return None
        if name in self.country_cache:
            return self.country_cache[name]
        
        result = await self.db.execute(
            select(Country.id).where(Country.name_en.ilike(f"%{name}%")).limit(1)
        )
        cid = result.scalar_one_or_none()
        if cid:
            self.country_cache[name] = cid
        return cid

    async def import_people(self, query: str, ptypes: List[str], itags: List[str]) -> int:
        print(f"  Querying Wikidata...")
        results = await self.query_wikidata(query)
        print(f"  Got {len(results)} results")
        
        imported = 0
        for row in results:
            try:
                wid = self.extract_id(row.get("person", {}).get("value", ""))
                if not wid:
                    continue
                
                existing = await self.db.execute(
                    select(Person.id).where(Person.wikidata_id == wid)
                )
                if existing.scalar_one_or_none():
                    continue
                
                name = row.get("personLabel", {}).get("value", "")
                if not name or name == wid:
                    continue
                
                country_name = row.get("countryLabel", {}).get("value")
                country_id = await self.get_country_id(country_name) if country_name else None
                
                person = Person(
                    wikidata_id=wid,
                    name=name,
                    birth_date=self.parse_date(row.get("birthDate", {}).get("value")),
                    death_date=self.parse_date(row.get("deathDate", {}).get("value")),
                    birth_place=row.get("birthPlaceLabel", {}).get("value"),
                    death_place=row.get("deathPlaceLabel", {}).get("value"),
                    image_url=row.get("image", {}).get("value"),
                    person_types=ptypes,
                    ideology_tags=itags,
                    bio_short=row.get("description", {}).get("value", "")[:500] if row.get("description", {}).get("value") else None,
                    primary_country_id=country_id,
                )
                
                self.db.add(person)
                imported += 1
                
                if imported % 50 == 0:
                    await self.db.commit()
                    print(f"    {imported}...")
            except Exception as e:
                continue
        
        await self.db.commit()
        return imported

    async def import_events(self, query: str, cat: str, etype: str) -> int:
        print(f"  Querying Wikidata...")
        results = await self.query_wikidata(query)
        print(f"  Got {len(results)} results")
        
        imported = 0
        for row in results:
            try:
                wid = self.extract_id(row.get("event", {}).get("value", ""))
                if not wid:
                    continue
                
                existing = await self.db.execute(
                    select(Event.id).where(Event.wikidata_id == wid)
                )
                if existing.scalar_one_or_none():
                    continue
                
                title = row.get("eventLabel", {}).get("value", "")
                if not title or title == wid:
                    continue
                
                country_name = row.get("countryLabel", {}).get("value")
                country_id = await self.get_country_id(country_name) if country_name else None
                
                event = Event(
                    wikidata_id=wid,
                    title=title,
                    description=row.get("description", {}).get("value", "")[:1000] if row.get("description", {}).get("value") else None,
                    start_date=self.parse_date(row.get("startDate", {}).get("value")),
                    end_date=self.parse_date(row.get("endDate", {}).get("value")),
                    category=cat,
                    event_type=etype,
                    location_name=row.get("locationLabel", {}).get("value"),
                    primary_country_id=country_id,
                    tags=["leftist", "historical"],
                )
                
                self.db.add(event)
                imported += 1
                
                if imported % 50 == 0:
                    await self.db.commit()
                    print(f"    {imported}...")
            except Exception as e:
                continue
        
        await self.db.commit()
        return imported

    async def run(self):
        print("=" * 60)
        print("MASSIVE DATA IMPORT")
        print("=" * 60)
        
        tp = 0
        te = 0
        
        print("\n1. Politicians/Activists...")
        c = await self.import_people(LEFTIST_POLITICIANS_QUERY, ["politician", "activist"], ["socialist", "communist"])
        tp += c
        print(f"   -> {c}")
        await asyncio.sleep(2)
        
        print("\n2. Writers/Philosophers...")
        c = await self.import_people(LEFTIST_WRITERS_QUERY, ["writer", "philosopher"], ["socialist", "communist"])
        tp += c
        print(f"   -> {c}")
        await asyncio.sleep(2)
        
        print("\n3. Labor Leaders...")
        c = await self.import_people(LABOR_LEADERS_QUERY, ["labor_leader", "activist"], ["labor", "socialist"])
        tp += c
        print(f"   -> {c}")
        await asyncio.sleep(2)
        
        print("\n4. Revolutions...")
        c = await self.import_events(REVOLUTIONS_QUERY, "political", "revolution")
        te += c
        print(f"   -> {c}")
        await asyncio.sleep(2)
        
        print("\n5. Strikes...")
        c = await self.import_events(STRIKES_QUERY, "social", "strike")
        te += c
        print(f"   -> {c}")
        await asyncio.sleep(2)
        
        print("\n6. Protests...")
        c = await self.import_events(PROTESTS_QUERY, "social", "protest")
        te += c
        print(f"   -> {c}")
        
        print("\n" + "=" * 60)
        print(f"DONE! People: {tp}, Events: {te}")
        print("=" * 60)


async def main():
    async with async_session_maker() as session:
        imp = MassiveDataImporter(session)
        try:
            await imp.run()
        finally:
            await imp.close()


if __name__ == "__main__":
    asyncio.run(main())
