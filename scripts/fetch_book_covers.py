#!/usr/bin/env python3
"""Fetch book covers from Wikidata using existing IDs."""

import asyncio
import asyncpg
import subprocess
import json
import urllib.parse
import sys

DATABASE_URL = "postgresql://leftist:leftist_dev_password@localhost:5432/leftist_monitor"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

def curl_get(url):
    """Use curl to fetch data."""
    result = subprocess.run(
        ["curl", "-s", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", url],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout

async def process_batch(conn, limit=200):
    """Process a batch of books."""
    # Get books with wikidata_id but no cover
    rows = await conn.fetch("""
        SELECT id, wikidata_id, title 
        FROM books 
        WHERE wikidata_id IS NOT NULL 
          AND wikidata_id ~ '^Q[0-9]+$'
          AND (cover_url IS NULL OR cover_url = '')
        LIMIT $1
    """, limit)
    
    if not rows:
        return 0
    
    print(f"Processing {len(rows)} books...")
    sys.stdout.flush()
    
    updated = 0
    
    for i, row in enumerate(rows):
        wid = row['wikidata_id']
        
        try:
            # Get entity with image
            entity_url = f"{WIKIDATA_API}?action=wbgetentities&ids={wid}&props=claims&format=json"
            entity_data = json.loads(curl_get(entity_url))
            entity = entity_data.get("entities", {}).get(wid, {})
            claims = entity.get("claims", {})
            
            # Check for image (P18) or cover art (P996 for scanned works)
            image_prop = None
            if "P18" in claims:
                image_prop = "P18"
            elif "P996" in claims:
                image_prop = "P996"
            
            if not image_prop:
                continue
                
            filename = claims[image_prop][0]["mainsnak"]["datavalue"]["value"]
            filename_encoded = urllib.parse.quote(filename.replace(" ", "_"))
            cover_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename_encoded}?width=300"
            
            # Update database
            await conn.execute(
                "UPDATE books SET cover_url = $1 WHERE id = $2",
                cover_url, row['id']
            )
            updated += 1
            
        except Exception as e:
            pass
        
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(rows)}: {updated} updated")
            sys.stdout.flush()
        
        await asyncio.sleep(0.05)
    
    return updated


async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    total_updated = 0
    
    for batch in range(30):  # 30 batches of 200 = 6000 books max
        print(f"\n=== Batch {batch + 1} ===")
        sys.stdout.flush()
        
        updated = await process_batch(conn, limit=200)
        total_updated += updated
        
        print(f"Batch: {updated} updated, Total: {total_updated}")
        sys.stdout.flush()
        
        if updated == 0:
            remaining = await conn.fetchval("""
                SELECT COUNT(*) FROM books 
                WHERE wikidata_id IS NOT NULL 
                  AND wikidata_id ~ '^Q[0-9]+$'
                  AND (cover_url IS NULL OR cover_url = '')
            """)
            print(f"Remaining without covers: {remaining}")
            if remaining == 0:
                break
        
        await asyncio.sleep(0.5)
    
    # Final stats
    with_covers = await conn.fetchval(
        "SELECT COUNT(*) FROM books WHERE cover_url IS NOT NULL AND cover_url != ''"
    )
    total_books = await conn.fetchval("SELECT COUNT(*) FROM books")
    
    print(f"\n=== Final Stats ===")
    print(f"Books with covers: {with_covers} / {total_books} ({100*with_covers/total_books:.1f}%)")
    
    await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
