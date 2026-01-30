import asyncio
import uuid
from datetime import date
from src.database import async_session_maker
from src.importers.more_static_data import MORE_EVENTS, MORE_PEOPLE, MORE_BOOKS
from sqlalchemy import text

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
        for e in MORE_EVENTS:
            existing = await session.execute(
                text("SELECT id FROM events WHERE title = :title"),
                {"title": e["title"]}
            )
            if existing.fetchone():
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
            print(f"  Event: {e['title']}")
        
        await session.commit()
    return count

async def import_people():
    count = 0
    async with async_session_maker() as session:
        for p in MORE_PEOPLE:
            existing = await session.execute(
                text("SELECT id FROM people WHERE name = :name"),
                {"name": p["name"]}
            )
            if existing.fetchone():
                continue
            
            await session.execute(
                text("""
                    INSERT INTO people (id, name, birth_date, death_date, bio_short, person_types, ideology_tags)
                    VALUES (:id, :name, :birth_date, :death_date, :bio_short, :person_types, :ideology_tags)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "name": p["name"],
                    "birth_date": parse_date(p.get("birth_date")),
                    "death_date": parse_date(p.get("death_date")),
                    "bio_short": p.get("bio", "")[:500],
                    "person_types": p.get("person_type", []),
                    "ideology_tags": p.get("ideology_tags", [])
                }
            )
            count += 1
            print(f"  Person: {p['name']}")
        
        await session.commit()
    return count

async def import_books():
    count = 0
    async with async_session_maker() as session:
        for b in MORE_BOOKS:
            existing = await session.execute(
                text("SELECT id FROM books WHERE title = :title"),
                {"title": b["title"]}
            )
            if existing.fetchone():
                continue
            
            await session.execute(
                text("""
                    INSERT INTO books (id, title, publication_year, topics, significance, description, marxists_archive_url)
                    VALUES (:id, :title, :year, :topics, :significance, :description, :marxists_url)
                """),
                {
                    "id": str(uuid.uuid4()),
                    "title": b["title"],
                    "year": b.get("year"),
                    "topics": b.get("topics", []),
                    "significance": b.get("significance", ""),
                    "description": f"By {b.get('author', 'Unknown')}",
                    "marxists_url": b.get("marxists_url")
                }
            )
            count += 1
            print(f"  Book: {b['title']}")
        
        await session.commit()
    return count

async def main():
    print("=" * 60)
    print("IMPORTING MORE STATIC DATA")
    print("=" * 60)
    
    print("\n1. Importing events...")
    events = await import_events()
    
    print("\n2. Importing people...")
    people = await import_people()
    
    print("\n3. Importing books...")
    books = await import_books()
    
    print("\n" + "=" * 60)
    print(f"IMPORTED: {events} events, {people} people, {books} books")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
