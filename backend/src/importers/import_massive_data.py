import asyncio
import json
import uuid
from pathlib import Path
from datetime import date
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/historical_map")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped"


def parse_date(date_str):
    if not date_str:
        return None
    try:
        parts = date_str.split("-")
        year = int(parts[0])
        month = int(parts[1]) if len(parts) > 1 else 1
        day = int(parts[2]) if len(parts) > 2 else 1
        if year < 1 or year > 2030:
            return None
        if month < 1 or month > 12:
            month = 1
        if day < 1 or day > 31:
            day = 1
        return date(year, month, day)
    except:
        return None


async def import_authors():
    authors_file = DATA_DIR / "more_authors.json"
    if not authors_file.exists():
        print("more_authors.json not found")
        return 0

    with open(authors_file) as f:
        authors = json.load(f)

    print(f"Found {len(authors)} authors to import")
    imported = 0
    skipped = 0

    async with async_session() as session:
        result = await session.execute(text("SELECT wikidata_id FROM people WHERE wikidata_id IS NOT NULL"))
        existing_ids = {row[0] for row in result}
        print(f"  {len(existing_ids)} people already in database")

        for author in authors:
            wid = author.get("wikidata_id")
            if not wid or wid in existing_ids:
                skipped += 1
                continue

            birth_date = parse_date(author.get("birth_date"))
            death_date = parse_date(author.get("death_date"))

            await session.execute(
                text("INSERT INTO people (id, wikidata_id, name, birth_date, death_date, birth_place, bio_short, person_types, ideology_tags, created_at, updated_at) VALUES (:id, :wikidata_id, :name, :birth_date, :death_date, :birth_place, :bio_short, :person_types, :ideology_tags, NOW(), NOW()) ON CONFLICT DO NOTHING"),
                {"id": uuid.uuid4(), "wikidata_id": wid, "name": (author.get("name") or "")[:500], "birth_date": birth_date, "death_date": death_date, "birth_place": (author.get("birth_place") or "")[:500], "bio_short": (author.get("description") or "")[:1000], "person_types": author.get("person_types", []), "ideology_tags": []}
            )

            imported += 1
            if imported % 2000 == 0:
                await session.commit()
                print(f"  Imported {imported} authors...")

        await session.commit()

    print(f"Imported {imported} new authors, skipped {skipped}")
    return imported


async def import_books():
    books_file = DATA_DIR / "more_books.json"
    if not books_file.exists():
        print("more_books.json not found")
        return 0

    with open(books_file) as f:
        books = json.load(f)

    print(f"Found {len(books)} books to import")
    imported = 0
    skipped = 0

    async with async_session() as session:
        result = await session.execute(text("SELECT wikidata_id FROM books WHERE wikidata_id IS NOT NULL"))
        existing_ids = {row[0] for row in result}
        print(f"  {len(existing_ids)} books already in database")

        for book in books:
            wid = book.get("wikidata_id")
            if not wid or wid in existing_ids:
                skipped += 1
                continue

            await session.execute(
                text("INSERT INTO books (id, wikidata_id, title, publication_year, description, book_type, topics, created_at) VALUES (:id, :wikidata_id, :title, :publication_year, :description, :book_type, :topics, NOW()) ON CONFLICT DO NOTHING"),
                {"id": uuid.uuid4(), "wikidata_id": wid, "title": (book.get("title") or "")[:500], "publication_year": book.get("publication_year"), "description": (book.get("description") or "")[:2000], "book_type": book.get("book_type", "theory"), "topics": book.get("topics", [])}
            )

            imported += 1
            if imported % 500 == 0:
                await session.commit()
                print(f"  Imported {imported} books...")

        await session.commit()

    print(f"Imported {imported} new books, skipped {skipped}")
    return imported


async def import_conflicts():
    conflicts_file = DATA_DIR / "all_conflicts.json"
    if not conflicts_file.exists():
        print("all_conflicts.json not found")
        return 0

    with open(conflicts_file) as f:
        conflicts = json.load(f)

    print(f"Found {len(conflicts)} conflicts to import")
    imported = 0
    skipped = 0

    async with async_session() as session:
        result = await session.execute(text("SELECT wikidata_id FROM conflicts WHERE wikidata_id IS NOT NULL"))
        existing_ids = {row[0] for row in result}
        print(f"  {len(existing_ids)} conflicts already in database")

        type_mapping = {"war": "interstate", "civil_war": "intrastate", "battle": "battle", "rebellion": "intrastate", "revolution": "intrastate", "coup": "coup", "military_operation": "military_operation", "insurgency": "intrastate", "massacre": "one_sided", "armed_conflict": "other", "siege": "battle"}

        for conflict in conflicts:
            wid = conflict.get("wikidata_id")
            if not wid or wid in existing_ids:
                skipped += 1
                continue

            start_date = parse_date(conflict.get("start_date"))
            end_date = parse_date(conflict.get("end_date"))
            mapped_type = type_mapping.get(conflict.get("conflict_type", "other"), "other")

            await session.execute(
                text("INSERT INTO conflicts (id, wikidata_id, name, start_date, end_date, conflict_type, description, casualties, created_at, updated_at) VALUES (:id, :wikidata_id, :name, :start_date, :end_date, :conflict_type, :description, :casualties, NOW(), NOW()) ON CONFLICT DO NOTHING"),
                {"id": uuid.uuid4(), "wikidata_id": wid, "name": (conflict.get("name") or "")[:500], "start_date": start_date, "end_date": end_date, "conflict_type": mapped_type, "description": (conflict.get("description") or "")[:2000], "casualties": conflict.get("casualties")}
            )

            imported += 1
            if imported % 1000 == 0:
                await session.commit()
                print(f"  Imported {imported} conflicts...")

        await session.commit()

    print(f"Imported {imported} new conflicts, skipped {skipped}")
    return imported


async def main():
    print("=" * 70)
    print("MASSIVE DATA IMPORT")
    print("=" * 70)
    total = 0
    print("[1/3] Importing authors...")
    total += await import_authors()
    print("[2/3] Importing books...")
    total += await import_books()
    print("[3/3] Importing conflicts...")
    total += await import_conflicts()
    print("=" * 70)
    print(f"TOTAL IMPORTED: {total}")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())