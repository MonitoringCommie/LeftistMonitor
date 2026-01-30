#!/usr/bin/env python3
"""Fetch images from Wikidata for people and books."""

import asyncio
import aiohttp
import asyncpg

DATABASE_URL = "postgresql://linusgollnow@localhost:5432/leftist_monitor"
WIKIDATA_SPARQL = "https://query.wikidata.org/sparql"

async def fetch_person_images(conn, session, batch_size=100):
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
        print("No more people to fetch images for")
        return 0
    
    print(f"Fetching images for {len(rows)} people...")
    
    wikidata_ids = [row['wikidata_id'] for row in rows]
    values = " ".join([f"wd:{wid}" for wid in wikidata_ids])
    
    query = f"""
    SELECT ?item ?image WHERE {{
        VALUES ?item {{ {values} }}
        ?item wdt:P18 ?image .
    }}
    """
    
    try:
        async with session.get(
            WIKIDATA_SPARQL,
            params={"query": query, "format": "json"},
            headers={"User-Agent": "LeftistMonitor/1.0 (Educational project)"}
        ) as response:
            if response.status != 200:
                print(f"SPARQL query failed: {response.status}")
                return 0
            data = await response.json()
    except Exception as e:
        print(f"Error fetching from Wikidata: {e}")
        return 0
    
    image_map = {}
    for result in data.get("results", {}).get("bindings", []):
        item = result.get("item", {}).get("value", "").split("/")[-1]
        image = result.get("image", {}).get("value", "")
        if item and image:
            image_map[item] = image
    
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
    
    print(f"Updated {updated} people with images")
    return updated


async def fetch_book_covers(conn, session, batch_size=100):
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
        print("No more books to fetch covers for")
        return 0
    
    print(f"Fetching covers for {len(rows)} books...")
    
    wikidata_ids = [row['wikidata_id'] for row in rows]
    values = " ".join([f"wd:{wid}" for wid in wikidata_ids])
    
    query = f"""
    SELECT ?item ?image WHERE {{
        VALUES ?item {{ {values} }}
        {{ ?item wdt:P18 ?image . }}
        UNION
        {{ ?item wdt:P996 ?image . }}
    }}
    """
    
    try:
        async with session.get(
            WIKIDATA_SPARQL,
            params={"query": query, "format": "json"},
            headers={"User-Agent": "LeftistMonitor/1.0 (Educational project)"}
        ) as response:
            if response.status != 200:
                print(f"SPARQL query failed: {response.status}")
                return 0
            data = await response.json()
    except Exception as e:
        print(f"Error fetching from Wikidata: {e}")
        return 0
    
    image_map = {}
    for result in data.get("results", {}).get("bindings", []):
        item = result.get("item", {}).get("value", "").split("/")[-1]
        image = result.get("image", {}).get("value", "")
        if item and image:
            image_map[item] = image
    
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
    
    print(f"Updated {updated} books with covers")
    return updated


async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    async with aiohttp.ClientSession() as session:
        total_people = 0
        total_books = 0
        
        print("\n=== Fetching People Images ===")
        for i in range(50):
            updated = await fetch_person_images(conn, session, batch_size=100)
            total_people += updated
            if updated == 0:
                break
            print(f"Batch {i+1}: Total people updated so far: {total_people}")
            await asyncio.sleep(1.5)
        
        print("\n=== Fetching Book Covers ===")
        for i in range(20):
            updated = await fetch_book_covers(conn, session, batch_size=100)
            total_books += updated
            if updated == 0:
                break
            print(f"Batch {i+1}: Total books updated so far: {total_books}")
            await asyncio.sleep(1.5)
        
        print(f"\n=== Summary ===")
        print(f"Total people with new images: {total_people}")
        print(f"Total books with new covers: {total_books}")
        
        people_with_images = await conn.fetchval(
            "SELECT COUNT(*) FROM people WHERE image_url IS NOT NULL AND image_url != ''"
        )
        people_total = await conn.fetchval("SELECT COUNT(*) FROM people")
        books_with_covers = await conn.fetchval(
            "SELECT COUNT(*) FROM books WHERE cover_url IS NOT NULL AND cover_url != ''"
        )
        books_total = await conn.fetchval("SELECT COUNT(*) FROM books")
        
        print(f"\nPeople with images: {people_with_images} / {people_total} ({100*people_with_images/people_total:.1f}%)")
        print(f"Books with covers: {books_with_covers} / {books_total} ({100*books_with_covers/books_total:.1f}%)")
    
    await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
