#!/usr/bin/env python3
"""
Scrape slavery and colonial economics data from Wikidata.

Queries for: enslaved people, abolitionists, slave trade ports,
plantations, slave rebellions, colonial events.
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/history/slavery")
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
RATE_LIMIT_SECONDS = 2.0
BATCH_SIZE = 2000
MAX_RETRIES = 5


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


def get_abolitionists_query(offset: int = 0) -> str:
    """Query for abolitionists."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate 
           ?countryLabel ?description WHERE {{
      ?person wdt:P106 wd:Q1277575 .  # occupation: abolitionist
      ?person wdt:P31 wd:Q5 .
      
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


def get_slave_rebellions_query(offset: int = 0) -> str:
    """Query for slave rebellions and uprisings."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel 
           ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P31/wdt:P279* wd:Q124757 .  # slave rebellion
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q180684 .  # revolution
        ?event wdt:P921 wd:Q8463 .  # main subject: slavery
      }} UNION {{
        ?event wdt:P361 wd:Q8463 .  # part of: slavery
        ?event wdt:P31/wdt:P279* wd:Q124757 .
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


def get_slave_trade_ports_query(offset: int = 0) -> str:
    """Query for slave trade ports and locations."""
    return f"""
    SELECT DISTINCT ?place ?placeLabel ?countryLabel ?coord ?description WHERE {{
      {{
        ?place wdt:P31/wdt:P279* wd:Q515 .  # city
        ?place wdt:P1269 wd:Q213247 .  # facet of: Atlantic slave trade
      }} UNION {{
        ?place wdt:P361 wd:Q213247 .  # part of: Atlantic slave trade
      }} UNION {{
        ?place wdt:P31/wdt:P279* wd:Q515 .
        ?place wdt:P366 wd:Q213247 .  # use: Atlantic slave trade
      }}
      
      OPTIONAL {{ ?place wdt:P17 ?country . }}
      OPTIONAL {{ ?place wdt:P625 ?coord . }}
      OPTIONAL {{ ?place schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?place
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_colonial_events_query(offset: int = 0) -> str:
    """Query for colonial period events."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel 
           ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P361 wd:Q7184 .  # part of: colonialism
      }} UNION {{
        ?event wdt:P921 wd:Q7184 .  # main subject: colonialism
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q213247 .  # Atlantic slave trade
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


def get_slavery_books_query(offset: int = 0) -> str:
    """Query for books about slavery and abolition."""
    return f"""
    SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description WHERE {{
      ?book wdt:P31/wdt:P279* wd:Q7725634 .  # literary work
      {{
        ?book wdt:P921 wd:Q8463 .  # main subject: slavery
      }} UNION {{
        ?book wdt:P921 wd:Q170156 .  # main subject: abolitionism
      }} UNION {{
        ?book wdt:P921 wd:Q213247 .  # main subject: Atlantic slave trade
      }}
      
      OPTIONAL {{ ?book wdt:P50 ?author . }}
      OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
      OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?book
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_plantations_query(offset: int = 0) -> str:
    """Query for historical plantations."""
    return f"""
    SELECT DISTINCT ?place ?placeLabel ?countryLabel ?coord 
           ?cropLabel ?description WHERE {{
      ?place wdt:P31/wdt:P279* wd:Q188913 .  # plantation
      
      OPTIONAL {{ ?place wdt:P17 ?country . }}
      OPTIONAL {{ ?place wdt:P625 ?coord . }}
      OPTIONAL {{ ?place wdt:P111 ?crop . }}
      OPTIONAL {{ ?place schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?place
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_colonial_companies_query(offset: int = 0) -> str:
    """Query for colonial trading companies."""
    return f"""
    SELECT DISTINCT ?company ?companyLabel ?foundedDate ?dissolvedDate 
           ?countryLabel ?description WHERE {{
      {{
        ?company wdt:P31 wd:Q1377155 .  # chartered company
      }} UNION {{
        ?company wdt:P31/wdt:P279* wd:Q891723 .  # trading company
        ?company wdt:P571 ?foundedDate .
        FILTER(YEAR(?foundedDate) < 1900)
      }}
      
      OPTIONAL {{ ?company wdt:P571 ?foundedDate . }}
      OPTIONAL {{ ?company wdt:P576 ?dissolvedDate . }}
      OPTIONAL {{ ?company wdt:P17 ?country . }}
      OPTIONAL {{ ?company schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?company
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


def parse_person(result: dict) -> dict:
    """Parse a person result."""
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
        "description": get_value("description"),
        "person_types": ["abolitionist"],
        "ideology_tags": ["abolitionism", "anti_slavery"],
    }


def parse_event(result: dict, category: str) -> dict:
    """Parse an event result."""
    def get_value(key: str) -> Optional[str]:
        return result.get(key, {}).get("value")
    
    wikidata_id = get_value("event")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("eventLabel"),
        "date": get_value("date"),
        "location": get_value("locationLabel"),
        "country": get_value("countryLabel"),
        "description": get_value("description"),
        "category": category,
        "tags": ["slavery", "colonial_history"],
    }


def parse_place(result: dict, place_type: str) -> dict:
    """Parse a place result."""
    def get_value(key: str) -> Optional[str]:
        return result.get(key, {}).get("value")
    
    wikidata_id = get_value("place")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("placeLabel"),
        "country": get_value("countryLabel"),
        "coordinates": get_value("coord"),
        "description": get_value("description"),
        "place_type": place_type,
        "crop": get_value("cropLabel"),
    }


def parse_book(result: dict) -> dict:
    """Parse a book result."""
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
        "topics": ["slavery", "abolition"],
    }


def parse_company(result: dict) -> dict:
    """Parse a company result."""
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
    
    wikidata_id = get_value("company")
    if wikidata_id:
        wikidata_id = wikidata_id.split("/")[-1]
    
    return {
        "wikidata_id": wikidata_id,
        "name": get_value("companyLabel"),
        "founded_year": get_year("foundedDate"),
        "dissolved_year": get_year("dissolvedDate"),
        "country": get_value("countryLabel"),
        "description": get_value("description"),
        "company_type": "colonial_trading_company",
    }


def save_results(data: list, filename: str):
    """Save results to JSON file."""
    output_path = OUTPUT_DIR / filename
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    logger.info(f"Saved {len(data)} records to {output_path}")


def scrape_all():
    """Run all scrapers."""
    results = {}
    
    # Abolitionists
    logger.info("Scraping abolitionists...")
    abolitionists = []
    seen = set()
    offset = 0
    while True:
        query = get_abolitionists_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            p = parse_person(r)
            if p["wikidata_id"] and p["wikidata_id"] not in seen:
                seen.add(p["wikidata_id"])
                abolitionists.append(p)
        logger.info(f"  Abolitionists: {len(data)} at offset {offset}, total: {len(abolitionists)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(abolitionists, "abolitionists.json")
    results["abolitionists"] = len(abolitionists)
    
    # Slave rebellions
    logger.info("Scraping slave rebellions...")
    rebellions = []
    seen = set()
    offset = 0
    while True:
        query = get_slave_rebellions_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            e = parse_event(r, "slave_rebellion")
            if e["wikidata_id"] and e["wikidata_id"] not in seen:
                seen.add(e["wikidata_id"])
                rebellions.append(e)
        logger.info(f"  Rebellions: {len(data)} at offset {offset}, total: {len(rebellions)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(rebellions, "slave_rebellions.json")
    results["rebellions"] = len(rebellions)
    
    # Slave trade ports
    logger.info("Scraping slave trade ports...")
    ports = []
    seen = set()
    offset = 0
    while True:
        query = get_slave_trade_ports_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            p = parse_place(r, "slave_trade_port")
            if p["wikidata_id"] and p["wikidata_id"] not in seen:
                seen.add(p["wikidata_id"])
                ports.append(p)
        logger.info(f"  Ports: {len(data)} at offset {offset}, total: {len(ports)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(ports, "slave_trade_ports.json")
    results["ports"] = len(ports)
    
    # Colonial events
    logger.info("Scraping colonial events...")
    events = []
    seen = set()
    offset = 0
    while True:
        query = get_colonial_events_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            e = parse_event(r, "colonial")
            if e["wikidata_id"] and e["wikidata_id"] not in seen:
                seen.add(e["wikidata_id"])
                events.append(e)
        logger.info(f"  Colonial events: {len(data)} at offset {offset}, total: {len(events)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(events, "colonial_events.json")
    results["colonial_events"] = len(events)
    
    # Slavery books
    logger.info("Scraping slavery books...")
    books = []
    seen = set()
    offset = 0
    while True:
        query = get_slavery_books_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            b = parse_book(r)
            if b["wikidata_id"] and b["wikidata_id"] not in seen:
                seen.add(b["wikidata_id"])
                books.append(b)
        logger.info(f"  Books: {len(data)} at offset {offset}, total: {len(books)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(books, "slavery_books.json")
    results["books"] = len(books)
    
    # Plantations
    logger.info("Scraping plantations...")
    plantations = []
    seen = set()
    offset = 0
    while True:
        query = get_plantations_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            p = parse_place(r, "plantation")
            if p["wikidata_id"] and p["wikidata_id"] not in seen:
                seen.add(p["wikidata_id"])
                plantations.append(p)
        logger.info(f"  Plantations: {len(data)} at offset {offset}, total: {len(plantations)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(plantations, "plantations.json")
    results["plantations"] = len(plantations)
    
    # Colonial companies
    logger.info("Scraping colonial companies...")
    companies = []
    seen = set()
    offset = 0
    while True:
        query = get_colonial_companies_query(offset)
        data = query_wikidata(query)
        if not data:
            break
        for r in data:
            c = parse_company(r)
            if c["wikidata_id"] and c["wikidata_id"] not in seen:
                seen.add(c["wikidata_id"])
                companies.append(c)
        logger.info(f"  Companies: {len(data)} at offset {offset}, total: {len(companies)}")
        if len(data) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
        time.sleep(RATE_LIMIT_SECONDS)
    save_results(companies, "colonial_companies.json")
    results["companies"] = len(companies)
    
    return results


def main():
    """Main scraping function."""
    logger.info("=" * 60)
    logger.info("Starting Slavery & Colonial Economics Wikidata Scraper")
    logger.info("=" * 60)
    
    start_time = datetime.now()
    results = scrape_all()
    
    total = sum(results.values())
    elapsed = datetime.now() - start_time
    
    logger.info("=" * 60)
    logger.info("Scraping Complete!")
    for key, count in results.items():
        logger.info(f"  {key}: {count}")
    logger.info(f"  Total records: {total}")
    logger.info(f"  Elapsed time: {elapsed}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
