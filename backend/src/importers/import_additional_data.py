"""Import additional curated data."""
import asyncio
import uuid
from datetime import date

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.src.database import async_session_maker
from backend.src.events.models import Event, Conflict
from backend.src.people.models import Person, Book
from backend.src.importers.additional_data import ADDITIONAL_EVENTS, ADDITIONAL_PEOPLE, ADDITIONAL_BOOKS


def parse_date(date_str):
    if not date_str:
        return None
    try:
        parts = date_str.split("-")
        return date(int(parts[0]), int(parts[1]), int(parts[2]))
    except:
        return None


async def import_events():
    count = 0
    async with async_session_maker() as session:
        for e in ADDITIONAL_EVENTS:
            existing = await session.execute(
                select(Event).where(Event.title == e["title"])
            )
            if existing.scalar_one_or_none():
                continue

            await session.execute(
                text("""
                    INSERT INTO events (id, title, description, start_date, category, tags)
                    VALUES (:id, :title, :description, :start_date, :category, :tags)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "title": e["title"],
                    "description": e["description"],
                    "start_date": parse_date(e.get("date")),
                    "category": e.get("category", "political"),
                    "tags": e.get("tags", [])
                }
            )
            count += 1
        await session.commit()
    print(f"Imported {count} events")
    return count


async def import_people():
    count = 0
    async with async_session_maker() as session:
        for p in ADDITIONAL_PEOPLE:
            existing = await session.execute(
                select(Person).where(Person.name == p["name"])
            )
            if existing.scalar_one_or_none():
                continue

            await session.execute(
                text("""
                    INSERT INTO people (id, name, bio_short, birth_date, death_date, person_types, ideology_tags)
                    VALUES (:id, :name, :bio_short, :birth_date, :death_date, :person_types, :ideology_tags)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "name": p["name"],
                    "bio_short": p.get("bio_short"),
                    "birth_date": parse_date(p.get("birth_date")),
                    "death_date": parse_date(p.get("death_date")),
                    "person_types": p.get("person_types", []),
                    "ideology_tags": p.get("ideology_tags", [])
                }
            )
            count += 1
        await session.commit()
    print(f"Imported {count} people")
    return count


async def import_books():
    count = 0
    async with async_session_maker() as session:
        for b in ADDITIONAL_BOOKS:
            existing = await session.execute(
                select(Book).where(Book.title == b["title"])
            )
            if existing.scalar_one_or_none():
                continue

            await session.execute(
                text("""
                    INSERT INTO books (id, title, description, publication_year, book_type, topics)
                    VALUES (:id, :title, :description, :publication_year, :book_type, :topics)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "title": b["title"],
                    "description": b.get("description"),
                    "publication_year": b.get("publication_year"),
                    "book_type": b.get("book_type"),
                    "topics": b.get("topics", [])
                }
            )
            count += 1
        await session.commit()
    print(f"Imported {count} books")
    return count


async def main():
    print("Importing additional data...")
    await import_events()
    await import_people()
    await import_books()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(main())
