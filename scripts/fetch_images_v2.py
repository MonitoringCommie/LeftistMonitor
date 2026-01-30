#!/usr/bin/env python3
"""Fetch images from Wikidata using the API instead of SPARQL."""

import asyncio
import aiohttp
import asyncpg
import json

DATABASE_URL = "postgresql://linusgollnow@localhost:5432/leftist_monitor"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

async def get_images_from_wikidata(session, wikidata_ids):
    """Fetch images for a batch of Wikidata IDs using the API."""
    
    params = {
        "action": "wbgetentities",
        "ids": "|".join(wikidata_ids),
        "props": "claims",
        "format": "json"
    }
    
    headers = {
        "User-Agent": "LeftistMonitor/1.0 (https://github.com/leftist-monitor; contact@example.com) Python/3.11"
    }
    
    try:
        async with session.get(WIKIDATA_API, params=params, headers=headers) as response:
            if response.status != 200:
                print(f"API request failed: {response.status}")
                return {}
            data = await response.json()
    except Exception as e:
        print(f"Error fetching from Wikidata API: {e}")
        return {}
    
    image_map = {}
    entities = data.get("entities", {})
    
    for wid, entity in entities.items():
        claims = entity.get("claims", {})
        # P18 is the image property
        if "P18" in claims:
            image_claim = claims["P18"][0]
            if "mainsnak" in image_claim and "datavalue" in image_claim["mainsnak"]:
                filename = image_claim["mainsnak"]["datavalue"]["value"]
                # Convert filename to URL
                filename_encoded = filename.replace(" ", "_")
                # Wikimedia Commons URL format
                image_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename_encoded}?width=300"
                image_map[wid] = image_url
    
    return image_map


async def fetch_person_images(conn, session, batch_size=50):
    """Fetch images for people who have wikidata_id but no image."""
    
    rows = await conn.fetch("""
        SELECT id, wikidata_id, name 
        FROM people 
        WHERE wikidata_id IS NOT NULL 
          AND wikidata_id != ''
          AND (image_url IS NULL OR image_url = '')
        LIMIT $1
    """, batch_size)
    
    if not rows:
        return 0
    
    wikidata_ids = [row['wikidata_id'] for row in rows]
    image_map = await get_images_from_wikidata(session, wikidata_ids)
    
    updated = 0
    for row in rows:
        wid = row['wikidata_id']
        if wid in image_map:
            try:
                await conn.execute("""
                    UPDATE people SET image_url = $1 WHERE id = $2
                """, image_map[wid], row['id'])
                updated += 1
            except Exception as e:
                print(f"Error updating {row['name']}: {e}")
    
    return updated


async def fetch_book_covers(conn, session, batch_size=50):
    """Fetch covers for books who have wikidata_id but no cover."""
    
    rows = await conn.fetch("""
        SELECT id, wikidata_id, title 
        FROM books 
        WHERE wikidata_id IS NOT NULL 
          AND wikidata_id != ''
          AND (cover_url IS NULL OR cover_url = '')
        LIMIT $1
    """, batch_size)
    
    if not rows:
        return 0
    
    wikidata_ids = [row['wikidata_id'] for row in rows]
    image_map = await get_images_from_wikidata(session, wikidata_ids)
    
    updated = 0
    for row in rows:
        wid = row['wikidata_id']
        if wid in image_map:
            try:
                await conn.execute("""
                    UPDATE books SET cover_url = $1 WHERE id = $2
                """, image_map[wid], row['id'])
                updated += 1
            except Exception as e:
                print(f"Error updating {row['title']}: {e}")
    
    return updated


async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    async with aiohttp.ClientSession() as session:
        total_people = 0
        total_books = 0
        
        print("\n=== Fetching People Images ===")
        for i in range(100):  # Up to 100 batches of 50 = 5000 people
            updated = await fetch_person_images(conn, session, batch_size=50)
            total_people += updated
            if updated == 0 and i > 0:
                # No more images found, but there might be more people
                # Check if we still have people without images
                remaining = await conn.fetchval("""
                    SELECT COUNT(*) FROM people 
                    WHERE wikidata_id IS NOT NULL 
                      AND wikidata_id != ''
                      AND (image_url IS NULL OR image_url = '')
                """)
                if remaining == 0:
                    break
            if i % 10 == 0:
                print(f"Batch {i+1}: Updated {total_people} people so far...")
            await asyncio.sleep(0.5)  # Rate limiting
        
        print(f"Finished people: {total_people} updated")
        
        print("\n=== Fetching Book Covers ===")
        for i in range(40):  # Up to 40 batches of 50 = 2000 books
            updated = await fetch_book_covers(conn, session, batch_size=50)
            total_books += updated
            if updated == 0 and i > 0:
                remaining = await conn.fetchval("""
                    SELECT COUNT(*) FROM books 
                    WHERE wikidata_id IS NOT NULL 
                      AND wikidata_id != ''
                      AND (cover_url IS NULL OR cover_url = '')
                """)
                if remaining == 0:
                    break
            if i % 10 == 0:
                print(f"Batch {i+1}: Updated {total_books} books so far...")
            await asyncio.sleep(0.5)  # Rate limiting
        
        print(f"Finished books: {total_books} updated")
        
        print(f"\n=== Summary ===")
        
        people_with_images = await conn.fetchval(
            "SELECT COUNT(*) FROM people WHERE image_url IS NOT NULL AND image_url != ''"
        )
        people_total = await conn.fetchval("SELECT COUNT(*) FROM people")
        books_with_covers = await conn.fetchval(
            "SELECT COUNT(*) FROM books WHERE cover_url IS NOT NULL AND cover_url != ''"
        )
        books_total = await conn.fetchval("SELECT COUNT(*) FROM books")
        
        print(f"People with images: {people_with_images} / {people_total} ({100*people_with_images/people_total:.1f}%)")
        print(f"Books with covers: {books_with_covers} / {books_total} ({100*books_with_covers/books_total:.1f}%)")
    
    await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
