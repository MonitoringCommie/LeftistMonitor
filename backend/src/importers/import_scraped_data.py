#!/usr/bin/env python3
"""Import all scraped data into the database."""
import asyncio
import json
import csv
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Optional

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from src.database import async_session_maker
from src.events.models import Event, Conflict
from src.people.models import Person, Book

DATA_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped"


def parse_date(date_str: str) -> Optional[date]:
    """Parse various date formats."""
    if not date_str:
        return None
    try:
        # Try ISO format first
        if 'T' in date_str:
            date_str = date_str.split('T')[0]
        if len(date_str) == 4:  # Just year
            return date(int(date_str), 1, 1)
        parts = date_str.split('-')
        if len(parts) >= 3:
            return date(int(parts[0]), int(parts[1]), int(parts[2]))
        elif len(parts) == 2:
            return date(int(parts[0]), int(parts[1]), 1)
        return None
    except:
        return None


async def import_wikidata_people():
    """Import people from Wikidata scrape."""
    print("\n=== Importing Wikidata People ===")
    
    data_file = DATA_DIR / "people" / "all_people.json"
    if not data_file.exists():
        print("No people data found")
        return 0
    
    with open(data_file) as f:
        people_data = json.load(f)
    
    print(f"Found {len(people_data)} people to import")
    
    imported = 0
    skipped = 0
    
    async with async_session_maker() as session:
        for i, p in enumerate(people_data):
            if i % 1000 == 0:
                print(f"  Processing {i}/{len(people_data)}...")
                await session.commit()
            
            wikidata_id = p.get("wikidata_id", "")
            if not wikidata_id or not p.get("name"):
                skipped += 1
                continue
            
            # Check if exists
            existing = await session.execute(
                select(Person).where(Person.wikidata_id == wikidata_id)
            )
            if existing.scalar_one_or_none():
                skipped += 1
                continue
            
            # Map categories to person_types and ideology_tags
            categories = p.get("categories", [])
            person_types = []
            ideology_tags = []
            
            for cat in categories:
                if cat in ["revolutionaries", "resistance_fighters"]:
                    person_types.append("revolutionary")
                elif cat == "labor_leaders":
                    person_types.append("labor_leader")
                elif cat == "anti_colonial_leaders":
                    person_types.append("independence_activist")
                elif cat == "civil_rights_activists":
                    person_types.append("activist")
                elif cat == "political_theorists":
                    person_types.append("theorist")
                elif cat == "feminist_activists":
                    person_types.append("feminist")
                
                if cat == "communists":
                    ideology_tags.append("communist")
                elif cat == "socialists":
                    ideology_tags.append("socialist")
                elif cat == "anarchists":
                    ideology_tags.append("anarchist")
            
            try:
                await session.execute(
                    text("""
                        INSERT INTO people (id, wikidata_id, name, bio_short, birth_date, death_date, 
                                          birth_place, death_place, person_types, ideology_tags)
                        VALUES (:id, :wikidata_id, :name, :bio_short, :birth_date, :death_date,
                               :birth_place, :death_place, :person_types, :ideology_tags)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "wikidata_id": wikidata_id,
                        "name": p.get("name", "")[:255],
                        "bio_short": (p.get("description", "") or "")[:500],
                        "birth_date": parse_date(p.get("birth_date", "")),
                        "death_date": parse_date(p.get("death_date", "")),
                        "birth_place": (p.get("birth_place", "") or "")[:255],
                        "death_place": (p.get("death_place", "") or "")[:255],
                        "person_types": list(set(person_types)) or None,
                        "ideology_tags": list(set(ideology_tags)) or None,
                    }
                )
                imported += 1
            except Exception as e:
                skipped += 1
        
        await session.commit()
    
    print(f"Imported {imported} people, skipped {skipped}")
    return imported


async def import_wikidata_events():
    """Import events from Wikidata scrape."""
    print("\n=== Importing Wikidata Events ===")
    
    data_file = DATA_DIR / "events" / "all_events.json"
    if not data_file.exists():
        print("No events data found")
        return 0
    
    with open(data_file) as f:
        events_data = json.load(f)
    
    print(f"Found {len(events_data)} events to import")
    
    imported = 0
    skipped = 0
    
    # Map Wikidata categories to our categories
    category_map = {
        "revolutions": "political",
        "civil_wars": "military",
        "wars": "military",
        "strikes": "social",
        "protests": "social",
        "massacres": "military",
        "coups": "political",
        "independence_declarations": "political",
        "elections": "political",
        "rebellions": "political",
        "treaties": "political",
    }
    
    async with async_session_maker() as session:
        for i, e in enumerate(events_data):
            if i % 1000 == 0:
                print(f"  Processing {i}/{len(events_data)}...")
                await session.commit()
            
            wikidata_id = e.get("wikidata_id", "")
            title = e.get("title", "")
            if not title or title.startswith("Q"):  # Skip items without proper labels
                skipped += 1
                continue
            
            # Check if exists by wikidata_id
            if wikidata_id:
                existing = await session.execute(
                    select(Event).where(Event.wikidata_id == wikidata_id)
                )
                if existing.scalar_one_or_none():
                    skipped += 1
                    continue
            
            categories = e.get("categories", [])
            category = "other"
            tags = []
            for cat in categories:
                if cat in category_map:
                    category = category_map[cat]
                    tags.append(cat)
            
            try:
                await session.execute(
                    text("""
                        INSERT INTO events (id, wikidata_id, title, description, start_date, end_date, 
                                          category, tags, location_name)
                        VALUES (:id, :wikidata_id, :title, :description, :start_date, :end_date,
                               :category, :tags, :location_name)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "wikidata_id": wikidata_id or None,
                        "title": title[:500],
                        "description": (e.get("description", "") or "")[:2000],
                        "start_date": parse_date(e.get("start_date", "")),
                        "end_date": parse_date(e.get("end_date", "")),
                        "category": category,
                        "tags": tags or None,
                        "location_name": (e.get("location", "") or e.get("country", "") or "")[:255],
                    }
                )
                imported += 1
            except Exception as e:
                skipped += 1
        
        await session.commit()
    
    print(f"Imported {imported} events, skipped {skipped}")
    return imported


async def import_ucdp_conflicts():
    """Import UCDP armed conflicts."""
    print("\n=== Importing UCDP Conflicts ===")
    
    data_file = DATA_DIR / "ucdp" / "armed_conflicts.json"
    if not data_file.exists():
        print("No UCDP data found")
        return 0
    
    with open(data_file) as f:
        conflicts_data = json.load(f)
    
    print(f"Found {len(conflicts_data)} UCDP conflicts to import")
    
    imported = 0
    skipped = 0
    
    async with async_session_maker() as session:
        for c in conflicts_data:
            ucdp_id = str(c.get("conflict_id", ""))
            if not ucdp_id:
                skipped += 1
                continue
            
            # Check if exists
            existing = await session.execute(
                select(Conflict).where(Conflict.ucdp_id == ucdp_id)
            )
            if existing.scalar_one_or_none():
                skipped += 1
                continue
            
            # Determine conflict type
            type_of_conflict = c.get("type_of_conflict", 0)
            conflict_type_map = {
                1: "colonial",  # Extrasystemic
                2: "interstate",  # Interstate
                3: "civil_war",  # Intrastate
                4: "civil_war",  # Internationalized intrastate
            }
            conflict_type = conflict_type_map.get(type_of_conflict, "other")
            
            try:
                await session.execute(
                    text("""
                        INSERT INTO conflicts (id, ucdp_id, name, start_date, end_date, 
                                             conflict_type, intensity, description)
                        VALUES (:id, :ucdp_id, :name, :start_date, :end_date,
                               :conflict_type, :intensity, :description)
                    """),
                    {
                        "id": str(uuid.uuid4()),
                        "ucdp_id": ucdp_id,
                        "name": c.get("conflict_name", c.get("side_a", "Unknown"))[:255],
                        "start_date": date(c.get("start_date", 1946), 1, 1) if c.get("start_date") else None,
                        "end_date": date(c.get("ep_end", 2023), 12, 31) if c.get("ep_end") else None,
                        "conflict_type": conflict_type,
                        "intensity": "major" if c.get("intensity_level", 0) == 2 else "minor",
                        "description": f"Side A: {c.get('side_a', 'Unknown')}. Side B: {c.get('side_b', 'Unknown')}. Location: {c.get('location', 'Unknown')}"[:500],
                    }
                )
                imported += 1
            except Exception as e:
                skipped += 1
        
        await session.commit()
    
    print(f"Imported {imported} conflicts, skipped {skipped}")
    return imported


async def import_parlgov_parties():
    """Import ParlGov party data."""
    print("\n=== Importing ParlGov Parties ===")
    
    data_file = DATA_DIR / "parlgov" / "view_party.csv"
    if not data_file.exists():
        print("No ParlGov party data found")
        return 0
    
    with open(data_file, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        parties = list(reader)
    
    print(f"Found {len(parties)} parties to process")
    # Note: Would need parties table schema - skipping for now
    return 0


async def main():
    print("=" * 60)
    print("IMPORTING SCRAPED DATA INTO DATABASE")
    print("=" * 60)
    
    total = 0
    
    total += await import_wikidata_people()
    total += await import_wikidata_events()
    total += await import_ucdp_conflicts()
    
    print("\n" + "=" * 60)
    print(f"TOTAL RECORDS IMPORTED: {total}")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
