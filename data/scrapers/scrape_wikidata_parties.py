#!/usr/bin/env python3
"""
Scrape political parties from Wikidata.

Queries for all political parties worldwide.

Saves results to /Users/linusgollnow/LeftistMonitor/data/scraped/parties/
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/parties")
STATE_FILE = OUTPUT_DIR / ".scraper_state.json"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
MAX_FILE_SIZE_MB = 50
RATE_LIMIT_SECONDS = 1.0
BATCH_SIZE = 5000

# Party types to query
PARTY_TYPES = [
    ("Q7278", "political_party"),
    ("Q66316068", "political_coalition"),
    ("Q118457871", "political_alliance"),
    ("Q6583546", "political_organisation"),
]

# Ideology categories
IDEOLOGIES = [
    ("Q7272", "socialism"),
    ("Q6186", "communism"),
    ("Q6199", "anarchism"),
    ("Q171174", "liberalism"),
    ("Q17917", "conservatism"),
    ("Q79701", "fascism"),
    ("Q7252", "social_democracy"),
    ("Q467052", "democratic_socialism"),
    ("Q193622", "green_politics"),
    ("Q188934", "nationalism"),
    ("Q180046", "populism"),
    ("Q1533647", "christian_democracy"),
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


def get_sparql_query(offset=0):
    """Generate SPARQL query for political parties."""
    return f"""
    SELECT DISTINCT ?party ?partyLabel ?countryLabel ?ideologyLabel 
           ?foundedDate ?dissolvedDate ?leaderLabel ?description ?hqLabel WHERE {{
      ?party wdt:P31/wdt:P279* wd:Q7278 .
      
      OPTIONAL {{ ?party wdt:P17 ?country . }}
      OPTIONAL {{ ?party wdt:P1142 ?ideology . }}
      OPTIONAL {{ ?party wdt:P571 ?foundedDate . }}
      OPTIONAL {{ ?party wdt:P576 ?dissolvedDate . }}
      OPTIONAL {{ ?party wdt:P488 ?leader . }}
      OPTIONAL {{ ?party wdt:P159 ?hq . }}
      OPTIONAL {{ ?party schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?party
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_ideology_query(ideology_id, offset=0):
    """Query parties with a specific ideology."""
    return f"""
    SELECT DISTINCT ?party ?partyLabel ?countryLabel ?ideologyLabel 
           ?foundedDate ?dissolvedDate ?leaderLabel ?description WHERE {{
      ?party wdt:P31/wdt:P279* wd:Q7278 .
      ?party wdt:P1142 wd:{ideology_id} .
      
      OPTIONAL {{ ?party wdt:P17 ?country . }}
      OPTIONAL {{ ?party wdt:P1142 ?ideology . }}
      OPTIONAL {{ ?party wdt:P571 ?foundedDate . }}
      OPTIONAL {{ ?party wdt:P576 ?dissolvedDate . }}
      OPTIONAL {{ ?party wdt:P488 ?leader . }}
      OPTIONAL {{ ?party schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?party
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


def parse_results(results):
    """Parse SPARQL results into party records."""
    parties = []
    
    for binding in results.get("results", {}).get("bindings", []):
        party_uri = binding.get("party", {}).get("value", "")
        wikidata_id = party_uri.split("/")[-1] if party_uri else ""
        
        party = {
            "wikidata_id": wikidata_id,
            "name": binding.get("partyLabel", {}).get("value", ""),
            "country": binding.get("countryLabel", {}).get("value", ""),
            "ideology": [binding.get("ideologyLabel", {}).get("value", "")] if binding.get("ideologyLabel", {}).get("value") else [],
            "founded_date": parse_date(binding.get("foundedDate", {}).get("value", "")),
            "dissolved_date": parse_date(binding.get("dissolvedDate", {}).get("value", "")),
            "leaders": [binding.get("leaderLabel", {}).get("value", "")] if binding.get("leaderLabel", {}).get("value") else [],
            "headquarters": binding.get("hqLabel", {}).get("value", ""),
            "description": binding.get("description", {}).get("value", ""),
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        parties.append(party)
    
    return parties


def deduplicate_parties(parties):
    """Deduplicate parties by wikidata_id, merging ideologies and leaders."""
    seen = {}
    
    for party in parties:
        wid = party["wikidata_id"]
        if wid in seen:
            # Merge ideologies
            existing_ideologies = set(seen[wid]["ideology"])
            new_ideologies = set(party["ideology"])
            seen[wid]["ideology"] = list(existing_ideologies | new_ideologies)
            # Merge leaders
            existing_leaders = set(seen[wid]["leaders"])
            new_leaders = set(party["leaders"])
            seen[wid]["leaders"] = list(existing_leaders | new_leaders)
            # Keep other data if missing
            for key in ["country", "founded_date", "dissolved_date", "headquarters", "description"]:
                if party.get(key) and not seen[wid].get(key):
                    seen[wid][key] = party[key]
        else:
            seen[wid] = party
    
    # Clean up empty strings in lists
    for party in seen.values():
        party["ideology"] = [i for i in party["ideology"] if i]
        party["leaders"] = [l for l in party["leaders"] if l]
    
    return list(seen.values())


def load_state():
    """Load scraper state for resumability."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return {"main_offset": 0, "completed_ideologies": [], "total_parties": 0}


def save_state(state):
    """Save scraper state."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def save_parties(parties, file_index, logger):
    """Save parties to JSON file."""
    filename = f"parties_{file_index:04d}.json"
    filepath = OUTPUT_DIR / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(parties, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(parties)} parties to {filename}")
    return filepath


def main():
    """Main scraper function."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logger = setup_logging()
    
    logger.info("Starting Wikidata Political Parties Scraper")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    state = load_state()
    all_parties = []
    file_index = 1
    
    existing_files = list(OUTPUT_DIR.glob("parties_*.json"))
    if existing_files:
        file_index = max(int(f.stem.split("_")[1]) for f in existing_files) + 1
    
    # Main query for all political parties
    if "main_query" not in state.get("completed_ideologies", []):
        logger.info("Scraping all political parties...")
        offset = state.get("main_offset", 0)
        
        while True:
            query = get_sparql_query(offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed at offset {offset}")
                break
            
            batch = parse_results(results)
            
            if not batch:
                logger.info("  No more results")
                break
            
            all_parties.extend(batch)
            logger.info(f"  Got {len(batch)} parties (total: {len(all_parties)})")
            
            offset += BATCH_SIZE
            state["main_offset"] = offset
            save_state(state)
            
            if len(batch) < BATCH_SIZE:
                break
        
        state["completed_ideologies"].append("main_query")
        save_state(state)
    
    # Query by ideology to ensure we get parties with specific ideologies
    for ideology_id, ideology_name in IDEOLOGIES:
        if ideology_name in state.get("completed_ideologies", []):
            logger.info(f"Skipping already completed ideology: {ideology_name}")
            continue
        
        logger.info(f"Scraping parties with ideology: {ideology_name} ({ideology_id})")
        offset = 0
        
        while True:
            query = get_ideology_query(ideology_id, offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed for {ideology_name} at offset {offset}")
                break
            
            batch = parse_results(results)
            
            if not batch:
                break
            
            all_parties.extend(batch)
            logger.info(f"  Got {len(batch)} parties (total: {len(all_parties)})")
            
            offset += BATCH_SIZE
            
            if len(batch) < BATCH_SIZE:
                break
        
        state["completed_ideologies"].append(ideology_name)
        save_state(state)
    
    # Deduplicate
    logger.info(f"Deduplicating {len(all_parties)} parties...")
    all_parties = deduplicate_parties(all_parties)
    logger.info(f"After deduplication: {len(all_parties)} unique parties")
    
    # Save in chunks respecting file size limit
    current_chunk = []
    current_size = 0
    
    for party in all_parties:
        party_json = json.dumps(party, ensure_ascii=False)
        party_size = len(party_json.encode("utf-8"))
        
        if current_size + party_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            save_parties(current_chunk, file_index, logger)
            file_index += 1
            current_chunk = []
            current_size = 0
        
        current_chunk.append(party)
        current_size += party_size
    
    if current_chunk:
        save_parties(current_chunk, file_index, logger)
    
    if STATE_FILE.exists():
        STATE_FILE.unlink()
    
    logger.info(f"Scraping complete! Total unique parties: {len(all_parties)}")
    
    return len(all_parties)


if __name__ == "__main__":
    main()
