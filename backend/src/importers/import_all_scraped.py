#!/usr/bin/env python3
"""
Import all scraped data into the database.
Total: ~354,000 records across categories
"""
import json
import uuid
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

SCRAPED_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped"

DB_CONFIG = {
    "dbname": "leftist_monitor",
    "host": "localhost",
}

DATA_FILES = {
    "people": "people/all_people_comprehensive.json",
    "books": "books/all_books_comprehensive.json",
    "events": "events_global/all_events_comprehensive.json",
    "conflicts": "conflicts_military/all_conflicts.json",
}


def parse_date(date_str):
    """Parse various date formats to date or None."""
    if not date_str:
        return None
    try:
        if "T" in date_str:
            date_str = date_str.split("T")[0]
        if len(date_str) == 4:
            return f"{date_str}-01-01"
        if len(date_str) == 7:
            return f"{date_str}-01"
        return date_str[:10]
    except:
        return None


def import_people(conn, data):
    """Import people data."""
    cur = conn.cursor()
    count = 0
    skipped = 0
    batch = []
    
    for person in data:
        wikidata_id = person.get("wikidata_id")
        name = person.get("name", "")
        if not wikidata_id or not name or name.startswith("Q"):
            skipped += 1
            continue
            
        batch.append((
            str(uuid.uuid4()),
            wikidata_id[:20],
            name[:255],
            parse_date(person.get("birth_date")),
            parse_date(person.get("death_date")),
            person.get("categories", [])[:10],
            (person.get("description") or "")[:500] or None,
            (person.get("birth_place") or "")[:255] or None,
            (person.get("death_place") or "")[:255] or None,
        ))
        
        if len(batch) >= 500:
            try:
                execute_values(cur, """
                    INSERT INTO people (id, wikidata_id, name, birth_date, death_date, 
                                       person_types, bio_short, birth_place, death_place)
                    VALUES %s
                    ON CONFLICT (wikidata_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        bio_short = COALESCE(EXCLUDED.bio_short, people.bio_short),
                        person_types = EXCLUDED.person_types
                """, batch)
                conn.commit()
                count += len(batch)
                print(f"  Imported {count} people...")
            except Exception as e:
                print(f"  Batch error: {e}")
                conn.rollback()
            batch = []
    
    if batch:
        try:
            execute_values(cur, """
                INSERT INTO people (id, wikidata_id, name, birth_date, death_date,
                                   person_types, bio_short, birth_place, death_place)
                VALUES %s
                ON CONFLICT (wikidata_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    bio_short = COALESCE(EXCLUDED.bio_short, people.bio_short),
                    person_types = EXCLUDED.person_types
            """, batch)
            conn.commit()
            count += len(batch)
        except Exception as e:
            print(f"  Final batch error: {e}")
            conn.rollback()
    
    cur.close()
    print(f"  Skipped {skipped} invalid records")
    return count


def import_books(conn, data):
    """Import books data."""
    cur = conn.cursor()
    count = 0
    skipped = 0
    batch = []
    
    for book in data:
        wikidata_id = book.get("wikidata_id") or book.get("open_library_key")
        title = book.get("title", "")
        if not wikidata_id or not title or title.startswith("Q"):
            skipped += 1
            continue
        
        pub_year = None
        if book.get("publication_year"):
            try:
                year_str = str(book.get("publication_year"))[:4]
                pub_year = int(year_str) if year_str.isdigit() and 1000 <= int(year_str) <= 2030 else None
            except:
                pass
        
        batch.append((
            str(uuid.uuid4()),
            wikidata_id[:20],
            title[:500],
            pub_year,
            (book.get("publisher") or "")[:255] or None,
            (book.get("subject") or book.get("category") or "")[:50] or None,
            book.get("description"),
        ))
        
        if len(batch) >= 500:
            try:
                execute_values(cur, """
                    INSERT INTO books (id, wikidata_id, title, publication_year, publisher, book_type, description)
                    VALUES %s
                    ON CONFLICT (wikidata_id) DO NOTHING
                """, batch)
                conn.commit()
                count += len(batch)
                print(f"  Imported {count} books...")
            except Exception as e:
                print(f"  Batch error: {e}")
                conn.rollback()
            batch = []
    
    if batch:
        try:
            execute_values(cur, """
                INSERT INTO books (id, wikidata_id, title, publication_year, publisher, book_type, description)
                VALUES %s
                ON CONFLICT (wikidata_id) DO NOTHING
            """, batch)
            conn.commit()
            count += len(batch)
        except Exception as e:
            print(f"  Final batch error: {e}")
            conn.rollback()
    
    cur.close()
    print(f"  Skipped {skipped} invalid records")
    return count


def import_events(conn, data):
    """Import events data."""
    cur = conn.cursor()
    count = 0
    skipped = 0
    batch = []
    
    for event in data:
        wikidata_id = event.get("wikidata_id")
        name = event.get("name", "")
        if not wikidata_id or not name or name.startswith("Q"):
            skipped += 1
            continue
        
        start_date = parse_date(event.get("date") or event.get("start_date"))
        end_date = parse_date(event.get("end_date"))
        event_type = (event.get("event_type") or "historical")[:50]
        
        batch.append((
            str(uuid.uuid4()),
            wikidata_id[:20],
            name[:500],
            start_date,
            end_date,
            event_type,
            event_type[:100],
            event.get("description"),
            (event.get("location") or "")[:255] or None,
        ))
        
        if len(batch) >= 500:
            try:
                execute_values(cur, """
                    INSERT INTO events (id, wikidata_id, title, start_date, end_date, category, event_type, description, location_name)
                    VALUES %s
                    ON CONFLICT (wikidata_id) DO NOTHING
                """, batch)
                conn.commit()
                count += len(batch)
                print(f"  Imported {count} events...")
            except Exception as e:
                print(f"  Batch error: {e}")
                conn.rollback()
            batch = []
    
    if batch:
        try:
            execute_values(cur, """
                INSERT INTO events (id, wikidata_id, title, start_date, end_date, category, event_type, description, location_name)
                VALUES %s
                ON CONFLICT (wikidata_id) DO NOTHING
            """, batch)
            conn.commit()
            count += len(batch)
        except Exception as e:
            print(f"  Final batch error: {e}")
            conn.rollback()
    
    cur.close()
    print(f"  Skipped {skipped} invalid records")
    return count


def import_conflicts(conn, data):
    """Import conflicts data."""
    cur = conn.cursor()
    count = 0
    skipped = 0
    batch = []
    
    for conflict in data:
        wikidata_id = conflict.get("wikidata_id")
        name = conflict.get("name", "")
        if not wikidata_id or not name or name.startswith("Q"):
            skipped += 1
            continue
        
        start_date = parse_date(conflict.get("date") or conflict.get("start_date"))
        end_date = parse_date(conflict.get("end_date"))
        conflict_type = (conflict.get("category") or "war")[:50]
        
        batch.append((
            str(uuid.uuid4()),
            wikidata_id[:20],
            name[:255],
            start_date,
            end_date,
            conflict_type,
            conflict.get("description"),
        ))
        
        if len(batch) >= 500:
            try:
                execute_values(cur, """
                    INSERT INTO conflicts (id, wikidata_id, name, start_date, end_date, conflict_type, description)
                    VALUES %s
                    ON CONFLICT (wikidata_id) DO NOTHING
                """, batch)
                conn.commit()
                count += len(batch)
                print(f"  Imported {count} conflicts...")
            except Exception as e:
                print(f"  Batch error: {e}")
                conn.rollback()
            batch = []
    
    if batch:
        try:
            execute_values(cur, """
                INSERT INTO conflicts (id, wikidata_id, name, start_date, end_date, conflict_type, description)
                VALUES %s
                ON CONFLICT (wikidata_id) DO NOTHING
            """, batch)
            conn.commit()
            count += len(batch)
        except Exception as e:
            print(f"  Final batch error: {e}")
            conn.rollback()
    
    cur.close()
    print(f"  Skipped {skipped} invalid records")
    return count


def main():
    print("=" * 60)
    print("LEFTIST MONITOR - DATA IMPORT")
    print("=" * 60)
    
    conn = psycopg2.connect(**DB_CONFIG)
    
    stats = {}
    importers = {
        "people": import_people,
        "books": import_books,
        "events": import_events,
        "conflicts": import_conflicts,
    }
    
    for category, importer in importers.items():
        filepath = DATA_FILES.get(category)
        if not filepath:
            continue
            
        full_path = SCRAPED_DIR / filepath
        if not full_path.exists():
            print(f"\nSkipping {category}: file not found")
            continue
        
        print(f"\nImporting {category}...")
        with open(full_path, "r") as f:
            data = json.load(f)
        
        print(f"  Loaded {len(data)} records from file")
        
        try:
            count = importer(conn, data)
            stats[category] = count
            print(f"  Completed: {count} records imported")
        except Exception as e:
            print(f"  Error importing {category}: {e}")
            conn.rollback()
    
    conn.close()
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    total = sum(stats.values())
    for cat, count in stats.items():
        print(f"  {cat}: {count}")
    print(f"\n  TOTAL: {total} records imported")


if __name__ == "__main__":
    main()
