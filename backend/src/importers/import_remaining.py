#!/usr/bin/env python3
"""Import remaining scraped data - books, events, conflicts."""
import json
import uuid
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

SCRAPED_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped"
DB_CONFIG = {"dbname": "leftist_monitor", "host": "localhost"}


def parse_date(date_str):
    """Parse date, filtering out invalid dates."""
    if not date_str:
        return None
    try:
        # Skip URLs and invalid formats
        if date_str.startswith("http") or len(date_str) < 4:
            return None
        # Skip dates before year 1
        if date_str.startswith("-"):
            return None
        if "T" in date_str:
            date_str = date_str.split("T")[0]
        # Validate year is reasonable
        year = int(date_str[:4])
        if year < 1 or year > 2030:
            return None
        if len(date_str) == 4:
            return f"{date_str}-01-01"
        if len(date_str) == 7:
            return f"{date_str}-01"
        return date_str[:10]
    except:
        return None


def import_books(conn):
    """Import books data."""
    filepath = SCRAPED_DIR / "books/all_books_comprehensive.json"
    if not filepath.exists():
        print("Books file not found")
        return 0
    
    with open(filepath) as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} books")
    cur = conn.cursor()
    count = 0
    
    for book in data:
        wikidata_id = book.get("wikidata_id") or book.get("open_library_key")
        title = book.get("title", "")
        if not wikidata_id or not title or title.startswith("Q"):
            continue
        
        pub_year = None
        if book.get("publication_year"):
            try:
                year_str = str(book.get("publication_year"))[:4]
                pub_year = int(year_str) if year_str.isdigit() and 1000 <= int(year_str) <= 2030 else None
            except:
                pass
        
        try:
            cur.execute("""
                INSERT INTO books (id, wikidata_id, title, publication_year, publisher, book_type, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (wikidata_id) DO NOTHING
            """, (
                str(uuid.uuid4()),
                wikidata_id[:20],
                title[:500],
                pub_year,
                (book.get("publisher") or "")[:255] or None,
                (book.get("subject") or book.get("category") or "")[:50] or None,
                book.get("description"),
            ))
            count += 1
            if count % 1000 == 0:
                conn.commit()
                print(f"  Imported {count} books...")
        except Exception as e:
            pass
    
    conn.commit()
    cur.close()
    return count


def import_events(conn):
    """Import events data."""
    filepath = SCRAPED_DIR / "events_global/all_events_comprehensive.json"
    if not filepath.exists():
        print("Events file not found")
        return 0
    
    with open(filepath) as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} events")
    cur = conn.cursor()
    count = 0
    
    for event in data:
        wikidata_id = event.get("wikidata_id")
        name = event.get("name", "")
        if not wikidata_id or not name or name.startswith("Q"):
            continue
        
        start_date = parse_date(event.get("date") or event.get("start_date"))
        end_date = parse_date(event.get("end_date"))
        event_type = (event.get("event_type") or "historical")[:50]
        
        try:
            cur.execute("""
                INSERT INTO events (id, wikidata_id, title, start_date, end_date, category, event_type, description, location_name)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (wikidata_id) DO NOTHING
            """, (
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
            count += 1
            if count % 1000 == 0:
                conn.commit()
                print(f"  Imported {count} events...")
        except Exception as e:
            pass
    
    conn.commit()
    cur.close()
    return count


def import_conflicts(conn):
    """Import conflicts data."""
    filepath = SCRAPED_DIR / "conflicts_military/all_conflicts.json"
    if not filepath.exists():
        print("Conflicts file not found")
        return 0
    
    with open(filepath) as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} conflicts")
    cur = conn.cursor()
    count = 0
    
    for conflict in data:
        wikidata_id = conflict.get("wikidata_id")
        name = conflict.get("name", "")
        if not wikidata_id or not name or name.startswith("Q"):
            continue
        
        start_date = parse_date(conflict.get("date") or conflict.get("start_date"))
        end_date = parse_date(conflict.get("end_date"))
        conflict_type = (conflict.get("category") or "war")[:50]
        
        try:
            cur.execute("""
                INSERT INTO conflicts (id, wikidata_id, name, start_date, end_date, conflict_type, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (wikidata_id) DO NOTHING
            """, (
                str(uuid.uuid4()),
                wikidata_id[:20],
                name[:255],
                start_date,
                end_date,
                conflict_type,
                conflict.get("description"),
            ))
            count += 1
            if count % 1000 == 0:
                conn.commit()
                print(f"  Imported {count} conflicts...")
        except Exception as e:
            pass
    
    conn.commit()
    cur.close()
    return count


def main():
    print("=" * 60)
    print("IMPORTING REMAINING DATA")
    print("=" * 60)
    
    conn = psycopg2.connect(**DB_CONFIG)
    
    stats = {}
    
    print("\nImporting books...")
    stats["books"] = import_books(conn)
    print(f"  Completed: {stats['books']}")
    
    print("\nImporting events...")
    stats["events"] = import_events(conn)
    print(f"  Completed: {stats['events']}")
    
    print("\nImporting conflicts...")
    stats["conflicts"] = import_conflicts(conn)
    print(f"  Completed: {stats['conflicts']}")
    
    conn.close()
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE")
    for cat, count in stats.items():
        print(f"  {cat}: {count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
