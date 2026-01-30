
import asyncio
import json
import uuid
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/historical_map")

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def find_or_create_author(session, author_name):
    """Find an existing person by name or create a new one."""
    # Try to find existing person
    result = await session.execute(
        text("SELECT id FROM people WHERE name ILIKE :name"),
        {"name": author_name}
    )
    person_id = result.scalar()
    
    if person_id:
        return person_id
    
    # Create new person (use correct column names: person_types, not person_type)
    person_id = uuid.uuid4()
    await session.execute(
        text("""
            INSERT INTO people (id, name, person_types, ideology_tags, created_at, updated_at)
            VALUES (:id, :name, :person_types, :ideology_tags, NOW(), NOW())
        """),
        {
            "id": person_id,
            "name": author_name,
            "person_types": ["writer", "intellectual"],
            "ideology_tags": ["leftist"]
        }
    )
    return person_id


async def import_curated_books():
    books_file = Path(__file__).parent.parent.parent.parent / "data" / "scraped" / "curated_leftist_books.json"
    
    if not books_file.exists():
        print(f"Books file not found: {books_file}")
        return 0
    
    with open(books_file) as f:
        books = json.load(f)
    
    print(f"Found {len(books)} curated books to import")
    
    imported = 0
    skipped = 0
    
    async with async_session() as session:
        for book in books:
            # Check if book already exists by title
            result = await session.execute(
                text("SELECT id FROM books WHERE title = :title"),
                {"title": book["title"]}
            )
            existing_book = result.scalar()
            
            if existing_book:
                skipped += 1
                continue
            
            # Create the book
            book_id = uuid.uuid4()
            topics = book.get("topics", [])
            
            await session.execute(
                text("""
                    INSERT INTO books (id, title, publication_year, description,
                                      book_type, topics, significance, marxists_archive_url,
                                      created_at)
                    VALUES (:id, :title, :publication_year, :description,
                           :book_type, :topics, :significance, :marxists_archive_url,
                           NOW())
                """),
                {
                    "id": book_id,
                    "title": book["title"],
                    "publication_year": book.get("publication_year"),
                    "description": book.get("description", ""),
                    "book_type": book.get("book_type", "theory"),
                    "topics": topics,
                    "significance": book.get("significance", "major"),
                    "marxists_archive_url": book.get("marxists_archive_url")
                }
            )
            
            # Handle authors (can be multiple, separated by " and ")
            author_str = book.get("author", "")
            authors = [a.strip() for a in author_str.replace(" and ", "|").replace(", ", "|").split("|") if a.strip()]
            
            for author_name in authors:
                # Skip "with" collaborators for simplicity
                if " with " in author_name:
                    author_name = author_name.split(" with ")[0]
                
                person_id = await find_or_create_author(session, author_name)
                
                # Link author to book
                await session.execute(
                    text("""
                        INSERT INTO book_authors (id, book_id, person_id, role)
                        VALUES (:id, :book_id, :person_id, :role)
                        ON CONFLICT DO NOTHING
                    """),
                    {
                        "id": uuid.uuid4(),
                        "book_id": book_id,
                        "person_id": person_id,
                        "role": "author"
                    }
                )
            
            imported += 1
            
            if imported % 10 == 0:
                print(f"  Imported {imported} books...")
        
        await session.commit()
    
    print(f"Imported {imported} new books, skipped {skipped} existing")
    return imported


async def main():
    print("=" * 60)
    print("Importing Curated Leftist Books")
    print("=" * 60)
    
    total = await import_curated_books()
    
    print("=" * 60)
    print(f"Total imported: {total}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
