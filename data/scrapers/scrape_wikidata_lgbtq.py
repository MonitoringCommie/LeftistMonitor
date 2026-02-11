#!/usr/bin/env python3
"""
Scrape LGBTQ+ rights and history data from Wikidata.

Queries for: LGBTQ+ activists, pride events, organizations,
marriage equality milestones, significant figures.
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/movements/lgbtq")
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


def query_wikidata(sparql_query: str, retries: int = MAX_RETRIES) -> Optional[dict]:
    """Execute a SPARQL query against Wikidata."""
    headers = {
        "Accept": "application/sparql-results+json",
        "User-Agent": "LeftistMonitor/1.0 (https://github.com/leftistmonitor)"
    }
    
    for attempt in range(retries):
        try:
            response = requests.get(
                WIKIDATA_ENDPOINT,
                params={"query": sparql_query, "format": "json"},
                headers=headers,
                timeout=120
            )
            response.raise_for_status()
            time.sleep(RATE_LIMIT_SECONDS)
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.warning(f"Request failed (attempt {attempt + 1}/{retries}): {e}")
            if attempt < retries - 1:
                time.sleep(RATE_LIMIT_SECONDS * (attempt + 2))
            else:
                logger.error(f"All retries failed for query")
                return None
    return None


def get_lgbtq_activists_query(offset: int = 0) -> str:
    """Query for LGBTQ+ activists and rights advocates."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate
           ?countryLabel ?description ?genderLabel WHERE {{
      {{
        ?person wdt:P106 wd:Q15253558 .  # activist
        ?person wdt:P135 wd:Q6511912 .   # movement: LGBT rights
      }} UNION {{
        ?person wdt:P106 wd:Q97766381 .  # LGBT rights activist
      }} UNION {{
        ?person wdt:P106 wd:Q1233637 .   # social activist
        ?person wdt:P101 wd:Q6511912 .   # field of work: LGBT rights
      }}
      
      ?person wdt:P31 wd:Q5 .  # is human
      
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


def get_trans_activists_query(offset: int = 0) -> str:
    """Query for transgender activists specifically."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate
           ?countryLabel ?description WHERE {{
      {{
        ?person wdt:P106 wd:Q15253558 .  # activist
        ?person wdt:P21 wd:Q1052281 .    # transgender woman
      }} UNION {{
        ?person wdt:P106 wd:Q15253558 .  # activist
        ?person wdt:P21 wd:Q2449503 .    # transgender man
      }} UNION {{
        ?person wdt:P106 wd:Q15253558 .  # activist
        ?person wdt:P21 wd:Q48270 .      # non-binary
      }}
      
      ?person wdt:P31 wd:Q5 .  # is human
      
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


def get_pride_events_query(offset: int = 0) -> str:
    """Query for Pride parades and LGBTQ+ events."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel
           ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P31/wdt:P279* wd:Q51404 .  # instance of: pride parade
      }} UNION {{
        ?event wdt:P31 wd:Q15275719 .  # recurring event
        ?event wdt:P921 wd:Q6511912 .  # main subject: LGBT rights
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q188055 .  # protest
        ?event wdt:P921 wd:Q6511912 .  # main subject: LGBT rights
      }}

      OPTIONAL {{ ?event wdt:P585 ?date . }}
      OPTIONAL {{ ?event wdt:P580 ?date . }}
      OPTIONAL {{ ?event wdt:P276 ?location . }}
      OPTIONAL {{ ?event wdt:P17 ?country . }}
      OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}

      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?event
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_lgbtq_organizations_query(offset: int = 0) -> str:
    """Query for LGBTQ+ organizations."""
    return f"""
    SELECT DISTINCT ?org ?orgLabel ?foundDate ?locationLabel
           ?countryLabel ?description WHERE {{
      {{
        ?org wdt:P31/wdt:P279* wd:Q43229 .  # organization
        ?org wdt:P101 wd:Q6511912 .  # field of work: LGBT rights
      }} UNION {{
        ?org wdt:P31/wdt:P279* wd:Q43229 .  # organization
        ?org wdt:P921 wd:Q6511912 .  # main subject: LGBT rights
      }} UNION {{
        ?org wdt:P31 wd:Q4438139 .  # LGBT organization
      }}

      OPTIONAL {{ ?org wdt:P571 ?foundDate . }}
      OPTIONAL {{ ?org wdt:P159 ?location . }}
      OPTIONAL {{ ?org wdt:P17 ?country . }}
      OPTIONAL {{ ?org schema:description ?description . FILTER(LANG(?description) = "en") }}

      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY ?org
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_marriage_equality_query() -> str:
    """Query for same-sex marriage legalization events."""
    return """
    SELECT DISTINCT ?country ?countryLabel ?legalDate WHERE {
      ?country wdt:P31/wdt:P279* wd:Q6256 .  # is a country
      ?country p:P3140 ?statement .           # same-sex marriage status
      ?statement ps:P3140 wd:Q15901249 .      # status: legal
      
      OPTIONAL { ?statement pq:P580 ?legalDate . }  # start date
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?legalDate
    """


def get_lgbtq_books_query(offset: int = 0) -> str:
    """Query for LGBTQ+ literature and books."""
    return f"""
    SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description WHERE {{
      {{
        ?book wdt:P31/wdt:P279* wd:Q571 .  # book
        ?book wdt:P921 wd:Q6511912 .       # main subject: LGBT rights
      }} UNION {{
        ?book wdt:P31/wdt:P279* wd:Q571 .  # book
        ?book wdt:P136 wd:Q392386 .        # genre: LGBT literature
      }} UNION {{
        ?book wdt:P31/wdt:P279* wd:Q571 .  # book
        ?book wdt:P921 wd:Q160016 .        # main subject: transgender
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


def process_person(item: dict) -> dict:
    """Process a person result into our format."""
    birth_date = item.get("birthDate", {}).get("value", "")
    death_date = item.get("deathDate", {}).get("value", "")
    
    return {
        "wikidata_id": item.get("person", {}).get("value", "").split("/")[-1],
        "name": item.get("personLabel", {}).get("value", ""),
        "birth_date": birth_date[:10] if birth_date else None,
        "death_date": death_date[:10] if death_date else None,
        "country": item.get("countryLabel", {}).get("value", ""),
        "description": item.get("description", {}).get("value", ""),
        "gender": item.get("genderLabel", {}).get("value", ""),
        "person_types": ["lgbtq_activist"],
    }


def process_event(item: dict) -> dict:
    """Process an event result into our format."""
    date = item.get("date", {}).get("value", "")
    
    return {
        "wikidata_id": item.get("event", {}).get("value", "").split("/")[-1],
        "name": item.get("eventLabel", {}).get("value", ""),
        "date": date[:10] if date else None,
        "location": item.get("locationLabel", {}).get("value", ""),
        "country": item.get("countryLabel", {}).get("value", ""),
        "description": item.get("description", {}).get("value", ""),
        "event_type": "lgbtq_rights",
    }


def process_organization(item: dict) -> dict:
    """Process an organization result into our format."""
    found_date = item.get("foundDate", {}).get("value", "")
    
    return {
        "wikidata_id": item.get("org", {}).get("value", "").split("/")[-1],
        "name": item.get("orgLabel", {}).get("value", ""),
        "founded": found_date[:10] if found_date else None,
        "location": item.get("locationLabel", {}).get("value", ""),
        "country": item.get("countryLabel", {}).get("value", ""),
        "description": item.get("description", {}).get("value", ""),
    }


def process_book(item: dict) -> dict:
    """Process a book result into our format."""
    pub_date = item.get("pubDate", {}).get("value", "")
    
    return {
        "wikidata_id": item.get("book", {}).get("value", "").split("/")[-1],
        "title": item.get("bookLabel", {}).get("value", ""),
        "author": item.get("authorLabel", {}).get("value", ""),
        "publication_year": int(pub_date[:4]) if pub_date and len(pub_date) >= 4 else None,
        "description": item.get("description", {}).get("value", ""),
        "topics": ["lgbtq"],
    }


def scrape_all():
    """Main scraping function."""
    logger.info("Starting LGBTQ+ data scraper")
    
    all_people = []
    all_events = []
    all_organizations = []
    all_books = []
    
    # Scrape LGBTQ+ activists
    logger.info("Scraping LGBTQ+ activists...")
    offset = 0
    while True:
        result = query_wikidata(get_lgbtq_activists_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            person = process_person(item)
            if person["name"] and not person["name"].startswith("Q"):
                all_people.append(person)
        
        logger.info(f"  Fetched {len(bindings)} activists (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape transgender activists
    logger.info("Scraping transgender activists...")
    offset = 0
    while True:
        result = query_wikidata(get_trans_activists_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            person = process_person(item)
            person["person_types"] = ["trans_activist"]
            if person["name"] and not person["name"].startswith("Q"):
                all_people.append(person)
        
        logger.info(f"  Fetched {len(bindings)} trans activists (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape Pride events
    logger.info("Scraping Pride events...")
    offset = 0
    while True:
        result = query_wikidata(get_pride_events_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            event = process_event(item)
            if event["name"] and not event["name"].startswith("Q"):
                all_events.append(event)
        
        logger.info(f"  Fetched {len(bindings)} events (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape organizations
    logger.info("Scraping LGBTQ+ organizations...")
    offset = 0
    while True:
        result = query_wikidata(get_lgbtq_organizations_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            org = process_organization(item)
            if org["name"] and not org["name"].startswith("Q"):
                all_organizations.append(org)
        
        logger.info(f"  Fetched {len(bindings)} organizations (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape marriage equality data
    logger.info("Scraping marriage equality data...")
    result = query_wikidata(get_marriage_equality_query())
    marriage_equality = []
    if result and result.get("results", {}).get("bindings"):
        for item in result["results"]["bindings"]:
            date = item.get("legalDate", {}).get("value", "")
            marriage_equality.append({
                "country": item.get("countryLabel", {}).get("value", ""),
                "legalization_date": date[:10] if date else None,
            })
        logger.info(f"  Found {len(marriage_equality)} countries with marriage equality")
    
    # Scrape books
    logger.info("Scraping LGBTQ+ books...")
    offset = 0
    while True:
        result = query_wikidata(get_lgbtq_books_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            book = process_book(item)
            if book["title"] and not book["title"].startswith("Q"):
                all_books.append(book)
        
        logger.info(f"  Fetched {len(bindings)} books (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Deduplicate by wikidata_id
    def dedupe(items):
        seen = set()
        result = []
        for item in items:
            wid = item.get("wikidata_id", "")
            if wid and wid not in seen:
                seen.add(wid)
                result.append(item)
        return result
    
    all_people = dedupe(all_people)
    all_events = dedupe(all_events)
    all_organizations = dedupe(all_organizations)
    all_books = dedupe(all_books)
    
    # Save results
    logger.info("Saving results...")
    
    with open(OUTPUT_DIR / "people.json", "w") as f:
        json.dump(all_people, f, indent=2, default=str)
    logger.info(f"Saved {len(all_people)} people")
    
    with open(OUTPUT_DIR / "events.json", "w") as f:
        json.dump(all_events, f, indent=2, default=str)
    logger.info(f"Saved {len(all_events)} events")
    
    with open(OUTPUT_DIR / "organizations.json", "w") as f:
        json.dump(all_organizations, f, indent=2, default=str)
    logger.info(f"Saved {len(all_organizations)} organizations")
    
    with open(OUTPUT_DIR / "books.json", "w") as f:
        json.dump(all_books, f, indent=2, default=str)
    logger.info(f"Saved {len(all_books)} books")
    
    with open(OUTPUT_DIR / "marriage_equality.json", "w") as f:
        json.dump(marriage_equality, f, indent=2, default=str)
    logger.info(f"Saved {len(marriage_equality)} marriage equality records")
    
    # Summary
    total = len(all_people) + len(all_events) + len(all_organizations) + len(all_books)
    logger.info(f"Scraping complete! Total records: {total}")
    
    return {
        "people": len(all_people),
        "events": len(all_events),
        "organizations": len(all_organizations),
        "books": len(all_books),
        "marriage_equality": len(marriage_equality),
    }


if __name__ == "__main__":
    scrape_all()
