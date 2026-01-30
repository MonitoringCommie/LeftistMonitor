#!/usr/bin/env python3
"""Fetch images from Wikidata using curl."""

import asyncio
import asyncpg
import subprocess
import json
import urllib.parse
import sys

DATABASE_URL = "postgresql://linusgollnow@localhost:5432/leftist_monitor"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

def curl_get(url):
    """Use curl to fetch data."""
    result = subprocess.run(
        ["curl", "-s", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", url],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout

async def process_batch(conn, limit=1000):
    """Process a batch of people."""
    rows = await conn.fetch("""
        SELECT id, name, wikidata_id 
        FROM people 
        WHERE (image_url IS NULL OR image_url = '')
        LIMIT $1
    """, limit)
    
    if not rows:
        return 0
    
    print(f"Processing {len(rows)} people...")
    sys.stdout.flush()
    
    updated = 0
    for i, row in enumerate(rows):
        name = row['name']
        
        try:
            # Search for person
            search_url = f"{WIKIDATA_API}?action=wbsearchentities&search={urllib.parse.quote(name)}&language=en&type=item&limit=1&format=json"
            data = json.loads(curl_get(search_url))
            results = data.get("search", [])
            if not results:
                continue
            wid = results[0]["id"]
            
            # Get entity with image
            entity_url = f"{WIKIDATA_API}?action=wbgetentities&ids={wid}&props=claims&format=json"
            data = json.loads(curl_get(entity_url))
            entity = data.get("entities", {}).get(wid, {})
            claims = entity.get("claims", {})
            if "P18" not in claims:
                continue
            filename = claims["P18"][0]["mainsnak"]["datavalue"]["value"]
            filename_encoded = urllib.parse.quote(filename.replace(" ", "_"))
            image_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename_encoded}?width=300"
            
            # Update database
            await conn.execute(
                "UPDATE people SET wikidata_id = $1, image_url = $2 WHERE id = $3",
                wid, image_url, row['id']
            )
            updated += 1
            
        except Exception as e:
            pass
        
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(rows)}, updated {updated}...")
            sys.stdout.flush()
        
        await asyncio.sleep(0.05)
    
    return updated


async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    total_updated = 0
    
    for batch in range(20):  # 20 batches of 1000 = 20000 people max
        print(f"\n=== Batch {batch + 1} ===")
        sys.stdout.flush()
        
        updated = await process_batch(conn, limit=1000)
        total_updated += updated
        
        print(f"Batch complete: {updated} updated, Total: {total_updated}")
        sys.stdout.flush()
        
        if updated == 0:
            # Check if there are more people without images
            remaining = await conn.fetchval("""
                SELECT COUNT(*) FROM people 
                WHERE (image_url IS NULL OR image_url = '')
            """)
            print(f"Remaining without images: {remaining}")
            if remaining == 0:
                break
        
        await asyncio.sleep(1)
    
    # Final stats
    with_images = await conn.fetchval(
        "SELECT COUNT(*) FROM people WHERE image_url IS NOT NULL AND image_url != ''"
    )
    total_people = await conn.fetchval("SELECT COUNT(*) FROM people")
    
    print(f"\n=== Final Stats ===")
    print(f"People with images: {with_images} / {total_people} ({100*with_images/total_people:.1f}%)")
    
    await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
