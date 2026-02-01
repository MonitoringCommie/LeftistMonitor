#!/usr/bin/env python3
"""
Scrape feminist movement data from Wikidata.

Queries for: feminists, suffragettes, women's rights activists,
feminist organizations, women's suffrage events.
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/movements/feminist")
STATE_FILE = OUTPUT_DIR / ".scraper_state.json"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
MAX_FILE_SIZE_MB = 50
RATE_LIMIT_SECONDS = 2.0
BATCH_SIZE = 2000
MAX_RETRIES = 5

# Topics to query (Wikidata Q-IDs)
PERSON_TYPES = [
    ("Q131512", "feminist"),
    ("Q1292263", "suffragette"),
    ("Q15253558", "activist"),
]

MOVEMENT_TOPICS = [
    "feminism",
    "women's suffrage",
    "women's rights",
    "reproductive rights",
    "gender equality",
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


def get_feminists_query(occupation_id: str, offset: int = 0) -> str:
    """Generate SPARQL query for feminists by occupation."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate 
           ?countryLabel ?description ?genderLabel WHERE {{
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P106 wd:{occupation_id} .
      
      OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
      OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
      OPTIONAL {{ ?person wdt:P27 ?country . }}
      OPTIONAL {{ ?person wdt:P21 ?gender . }}
      OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?person
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_suffrage_events_query(offset: int = 0) -> str:
    """Query for women's suffrage events worldwide."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P31/wdt:P279* wd:Q1752346 .  # women's suffrage
      }} UNION {{
        ?event wdt:P361 wd:Q1752346 .  # part of women's suffrage
      }} UNION {{
        ?event wdt:P921 wd:Q1752346 .  # main subject: women's suffrage
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


def get_feminist_orgs_query(offset: int = 0) -> str:
    """Query for feminist organizations."""
    return f"""
    SELECT DISTINCT ?org ?orgLabel ?foundedDate ?countryLabel 
           ?description ?websiteLabel WHERE {{
      {{
        ?org wdt:P31/wdt:P279* wd:Q4830453 .  # organization
        ?org wdt:P101 wd:Q131512 .  # field of work: feminism
      }} UNION {{
        ?org wdt:P31 wd:Q1393724 .  # women's organization
      }} UNION {{
        ?org wdt:P31 wd:Q3918 .  # organization
        ?org wdt:P921 wd:Q131512 .  # main subject: feminism
      }}
      
      OPTIONAL {{ ?org wdt:P571 ?foundedDate . }}
      OPTIONAL {{ ?org wdt:P17 ?country . }}
      OPTIONAL {{ ?org wdt:P856 ?website . }}
      OPTIONAL {{ ?org schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?org
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_feminist_books_query(offset: int = 0) -> str:
    """Query for feminist literature."""
    return f"""
    SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate 
           ?description WHERE {{
      ?book wdt:P31/wdt:P279* wd:Q7725634 .  # literary work
      ?book wdt:P921 wd:Q131512 .  # main subject: feminism
      
      OPTIONAL {{ ?book wdt:P50 ?author . }}
      OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
      OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?book
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
            
            if response.status_code == 429 or response.status_code == 503:
                wait_time = (attempt + 1) * 30
                logger.warning(f"Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
                
            if response.status_code == 504:
                wait_time = (attempt + 1) * 60
                logger.warning(f"Gateway timeout. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
                
            response.raise_for_status()
            return response.json().get("results", {}).get("bindings", [])
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed (attempt {attempt + 1}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep((attempt + 1) * 15)
            continue
    
    return []


def parse_person(result: dict) -> dict:
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
    
    wikidata_id = get_value("person")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("personLabel"),
        "birth_year": get_year("birthDate"),
        "death_year": get_year("deathDate"),
        "nationality": get_value("countryLabel"),
        "gender": get_value("genderLabel"),
        "description": get_value("description"),
        "person_types": ["feminist"],
        "ideology_tags": ["feminism"],
    }


def parse_event(result: dict) -> dict:
    """Parse an event result from Wikidata."""
    def get_value(key: str) -> Optional[str]:
        return result.get(key, {}).get("value")
    
    wikidata_id = get_value("event")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("eventLabel"),
        "date": get_value("date"),
        "country": get_value("countryLabel"),
        "description": get_value("description"),
        "category": "feminist_movement",
        "tags": ["feminism", "suffrage", "women's rights"],
    }


def parse_org(result: dict) -> dict:
    """Parse an organization result from Wikidata."""
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
    
    wikidata_id = get_value("org")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("orgLabel"),
        "founded_year": get_year("foundedDate"),
        "country": get_value("countryLabel"),
        "description": get_value("description"),
        "website": get_value("websiteLabel"),
        "org_type": "feminist_organization",
    }


def parse_book(result: dict) -> dict:
    """Parse a book result from Wikidata."""
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
    
    wikidata_id = get_value("book")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "title": get_value("bookLabel"),
        "author": get_value("authorLabel"),
        "publication_year": get_year("pubDate"),
        "description": get_value("description"),
        "topics": ["feminism"],
    }


def save_results(data: list, filename: str):
    """Save results to JSON file."""
    output_path = OUTPUT_DIR / filename
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(data)} records to {output_path}")


def scrape_feminists():
    """Scrape feminist figures from Wikidata."""
    all_people = []
    seen_ids = set()
    
    for occupation_id, occupation_name in PERSON_TYPES:
        logger.info(f"Scraping {occupation_name} (Q{occupation_id})...")
        offset = 0
        
        while True:
            query = get_feminists_query(occupation_id, offset)
            results = query_wikidata(query)
            
            if not results:
                break
            
            for result in results:
                person = parse_person(result)
                if person["wikidata_id"] and person["wikidata_id"] not in seen_ids:
                    seen_ids.add(person["wikidata_id"])
                    person["occupation_type"] = occupation_name
                    all_people.append(person)
            
            logger.info(f"  {occupation_name}: {len(results)} results at offset {offset}, total unique: {len(all_people)}")
            
            if len(results) < BATCH_SIZE:
                break
                
            offset += BATCH_SIZE
            time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_people, "feminist_figures.json")
    return all_people


def scrape_suffrage_events():
    """Scrape women's suffrage events."""
    all_events = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping suffrage events...")
    
    while True:
        query = get_suffrage_events_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            event = parse_event(result)
            if event["wikidata_id"] and event["wikidata_id"] not in seen_ids:
                seen_ids.add(event["wikidata_id"])
                all_events.append(event)
        
        logger.info(f"  Events: {len(results)} results at offset {offset}, total unique: {len(all_events)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_events, "suffrage_events.json")
    return all_events


def scrape_feminist_orgs():
    """Scrape feminist organizations."""
    all_orgs = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping feminist organizations...")
    
    while True:
        query = get_feminist_orgs_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            org = parse_org(result)
            if org["wikidata_id"] and org["wikidata_id"] not in seen_ids:
                seen_ids.add(org["wikidata_id"])
                all_orgs.append(org)
        
        logger.info(f"  Orgs: {len(results)} results at offset {offset}, total unique: {len(all_orgs)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_orgs, "feminist_organizations.json")
    return all_orgs


def scrape_feminist_books():
    """Scrape feminist literature."""
    all_books = []
    seen_ids = set()
    offset = 0
    
    logger.info("Scraping feminist books...")
    
    while True:
        query = get_feminist_books_query(offset)
        results = query_wikidata(query)
        
        if not results:
            break
        
        for result in results:
            book = parse_book(result)
            if book["wikidata_id"] and book["wikidata_id"] not in seen_ids:
                seen_ids.add(book["wikidata_id"])
                all_books.append(book)
        
        logger.info(f"  Books: {len(results)} results at offset {offset}, total unique: {len(all_books)}")
        
        if len(results) < BATCH_SIZE:
            break
            
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    
    save_results(all_books, "feminist_books.json")
    return all_books


def main():
    """Main scraping function."""
    logger.info("=" * 60)
    logger.info("Starting Feminist Movements Wikidata Scraper")
    logger.info("=" * 60)
    
    start_time = datetime.now()
    
    # Scrape all categories
    people = scrape_feminists()
    events = scrape_suffrage_events()
    orgs = scrape_feminist_orgs()
    books = scrape_feminist_books()
    
    # Summary
    elapsed = datetime.now() - start_time
    logger.info("=" * 60)
    logger.info("Scraping Complete!")
    logger.info(f"  Feminist figures: {len(people)}")
    logger.info(f"  Suffrage events: {len(events)}")
    logger.info(f"  Organizations: {len(orgs)}")
    logger.info(f"  Books: {len(books)}")
    logger.info(f"  Total records: {len(people) + len(events) + len(orgs) + len(books)}")
    logger.info(f"  Elapsed time: {elapsed}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
