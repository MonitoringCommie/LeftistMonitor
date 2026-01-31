#!/usr/bin/env python3
"""
Scrape politicians from Wikidata.

Queries for: heads of state, prime ministers, ministers, MPs, senators,
activists, revolutionaries.

Saves results to /Users/linusgollnow/LeftistMonitor/data/scraped/people/
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/people")
STATE_FILE = OUTPUT_DIR / ".scraper_state.json"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
MAX_FILE_SIZE_MB = 50
RATE_LIMIT_SECONDS = 1.0
BATCH_SIZE = 5000

# Position types to query (Wikidata Q-IDs)
POSITION_TYPES = [
    ("Q11696", "head_of_state"),
    ("Q14212", "head_of_government"),
    ("Q83307", "minister"),
    ("Q486839", "member_of_parliament"),
    ("Q15686806", "senator"),
    ("Q15995642", "representative"),
    ("Q193391", "diplomat"),
    ("Q82955", "politician"),
    ("Q15253558", "activist"),
    ("Q3242115", "revolutionary"),
    ("Q189290", "military_officer"),
]


def setup_logging():
    """Setup logging configuration."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(OUTPUT_DIR / "scraper.log")
        ]
    )
    return logging.getLogger(__name__)


def get_sparql_query(position_id, offset=0):
    """Generate SPARQL query for people with a specific position/occupation."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?positionLabel 
           ?countryLabel ?partyLabel ?description WHERE {{
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P106 wd:{position_id} .
      
      OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
      OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
      OPTIONAL {{ ?person wdt:P39 ?position . }}
      OPTIONAL {{ ?person wdt:P27 ?country . }}
      OPTIONAL {{ ?person wdt:P102 ?party . }}
      OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?person
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_position_holders_query(position_id, offset=0):
    """Query for people who held specific positions."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?positionLabel 
           ?startDate ?endDate ?countryLabel ?partyLabel ?description WHERE {{
      ?person wdt:P39 wd:{position_id} .
      ?person wdt:P31 wd:Q5 .
      
      OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
      OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
      OPTIONAL {{
        ?person p:P39 ?positionStatement .
        ?positionStatement ps:P39 wd:{position_id} .
        OPTIONAL {{ ?positionStatement pq:P580 ?startDate . }}
        OPTIONAL {{ ?positionStatement pq:P582 ?endDate . }}
      }}
      OPTIONAL {{ ?person wdt:P27 ?country . }}
      OPTIONAL {{ ?person wdt:P102 ?party . }}
      OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?person
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


# High-level positions to query directly
HIGH_POSITIONS = [
    ("Q30461", "president"),
    ("Q116", "monarch"),
    ("Q4164871", "prime_minister_position"),
]


def execute_sparql(query, logger, retry_count=3):
    """Execute a SPARQL query against Wikidata."""
    headers = {
        "User-Agent": "LeftistMonitorBot/1.0 (research project)",
        "Accept": "application/sparql-results+json"
    }
    
    for attempt in range(retry_count):
        try:
            response = requests.get(
                WIKIDATA_ENDPOINT,
                params={"query": query, "format": "json"},
                headers=headers,
                timeout=120
            )
            
            if response.status_code == 429:
                wait_time = int(response.headers.get("Retry-After", 60))
                logger.warning(f"Rate limited. Waiting {wait_time} seconds...")
                time.sleep(wait_time)
                continue
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout on attempt {attempt + 1}/{retry_count}")
            time.sleep(RATE_LIMIT_SECONDS * (attempt + 1))
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error on attempt {attempt + 1}: {e}")
            time.sleep(RATE_LIMIT_SECONDS * (attempt + 1))
    
    return None


def parse_date(date_str):
    """Parse a date string to extract year."""
    if not date_str:
        return None
    try:
        return date_str[:10] if len(date_str) >= 10 else date_str[:4]
    except (ValueError, IndexError):
        return None


def parse_results(results, position_type=""):
    """Parse SPARQL results into person records."""
    people = []
    
    for binding in results.get("results", {}).get("bindings", []):
        person_uri = binding.get("person", {}).get("value", "")
        wikidata_id = person_uri.split("/")[-1] if person_uri else ""
        
        person = {
            "wikidata_id": wikidata_id,
            "name": binding.get("personLabel", {}).get("value", ""),
            "birth_date": parse_date(binding.get("birthDate", {}).get("value", "")),
            "death_date": parse_date(binding.get("deathDate", {}).get("value", "")),
            "positions": [],
            "country": binding.get("countryLabel", {}).get("value", ""),
            "party": binding.get("partyLabel", {}).get("value", ""),
            "description": binding.get("description", {}).get("value", ""),
            "occupation_types": [position_type] if position_type else [],
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        # Add position if present
        position_label = binding.get("positionLabel", {}).get("value", "")
        if position_label:
            position_entry = {"title": position_label}
            if "startDate" in binding:
                position_entry["start_date"] = parse_date(binding["startDate"].get("value", ""))
            if "endDate" in binding:
                position_entry["end_date"] = parse_date(binding["endDate"].get("value", ""))
            person["positions"].append(position_entry)
        
        people.append(person)
    
    return people


def deduplicate_people(people):
    """Deduplicate people by wikidata_id, merging positions and occupation types."""
    seen = {}
    
    for person in people:
        wid = person["wikidata_id"]
        if wid in seen:
            # Merge positions
            existing_positions = {p["title"] for p in seen[wid]["positions"] if "title" in p}
            for pos in person["positions"]:
                if pos.get("title") and pos["title"] not in existing_positions:
                    seen[wid]["positions"].append(pos)
            # Merge occupation types
            existing_types = set(seen[wid]["occupation_types"])
            new_types = set(person["occupation_types"])
            seen[wid]["occupation_types"] = list(existing_types | new_types)
        else:
            seen[wid] = person
    
    return list(seen.values())


def load_state():
    """Load scraper state for resumability."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return {"completed_types": [], "current_offset": 0, "total_people": 0}


def save_state(state):
    """Save scraper state."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def save_people(people, file_index, logger):
    """Save people to JSON file."""
    filename = f"politicians_{file_index:04d}.json"
    filepath = OUTPUT_DIR / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(people, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(people)} people to {filename}")
    return filepath


def main():
    """Main scraper function."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logger = setup_logging()
    
    logger.info("Starting Wikidata Politicians Scraper")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    state = load_state()
    all_people = []
    file_index = 1
    
    existing_files = list(OUTPUT_DIR.glob("politicians_*.json"))
    if existing_files:
        file_index = max(int(f.stem.split("_")[1]) for f in existing_files) + 1
    
    # Scrape by occupation type
    for position_id, position_name in POSITION_TYPES:
        if position_name in state["completed_types"]:
            logger.info(f"Skipping already completed type: {position_name}")
            continue
        
        logger.info(f"Scraping people with occupation: {position_name} ({position_id})")
        offset = 0
        type_people = []
        
        while True:
            query = get_sparql_query(position_id, offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed to get results for {position_name} at offset {offset}")
                break
            
            batch = parse_results(results, position_name)
            
            if not batch:
                logger.info(f"  No more results for {position_name}")
                break
            
            type_people.extend(batch)
            logger.info(f"  Got {len(batch)} people (total for type: {len(type_people)})")
            
            offset += BATCH_SIZE
            
            if len(batch) < BATCH_SIZE:
                break
        
        all_people.extend(type_people)
        state["completed_types"].append(position_name)
        state["total_people"] = len(all_people)
        save_state(state)
        
        logger.info(f"Completed {position_name}: {len(type_people)} people found")
    
    # Also query for specific high-level position holders
    logger.info("Querying specific position holders...")
    for position_id, position_name in HIGH_POSITIONS:
        key = f"position_{position_name}"
        if key in state["completed_types"]:
            logger.info(f"Skipping already completed position: {position_name}")
            continue
        
        logger.info(f"Scraping holders of: {position_name} ({position_id})")
        offset = 0
        
        while True:
            query = get_position_holders_query(position_id, offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed to get results for {position_name} at offset {offset}")
                break
            
            batch = parse_results(results, position_name)
            
            if not batch:
                break
            
            all_people.extend(batch)
            logger.info(f"  Got {len(batch)} people (total: {len(all_people)})")
            
            offset += BATCH_SIZE
            
            if len(batch) < BATCH_SIZE:
                break
        
        state["completed_types"].append(key)
        save_state(state)
    
    # Deduplicate
    logger.info(f"Deduplicating {len(all_people)} people...")
    all_people = deduplicate_people(all_people)
    logger.info(f"After deduplication: {len(all_people)} unique people")
    
    # Save in chunks respecting file size limit
    current_chunk = []
    current_size = 0
    
    for person in all_people:
        person_json = json.dumps(person, ensure_ascii=False)
        person_size = len(person_json.encode("utf-8"))
        
        if current_size + person_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            save_people(current_chunk, file_index, logger)
            file_index += 1
            current_chunk = []
            current_size = 0
        
        current_chunk.append(person)
        current_size += person_size
    
    if current_chunk:
        save_people(current_chunk, file_index, logger)
    
    if STATE_FILE.exists():
        STATE_FILE.unlink()
    
    logger.info(f"Scraping complete! Total unique people: {len(all_people)}")
    
    return len(all_people)


if __name__ == "__main__":
    main()
