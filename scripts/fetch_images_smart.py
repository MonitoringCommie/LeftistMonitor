#!/usr/bin/env python3
"""Fetch images from Wikidata with smarter matching."""

import asyncio
import asyncpg
import subprocess
import json
import urllib.parse
import sys
import re

DATABASE_URL = "postgresql://linusgollnow@localhost:5432/leftist_monitor"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

# Classes that represent people
PERSON_CLASSES = {'Q5', 'Q215627', 'Q3778211'}  # human, person, work of literature author

def curl_get(url):
    """Use curl to fetch data."""
    result = subprocess.run(
        ["curl", "-s", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", url],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout

def is_person_entity(claims):
    """Check if the entity is a person (has P31 = Q5 or similar)."""
    if 'P31' not in claims:
        return False
    for claim in claims['P31']:
        try:
            entity_id = claim['mainsnak']['datavalue']['value']['id']
            if entity_id in PERSON_CLASSES:
                return True
        except:
            pass
    return False

def get_birth_year(claims):
    """Extract birth year from claims."""
    if 'P569' not in claims:  # P569 is date of birth
        return None
    try:
        time_str = claims['P569'][0]['mainsnak']['datavalue']['value']['time']
        # Format is like "+1818-05-05T00:00:00Z"
        match = re.search(r'([+-]?\d+)-', time_str)
        if match:
            return int(match.group(1))
    except:
        pass
    return None

async def process_batch(conn, limit=500):
    """Process a batch of people."""
    rows = await conn.fetch("""
        SELECT id, name, wikidata_id, birth_date
        FROM people 
        WHERE (image_url IS NULL OR image_url = '')
        LIMIT $1
    """, limit)
    
    if not rows:
        return 0
    
    print(f"Processing {len(rows)} people...")
    sys.stdout.flush()
    
    updated = 0
    skipped_not_person = 0
    skipped_no_image = 0
    skipped_no_match = 0
    
    for i, row in enumerate(rows):
        name = row['name']
        db_birth_year = None
        if row['birth_date']:
            try:
                db_birth_year = row['birth_date'].year
            except:
                pass
        
        try:
            # Search for person
            search_url = f"{WIKIDATA_API}?action=wbsearchentities&search={urllib.parse.quote(name)}&language=en&type=item&limit=3&format=json"
            data = json.loads(curl_get(search_url))
            results = data.get("search", [])
            if not results:
                skipped_no_match += 1
                continue
            
            # Try each result to find a valid person
            found = False
            for result in results:
                wid = result["id"]
                
                # Get entity details
                entity_url = f"{WIKIDATA_API}?action=wbgetentities&ids={wid}&props=claims&format=json"
                entity_data = json.loads(curl_get(entity_url))
                entity = entity_data.get("entities", {}).get(wid, {})
                claims = entity.get("claims", {})
                
                # Verify it's a person
                if not is_person_entity(claims):
                    continue
                
                # Check birth year if available
                if db_birth_year:
                    wiki_birth_year = get_birth_year(claims)
                    if wiki_birth_year and abs(wiki_birth_year - db_birth_year) > 2:
                        continue  # Birth year mismatch
                
                # Check for image
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
                found = True
                break
            
            if not found:
                if results:
                    skipped_not_person += 1
                else:
                    skipped_no_match += 1
            
        except Exception as e:
            pass
        
        if (i + 1) % 50 == 0:
            print(f"  Processed {i+1}/{len(rows)}: {updated} updated, {skipped_not_person} not person, {skipped_no_image} no image")
            sys.stdout.flush()
        
        await asyncio.sleep(0.1)
    
    print(f"  Batch done: {updated} updated, {skipped_not_person} not person, {skipped_no_match} no match")
    return updated


async def main():
    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)
    
    # First, clear incorrect images (ones that don't have "Special:FilePath" from valid commons URLs)
    # We'll keep existing images for now
    
    total_updated = 0
    
    for batch in range(40):  # 40 batches of 500 = 20000 people max
        print(f"\n=== Batch {batch + 1} ===")
        sys.stdout.flush()
        
        updated = await process_batch(conn, limit=500)
        total_updated += updated
        
        print(f"Total updated so far: {total_updated}")
        sys.stdout.flush()
        
        if updated == 0:
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
