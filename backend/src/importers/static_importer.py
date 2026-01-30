"""Import static leftist data."""
import asyncio
from datetime import date
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import async_session_maker
from ..geography.models import Country
from ..people.models import Person, Book, BookAuthor
from ..events.models import Event

# Import the static data
from .static_leftist_data import LEFTIST_FIGURES, HISTORICAL_EVENTS, LEFTIST_BOOKS


class StaticDataImporter:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.country_cache = {}
        self.person_cache = {}

    def parse_date(self, d: Optional[str]) -> Optional[date]:
        if not d:
            return None
        try:
            return date.fromisoformat(d)
        except:
            return None

    async def get_country_id(self, place: str) -> Optional[UUID]:
        if not place:
            return None
        # Extract country from place (usually last part after comma)
        parts = place.split(", ")
        country_name = parts[-1] if parts else place
        
        if country_name in self.country_cache:
            return self.country_cache[country_name]
        
        result = await self.db.execute(
            select(Country.id).where(Country.name_en.ilike(f"%{country_name}%")).limit(1)
        )
        cid = result.scalar_one_or_none()
        if cid:
            self.country_cache[country_name] = cid
        return cid

    async def import_figures(self) -> int:
        imported = 0
        for fig in LEFTIST_FIGURES:
            try:
                wid = fig.get("wikidata_id", "")
                if not wid:
                    continue
                
                existing = await self.db.execute(
                    select(Person.id).where(Person.wikidata_id == wid)
                )
                if existing.scalar_one_or_none():
                    continue
                
                country_id = await self.get_country_id(fig.get("birth_place"))
                
                person = Person(
                    wikidata_id=wid,
                    name=fig["name"],
                    birth_date=self.parse_date(fig.get("birth_date")),
                    death_date=self.parse_date(fig.get("death_date")),
                    birth_place=fig.get("birth_place"),
                    person_types=fig.get("person_types", []),
                    ideology_tags=fig.get("ideology_tags", []),
                    bio_short=fig.get("bio_short"),
                    primary_country_id=country_id,
                )
                
                self.db.add(person)
                self.person_cache[wid] = person.id
                imported += 1
            except Exception as e:
                print(f"  Error importing {fig.get('name')}: {e}")
        
        await self.db.commit()
        return imported

    async def import_events(self) -> int:
        imported = 0
        for evt in HISTORICAL_EVENTS:
            try:
                wid = evt.get("wikidata_id", "")
                if not wid:
                    continue
                
                existing = await self.db.execute(
                    select(Event.id).where(Event.wikidata_id == wid)
                )
                if existing.scalar_one_or_none():
                    continue
                
                country_id = await self.get_country_id(evt.get("location_name"))
                
                event = Event(
                    wikidata_id=wid,
                    title=evt["title"],
                    start_date=self.parse_date(evt.get("start_date")),
                    end_date=self.parse_date(evt.get("end_date")),
                    category=evt.get("category", "political"),
                    event_type=evt.get("event_type"),
                    location_name=evt.get("location_name"),
                    description=evt.get("description"),
                    primary_country_id=country_id,
                    tags=["historical", "leftist"],
                )
                
                self.db.add(event)
                imported += 1
            except Exception as e:
                print(f"  Error importing {evt.get('title')}: {e}")
        
        await self.db.commit()
        return imported

    async def import_books(self) -> int:
        imported = 0
        for bk in LEFTIST_BOOKS:
            try:
                wid = bk.get("wikidata_id", "")
                if not wid:
                    continue
                
                existing = await self.db.execute(
                    select(Book.id).where(Book.wikidata_id == wid)
                )
                if existing.scalar_one_or_none():
                    continue
                
                book = Book(
                    wikidata_id=wid,
                    title=bk["title"],
                    publication_year=bk.get("publication_year"),
                    book_type=bk.get("book_type"),
                    topics=bk.get("topics", []),
                    marxists_archive_url=bk.get("marxists_url"),
                )
                
                self.db.add(book)
                await self.db.flush()
                
                # Link authors
                for author_wid in bk.get("authors", []):
                    result = await self.db.execute(
                        select(Person.id).where(Person.wikidata_id == author_wid)
                    )
                    person_id = result.scalar_one_or_none()
                    if person_id:
                        self.db.add(BookAuthor(book_id=book.id, person_id=person_id, role="author"))
                
                imported += 1
            except Exception as e:
                print(f"  Error importing {bk.get('title')}: {e}")
        
        await self.db.commit()
        return imported

    async def run(self):
        print("=" * 60)
        print("STATIC DATA IMPORT")
        print("=" * 60)
        
        print("\n1. Importing leftist figures...")
        c = await self.import_figures()
        print(f"   Imported {c} people")
        
        print("\n2. Importing historical events...")
        c = await self.import_events()
        print(f"   Imported {c} events")
        
        print("\n3. Importing books...")
        c = await self.import_books()
        print(f"   Imported {c} books")
        
        print("\n" + "=" * 60)
        print("IMPORT COMPLETE!")
        print("=" * 60)


async def main():
    async with async_session_maker() as session:
        imp = StaticDataImporter(session)
        await imp.run()


if __name__ == "__main__":
    asyncio.run(main())
