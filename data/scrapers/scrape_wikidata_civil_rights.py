#!/usr/bin/env python3
"""
Scrape civil rights and racial justice data from Wikidata.

Queries for: civil rights activists, anti-colonial leaders, abolitionists,
civil rights events, anti-apartheid movement, decolonization.
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/movements/civil_rights")
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
RATE_LIMIT_SECONDS = 2.0
BATCH_SIZE = 2000
MAX_RETRIES = 5

# Civil rights related occupations/movements
PERSON_TYPES = [
    ("Q15253558", "activist"),
    ("Q47064", "civil_rights_activist"),
    ("Q1277575", "abolitionist"),
    ("Q1233637", "anti_apartheid_activist"),
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


logger = setup_logging()


def get_activists_query(occupation_id: str, offset: int = 0) -> str:
    """Generate SPARQL query for civil rights activists."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate 
           ?countryLabel ?description ?movementLabel WHERE {{
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P106 wd:{occupation_id} .
      
      OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
      OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
      OPTIONAL {{ ?person wdt:P27 ?country . }}
      OPTIONAL {{ ?person wdt:P135 ?movement . }}
      OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?person
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_civil_rights_events_query(offset: int = 0) -> str:
    """Query for civil rights movement events."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel 
           ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P361 wd:Q193384 .  # part of: civil rights movement
      }} UNION {{
        ?event wdt:P921 wd:Q193384 .  # main subject: civil rights movement
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q188055 .  # protest
        ?event wdt:P921 wd:Q5398 .  # main subject: racism
      }}
      
      OPTIONAL {{ ?event wdt:P585 ?date . }}
      OPTIONAL {{ ?event wdt:P276 ?location . }}
      OPTIONAL {{ ?event wdt:P17 ?country . }}
      OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?event
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_decolonization_events_query(offset: int = 0) -> str:
    """Query for decolonization and independence events."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P31/wdt:P279* wd:Q178285 .  # independence declaration
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q180684 .  # revolution
        ?event wdt:P921 wd:Q7184 .  # main subject: colonialism
      }} UNION {{
        ?event wdt:P361 wd:Q7184 .  # part of: colonialism
      }}
      
      OPTIONAL {{ ?event wdt:P585 ?date . }}
      OPTIONAL {{ ?event wdt:P17 ?country . }}
      OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?event
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_anti_apartheid_query(offset: int = 0) -> str:
    """Query for anti-apartheid movement data."""
    return f"""
    SELECT DISTINCT ?item ?itemLabel ?date ?typeLabel 
           ?countryLabel ?description WHERE {{
      {{
        ?item wdt:P361 wd:Q270355 .  # part of: anti-apartheid movement
      }} UNION {{
        ?item wdt:P921 wd:Q270355 .  # main subject: anti-apartheid
      }} UNION {{
        ?item wdt:P106 wd:Q1233637 .  # occupation: anti-apartheid activist
        ?item wdt:P31 wd:Q5 .
      }}
      
      OPTIONAL {{ ?item wdt:P585 ?date . }}
      OPTIONAL {{ ?item wdt:P31 ?type . }}
      OPTIONAL {{ ?item wdt:P17 ?country . }}
      OPTIONAL {{ ?item schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?item
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_pan_african_leaders_query(offset: int = 0) -> str:
    """Query for Pan-African movement leaders."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate 
           ?countryLabel ?description WHERE {{
      {{
        ?person wdt:P135 wd:Q176651 .  # movement: Pan-Africanism
        ?person wdt:P31 wd:Q5 .
      }} UNION {{
        ?person wdt:P106 wd:Q82955 .  # politician
        ?person wdt:P27 ?africanCountry .
        ?africanCountry wdt:P30 wd:Q15 .  # continent: Africa
        ?person wdt:P39 ?position .  # held position
        ?position wdt:P31/wdt:P279* wd:Q11696 .  # head of state
      }}
      
      OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
      OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
      OPTIONAL {{ ?person wdt:P27 ?country . }}
      OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?person
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def query_wikidata(sparql_query: str) -> list:
    """Execute SPARQL query against Wikidata with retry logic."""
    headers = {
        "User-Agent": "LeftistMonitor/1.0 (https://github.com/leftistmonitor)",
        "Accept": "application/json"
    }
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(
                WIKIDATA_ENDPOINT,
                params={"query": sparql_query, "format": "json"},
                headers=headers,
                timeout=120
            )
            
            if response.status_code in [429, 503, 504]:
                wait_time = (attempt + 1) * 30
                logger.warning(f"Rate limited/timeout. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
                
            response.raise_for_status()
            return response.json().get("results", {}).get("bindings", [])
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed (attempt {attempt + 1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep((attempt + 1) * 15)
    
    return []


def parse_person(result: dict, category: str = "activist") -> dict:
    """Parse a person result from Wikidata."""
    def get_value(key: str) -> Optional[str]:
        return result.get(key, {}).get("value")
    
    def get_year(key: str) -> Optional[int]:
        val = get_value(key)
        if val:
            try:
                return int(val[:4])
            except:
                pass
        return None
    
    wikidata_id = get_value("person") or get_value("item")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("personLabel") or get_value("itemLabel"),
        "birth_year": get_year("birthDate"),
        "death_year": get_year("deathDate"),
        "nationality": get_value("countryLabel"),
        "description": get_value("description"),
        "movement": get_value("movementLabel"),
        "person_types": [category],
        "ideology_tags": ["civil_rights", "anti_racism"],
    }


def parse_event(result: dict, category: str = "civil_rights") -> dict:
    """Parse an event result from Wikidata."""
    def get_value(key: str) -> Optional[str]:
        return result.get(key, {}).get("value")
    
    wikidata_id = get_value("event") or get_value("item")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("eventLabel") or get_value("itemLabel"),
        "date": get_value("date"),
        "location": get_value("locationLabel"),
        "country": get_value("countryLabel"),
        "description": get_value("description"),
        "category": category,
        "tags": ["civil_rights", "racial_justice"],
    }


def save_results(data: list, filename: str):
    """Save results to JSON file."""
    output_path = OUTPUT_DIR / filename
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(data)} records to {output_path}")


def scrape_activists():
    """Scrape civil rights activists."""
    all_people = []
    seen_ids = set()
    
    for occupation_id, occupation_name in PERSON_TYPES:
        logger.info(f"Scraping {occupation_name}...")
        offset = 0
        
        while True:
            query = get_activists_query(occupation_id, offset)
            results = query_wikidata(query)
            
            if not results:
                break
            
            for result in results:
                person = parse_person(result, occupation_name)
                if person["wikidata_id"] and person["wikidata_id"] not in seen_ids:
                    seen_ids.add(person["wikidata_id"])
                    all_people.append(person)
            
            logger.info(f"  {occupation_name}: {len(results)} at offset {offset}, total: {len(all_people)}")
            
            if len(results) < BATCH_SIZE:
                break
                
            offset += BATCH_SIZE
            time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_people, "civil_rights_activists.json")
    return all_people


def scrape_civil_rights_events():
    """Scrape civil rights movement events."""
    all_events = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping civil rights events...")
    
    while True:
        query = get_civil_rights_events_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            event = parse_event(result, "civil_rights")
            if event["wikidata_id"] and event["wikidata_id"] not in seen_ids:
                seen_ids.add(event["wikidata_id"])
                all_events.append(event)
        
        logger.info(f"  Events: {len(results)} at offset {offset}, total: {len(all_events)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_events, "civil_rights_events.json")
    return all_events


def scrape_decolonization():
    """Scrape decolonization events."""
    all_events = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping decolonization events...")
    
    while True:
        query = get_decolonization_events_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            event = parse_event(result, "decolonization")
            if event["wikidata_id"] and event["wikidata_id"] not in seen_ids:
                seen_ids.add(event["wikidata_id"])
                all_events.append(event)
        
        logger.info(f"  Decolonization: {len(results)} at offset {offset}, total: {len(all_events)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_events, "decolonization_events.json")
    return all_events


def scrape_anti_apartheid():
    """Scrape anti-apartheid movement data."""
    all_items = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping anti-apartheid movement...")
    
    while True:
        query = get_anti_apartheid_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            item = parse_event(result, "anti_apartheid")
            if item["wikidata_id"] and item["wikidata_id"] not in seen_ids:
                seen_ids.add(item["wikidata_id"])
                all_items.append(item)
        
        logger.info(f"  Anti-apartheid: {len(results)} at offset {offset}, total: {len(all_items)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_items, "anti_apartheid.json")
    return all_items


def scrape_pan_african():
    """Scrape Pan-African leaders."""
    all_people = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping Pan-African leaders...")
    
    while True:
        query = get_pan_african_leaders_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            person = parse_person(result, "pan_african_leader")
            if person["wikidata_id"] and person["wikidata_id"] not in seen_ids:
                seen_ids.add(person["wikidata_id"])
                all_people.append(person)
        
        logger.info(f"  Pan-African: {len(results)} at offset {offset}, total: {len(all_people)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_people, "pan_african_leaders.json")
    return all_people


def main():
    """Main scraping function."""
    logger.info("=" * 60)
    logger.info("Starting Civil Rights Wikidata Scraper")
    logger.info("=" * 60)
    
    start_time = datetime.now()
    
    activists = scrape_activists()
    civil_rights_events = scrape_civil_rights_events()
    decolonization = scrape_decolonization()
    anti_apartheid = scrape_anti_apartheid()
    pan_african = scrape_pan_african()
    
    total = len(activists) + len(civil_rights_events) + len(decolonization) + len(anti_apartheid) + len(pan_african)
    
    elapsed = datetime.now() - start_time
    logger.info("=" * 60)
    logger.info("Scraping Complete!")
    logger.info(f"  Activists: {len(activists)}")
    logger.info(f"  Civil Rights Events: {len(civil_rights_events)}")
    logger.info(f"  Decolonization Events: {len(decolonization)}")
    logger.info(f"  Anti-Apartheid: {len(anti_apartheid)}")
    logger.info(f"  Pan-African Leaders: {len(pan_african)}")
    logger.info(f"  Total records: {total}")
    logger.info(f"  Elapsed time: {elapsed}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
