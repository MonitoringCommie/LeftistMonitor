#!/usr/bin/env python3
"""
Scrape conflicts/wars from Wikidata.

Queries for wars, battles, revolutions, uprisings.

Saves results to /Users/linusgollnow/LeftistMonitor/data/scraped/conflicts/
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/conflicts")
STATE_FILE = OUTPUT_DIR / ".scraper_state.json"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
MAX_FILE_SIZE_MB = 50
RATE_LIMIT_SECONDS = 1.0
BATCH_SIZE = 5000

# Conflict types to query
CONFLICT_TYPES = [
    ("Q198", "war"),
    ("Q178561", "battle"),
    ("Q10931", "revolution"),
    ("Q124757", "uprising"),
    ("Q350604", "armed_conflict"),
    ("Q180684", "conflict"),
    ("Q8465", "civil_war"),
    ("Q1348415", "proxy_war"),
    ("Q1261214", "guerrilla_war"),
    ("Q7315", "coup_detat"),
    ("Q1260411", "rebellion"),
    ("Q273120", "insurrection"),
    ("Q182559", "siege"),
    ("Q2001676", "military_campaign"),
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


def get_sparql_query(conflict_type_id, offset=0):
    """Generate SPARQL query for conflicts of a specific type."""
    return f"""
    SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate 
           ?locationLabel ?belligerent1Label ?belligerent2Label
           ?casualties ?description WHERE {{
      ?conflict wdt:P31/wdt:P279* wd:{conflict_type_id} .
      
      OPTIONAL {{ ?conflict wdt:P580 ?startDate . }}
      OPTIONAL {{ ?conflict wdt:P582 ?endDate . }}
      OPTIONAL {{ ?conflict wdt:P276 ?location . }}
      OPTIONAL {{ ?conflict wdt:P710 ?belligerent1 . }}
      OPTIONAL {{ ?conflict wdt:P1344 ?belligerent2 . }}
      OPTIONAL {{ ?conflict wdt:P1120 ?casualties . }}
      OPTIONAL {{ ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?conflict
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_detailed_conflict_query(offset=0):
    """Detailed query for conflicts with more participant info."""
    return f"""
    SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate 
           ?locationLabel ?participantLabel ?partOfLabel
           ?casualties ?description WHERE {{
      VALUES ?conflictType {{ wd:Q198 wd:Q178561 wd:Q10931 wd:Q124757 wd:Q8465 }}
      ?conflict wdt:P31/wdt:P279* ?conflictType .
      
      OPTIONAL {{ ?conflict wdt:P580 ?startDate . }}
      OPTIONAL {{ ?conflict wdt:P582 ?endDate . }}
      OPTIONAL {{ ?conflict wdt:P276 ?location . }}
      OPTIONAL {{ ?conflict wdt:P710 ?participant . }}
      OPTIONAL {{ ?conflict wdt:P361 ?partOf . }}
      OPTIONAL {{ ?conflict wdt:P1120 ?casualties . }}
      OPTIONAL {{ ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY DESC(?startDate)
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


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
                timeout=180
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
            time.sleep(RATE_LIMIT_SECONDS * (attempt + 1) * 2)
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error on attempt {attempt + 1}: {e}")
            time.sleep(RATE_LIMIT_SECONDS * (attempt + 1))
    
    return None


def parse_date(date_str):
    """Parse a date string."""
    if not date_str:
        return None
    try:
        return date_str[:10] if len(date_str) >= 10 else date_str
    except (ValueError, IndexError):
        return None


def parse_results(results, conflict_type=""):
    """Parse SPARQL results into conflict records."""
    conflicts = []
    
    for binding in results.get("results", {}).get("bindings", []):
        conflict_uri = binding.get("conflict", {}).get("value", "")
        wikidata_id = conflict_uri.split("/")[-1] if conflict_uri else ""
        
        # Parse casualties
        casualties_raw = binding.get("casualties", {}).get("value", "")
        casualties = None
        if casualties_raw:
            try:
                casualties = int(float(casualties_raw))
            except ValueError:
                pass
        
        # Collect belligerents
        belligerents = []
        for key in ["belligerent1Label", "belligerent2Label", "participantLabel"]:
            val = binding.get(key, {}).get("value", "")
            if val and val not in belligerents:
                belligerents.append(val)
        
        # Location
        location = binding.get("locationLabel", {}).get("value", "")
        
        conflict = {
            "wikidata_id": wikidata_id,
            "name": binding.get("conflictLabel", {}).get("value", ""),
            "start_date": parse_date(binding.get("startDate", {}).get("value", "")),
            "end_date": parse_date(binding.get("endDate", {}).get("value", "")),
            "belligerents": belligerents,
            "casualties": casualties,
            "location": location,
            "part_of": binding.get("partOfLabel", {}).get("value", ""),
            "type": conflict_type,
            "description": binding.get("description", {}).get("value", ""),
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        conflicts.append(conflict)
    
    return conflicts


def deduplicate_conflicts(conflicts):
    """Deduplicate conflicts by wikidata_id, merging belligerents."""
    seen = {}
    
    for conflict in conflicts:
        wid = conflict["wikidata_id"]
        if wid in seen:
            # Merge belligerents
            existing_belligerents = set(seen[wid]["belligerents"])
            new_belligerents = set(conflict["belligerents"])
            seen[wid]["belligerents"] = list(existing_belligerents | new_belligerents)
            # Keep other data if missing
            for key in ["start_date", "end_date", "casualties", "location", "part_of", "description"]:
                if conflict.get(key) and not seen[wid].get(key):
                    seen[wid][key] = conflict[key]
        else:
            seen[wid] = conflict
    
    return list(seen.values())


def load_state():
    """Load scraper state for resumability."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return {"completed_types": [], "detailed_offset": 0, "total_conflicts": 0}


def save_state(state):
    """Save scraper state."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def save_conflicts(conflicts, file_index, logger):
    """Save conflicts to JSON file."""
    filename = f"conflicts_{file_index:04d}.json"
    filepath = OUTPUT_DIR / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(conflicts, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(conflicts)} conflicts to {filename}")
    return filepath


def main():
    """Main scraper function."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logger = setup_logging()
    
    logger.info("Starting Wikidata Conflicts Scraper")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    state = load_state()
    all_conflicts = []
    file_index = 1
    
    existing_files = list(OUTPUT_DIR.glob("conflicts_*.json"))
    if existing_files:
        file_index = max(int(f.stem.split("_")[1]) for f in existing_files) + 1
    
    # Scrape by conflict type
    for conflict_type_id, conflict_type_name in CONFLICT_TYPES:
        if conflict_type_name in state["completed_types"]:
            logger.info(f"Skipping already completed type: {conflict_type_name}")
            continue
        
        logger.info(f"Scraping conflicts of type: {conflict_type_name} ({conflict_type_id})")
        offset = 0
        type_conflicts = []
        
        while True:
            query = get_sparql_query(conflict_type_id, offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed to get results for {conflict_type_name} at offset {offset}")
                break
            
            batch = parse_results(results, conflict_type_name)
            
            if not batch:
                logger.info(f"  No more results for {conflict_type_name}")
                break
            
            type_conflicts.extend(batch)
            logger.info(f"  Got {len(batch)} conflicts (total for type: {len(type_conflicts)})")
            
            offset += BATCH_SIZE
            
            if len(batch) < BATCH_SIZE:
                break
        
        all_conflicts.extend(type_conflicts)
        state["completed_types"].append(conflict_type_name)
        state["total_conflicts"] = len(all_conflicts)
        save_state(state)
        
        logger.info(f"Completed {conflict_type_name}: {len(type_conflicts)} conflicts found")
    
    # Run detailed query
    if "detailed_query" not in state["completed_types"]:
        logger.info("Running detailed conflicts query...")
        offset = state.get("detailed_offset", 0)
        
        while True:
            query = get_detailed_conflict_query(offset)
            logger.info(f"  Detailed query offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed detailed query at offset {offset}")
                break
            
            batch = parse_results(results)
            
            if not batch:
                break
            
            all_conflicts.extend(batch)
            logger.info(f"  Got {len(batch)} conflicts (total: {len(all_conflicts)})")
            
            offset += BATCH_SIZE
            state["detailed_offset"] = offset
            save_state(state)
            
            if len(batch) < BATCH_SIZE:
                break
        
        state["completed_types"].append("detailed_query")
        save_state(state)
    
    # Deduplicate
    logger.info(f"Deduplicating {len(all_conflicts)} conflicts...")
    all_conflicts = deduplicate_conflicts(all_conflicts)
    logger.info(f"After deduplication: {len(all_conflicts)} unique conflicts")
    
    # Save in chunks respecting file size limit
    current_chunk = []
    current_size = 0
    
    for conflict in all_conflicts:
        conflict_json = json.dumps(conflict, ensure_ascii=False)
        conflict_size = len(conflict_json.encode("utf-8"))
        
        if current_size + conflict_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            save_conflicts(current_chunk, file_index, logger)
            file_index += 1
            current_chunk = []
            current_size = 0
        
        current_chunk.append(conflict)
        current_size += conflict_size
    
    if current_chunk:
        save_conflicts(current_chunk, file_index, logger)
    
    if STATE_FILE.exists():
        STATE_FILE.unlink()
    
    logger.info(f"Scraping complete! Total unique conflicts: {len(all_conflicts)}")
    
    return len(all_conflicts)


if __name__ == "__main__":
    main()
