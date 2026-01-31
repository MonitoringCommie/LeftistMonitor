#!/usr/bin/env python3
"""
Scrape elections from Wikidata.

Queries for all elections worldwide.

Saves results to /Users/linusgollnow/LeftistMonitor/data/scraped/elections/
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/elections")
STATE_FILE = OUTPUT_DIR / ".scraper_state.json"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
MAX_FILE_SIZE_MB = 50
RATE_LIMIT_SECONDS = 1.0
BATCH_SIZE = 5000

# Election types to query
ELECTION_TYPES = [
    ("Q40231", "election"),
    ("Q858439", "presidential_election"),
    ("Q1076105", "parliamentary_election"),
    ("Q7864918", "local_election"),
    ("Q1343246", "general_election"),
    ("Q15238777", "legislative_election"),
    ("Q1076099", "gubernatorial_election"),
    ("Q30057594", "mayoral_election"),
    ("Q192517", "referendum"),
    ("Q19317256", "constitutional_referendum"),
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


def get_sparql_query(election_type_id, offset=0):
    """Generate SPARQL query for elections of a specific type."""
    return f"""
    SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?typeLabel 
           ?winnerLabel ?turnout ?description WHERE {{
      ?election wdt:P31/wdt:P279* wd:{election_type_id} .
      
      OPTIONAL {{ ?election wdt:P585 ?date . }}
      OPTIONAL {{ ?election wdt:P17 ?country . }}
      OPTIONAL {{ ?election wdt:P31 ?type . }}
      OPTIONAL {{ ?election wdt:P991 ?winner . }}
      OPTIONAL {{ ?election wdt:P1697 ?turnout . }}
      OPTIONAL {{ ?election schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?election
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_broader_election_query(offset=0):
    """Broader query for all elections."""
    return f"""
    SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?typeLabel 
           ?winnerLabel ?turnout ?description WHERE {{
      ?election wdt:P31 ?type .
      ?type wdt:P279* wd:Q40231 .
      
      OPTIONAL {{ ?election wdt:P585 ?date . }}
      OPTIONAL {{ ?election wdt:P17 ?country . }}
      OPTIONAL {{ ?election wdt:P991 ?winner . }}
      OPTIONAL {{ ?election wdt:P1697 ?turnout . }}
      OPTIONAL {{ ?election schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY DESC(?date)
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


def parse_results(results, election_type=""):
    """Parse SPARQL results into election records."""
    elections = []
    
    for binding in results.get("results", {}).get("bindings", []):
        election_uri = binding.get("election", {}).get("value", "")
        wikidata_id = election_uri.split("/")[-1] if election_uri else ""
        
        # Parse turnout
        turnout_raw = binding.get("turnout", {}).get("value", "")
        turnout = None
        if turnout_raw:
            try:
                turnout = float(turnout_raw)
            except ValueError:
                pass
        
        election = {
            "wikidata_id": wikidata_id,
            "name": binding.get("electionLabel", {}).get("value", ""),
            "date": parse_date(binding.get("date", {}).get("value", "")),
            "country": binding.get("countryLabel", {}).get("value", ""),
            "type": binding.get("typeLabel", {}).get("value", election_type),
            "winner": binding.get("winnerLabel", {}).get("value", ""),
            "turnout": turnout,
            "description": binding.get("description", {}).get("value", ""),
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        elections.append(election)
    
    return elections


def deduplicate_elections(elections):
    """Deduplicate elections by wikidata_id."""
    seen = {}
    
    for election in elections:
        wid = election["wikidata_id"]
        if wid not in seen:
            seen[wid] = election
        else:
            # Keep the one with more data
            existing = seen[wid]
            for key, value in election.items():
                if value and not existing.get(key):
                    existing[key] = value
    
    return list(seen.values())


def load_state():
    """Load scraper state for resumability."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return {"completed_types": [], "broader_offset": 0, "total_elections": 0}


def save_state(state):
    """Save scraper state."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def save_elections(elections, file_index, logger):
    """Save elections to JSON file."""
    filename = f"elections_{file_index:04d}.json"
    filepath = OUTPUT_DIR / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(elections, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(elections)} elections to {filename}")
    return filepath


def main():
    """Main scraper function."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logger = setup_logging()
    
    logger.info("Starting Wikidata Elections Scraper")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    state = load_state()
    all_elections = []
    file_index = 1
    
    existing_files = list(OUTPUT_DIR.glob("elections_*.json"))
    if existing_files:
        file_index = max(int(f.stem.split("_")[1]) for f in existing_files) + 1
    
    # Scrape by election type
    for election_type_id, election_type_name in ELECTION_TYPES:
        if election_type_name in state["completed_types"]:
            logger.info(f"Skipping already completed type: {election_type_name}")
            continue
        
        logger.info(f"Scraping elections of type: {election_type_name} ({election_type_id})")
        offset = 0
        type_elections = []
        
        while True:
            query = get_sparql_query(election_type_id, offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed to get results for {election_type_name} at offset {offset}")
                break
            
            batch = parse_results(results, election_type_name)
            
            if not batch:
                logger.info(f"  No more results for {election_type_name}")
                break
            
            type_elections.extend(batch)
            logger.info(f"  Got {len(batch)} elections (total for type: {len(type_elections)})")
            
            offset += BATCH_SIZE
            
            if len(batch) < BATCH_SIZE:
                break
        
        all_elections.extend(type_elections)
        state["completed_types"].append(election_type_name)
        state["total_elections"] = len(all_elections)
        save_state(state)
        
        logger.info(f"Completed {election_type_name}: {len(type_elections)} elections found")
    
    # Run broader query
    if "broader_query" not in state["completed_types"]:
        logger.info("Running broader elections query...")
        offset = state.get("broader_offset", 0)
        
        while True:
            query = get_broader_election_query(offset)
            logger.info(f"  Broader query offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed broader query at offset {offset}")
                break
            
            batch = parse_results(results)
            
            if not batch:
                break
            
            all_elections.extend(batch)
            logger.info(f"  Got {len(batch)} elections (total: {len(all_elections)})")
            
            offset += BATCH_SIZE
            state["broader_offset"] = offset
            save_state(state)
            
            if len(batch) < BATCH_SIZE:
                break
        
        state["completed_types"].append("broader_query")
        save_state(state)
    
    # Deduplicate
    logger.info(f"Deduplicating {len(all_elections)} elections...")
    all_elections = deduplicate_elections(all_elections)
    logger.info(f"After deduplication: {len(all_elections)} unique elections")
    
    # Save in chunks respecting file size limit
    current_chunk = []
    current_size = 0
    
    for election in all_elections:
        election_json = json.dumps(election, ensure_ascii=False)
        election_size = len(election_json.encode("utf-8"))
        
        if current_size + election_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            save_elections(current_chunk, file_index, logger)
            file_index += 1
            current_chunk = []
            current_size = 0
        
        current_chunk.append(election)
        current_size += election_size
    
    if current_chunk:
        save_elections(current_chunk, file_index, logger)
    
    if STATE_FILE.exists():
        STATE_FILE.unlink()
    
    logger.info(f"Scraping complete! Total unique elections: {len(all_elections)}")
    
    return len(all_elections)


if __name__ == "__main__":
    main()
