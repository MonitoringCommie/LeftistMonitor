#!/usr/bin/env python3
"""Fix Wikidata IDs and fetch images."""

import asyncio
import aiohttp
import asyncpg
import urllib.parse

DATABASE_URL = "postgresql://linusgollnow@localhost:5432/leftist_monitor"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

async def search_person_wikidata(session, name):
    """Search for a person's Wikidata ID by name."""
    params = {
        "action": "wbsearchentities",
        "search": name,
        "language": "en",
        "type": "item",
        "limit": 1,
        "format": "json"
    }
    headers = {"User-Agent": "LeftistMonitor/1.0 (Educational)"}
    
    try:
        async with session.get(WIKIDATA_API, params=params, headers=headers) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            results = data.get("search", [])
            if results:
                return results[0]["id"]
    except:
        pass
    return None


async def get_image_for_id(session, wikidata_id):
    """Get image URL for a Wikidata ID."""
    params = {
        "action": "wbgetentities",
        "ids": wikidata_id,
        "props": "claims",
        "format": "json"
    }
    headers = {"User-Agent": "LeftistMonitor/1.0 (Educational)"}
    
    try:
        async with session.get(WIKIDATA_API, params=params, headers=headers) as resp:
            if resp.status != 200:
                return None
            data = await resp.json()
            entity = data.get("entities", {}).get(wikidata_id, {})
            claims = entity.get("claims", {})
            if "P18" in claims:
                filename = claims["P18"][0]["mainsnak"]["datavalue"]["value"]
                filename_encoded = urllib.parse.quote(filename.replace(" ", "_"))
                return f"https://commons.wikimedia.org/wiki/Special:FilePath/{filename_encoded}?width=300"
    except:
        pass
    return None


async def process_people(conn, session, limit=500):
    """Process people: verify/fix wikidata ID and fetch image."""
    
    # Get people without images
    rows = await conn.fetch("""
        SELECT id, name, wikidata_id 
        FROM people 
        WHERE (image_url IS NULL OR image_url = '')
        ORDER BY name
        LIMIT $1
    """, limit)
    
    if not rows:
        print("No more people to process")
        return 0
    
    print(f"Processing {len(rows)} people...")
    updated = 0
    
    for i, row in enumerate(rows):
        name = row['name']
        
        # Search for correct wikidata ID
        correct_wid = await search_person_wikidata(session, name)
        
        if correct_wid:
            # Get image for this ID
            image_url = await get_image_for_id(session, correct_wid)
            
            if image_url:
                try:
                    await conn.execute("""
                        UPDATE people 
                        SET wikidata_id = $1, image_url = $2 
                        WHERE id = $3
                    """, correct_wid, image_url, row['id'])
                    updated += 1
                    if updated % 20 == 0:
                        print(f"  Updated {updated} people with images...")
                except Exception as e:
                    print(f"  Error updating {name}: {e}")
        
        # Rate limiting - be gentle with Wikidata
        if i % 5 == 0:
            await asyncio.sleep(0.3)
    
    return updated


async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    async with aiohttp.ClientSession() as session:
        total = 0
        
        for batch in range(20):  # 20 batches of 500 = 10000 people max
            print(f"\n=== Batch {batch + 1} ===")
            updated = await process_people(conn, session, limit=500)
            total += updated
            print(f"Batch complete: {updated} updated, Total: {total}")
            
            if updated == 0:
                break
            
            await asyncio.sleep(2)  # Pause between batches
        
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
