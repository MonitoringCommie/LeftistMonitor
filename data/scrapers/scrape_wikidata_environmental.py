#!/usr/bin/env python3
"""
Scrape environmental movement data from Wikidata.

Queries for: environmental activists, climate events, environmental organizations,
environmental disasters, and climate-related legislation.
"""

import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/movements/environmental")
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


def get_environmental_activists_query(offset: int = 0) -> str:
    """Query for environmental activists."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate
           ?countryLabel ?description WHERE {{
      {{
        ?person wdt:P106 wd:Q18336849 .  # environmentalist
      }} UNION {{
        ?person wdt:P106 wd:Q15253558 .  # activist
        ?person wdt:P101 wd:Q2934 .      # field of work: environmentalism
      }} UNION {{
        ?person wdt:P106 wd:Q15253558 .  # activist
        ?person wdt:P135 wd:Q2934 .      # movement: environmentalism
      }} UNION {{
        ?person wdt:P106 wd:Q66711686 .  # climate activist
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


def get_indigenous_land_defenders_query(offset: int = 0) -> str:
    """Query for indigenous environmental defenders."""
    return f"""
    SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate
           ?countryLabel ?description WHERE {{
      ?person wdt:P31 wd:Q5 .  # is human
      ?person wdt:P172 ?ethnicity .  # has ethnic group
      ?ethnicity wdt:P31/wdt:P279* wd:Q133311 .  # indigenous peoples
      
      {{
        ?person wdt:P106 wd:Q15253558 .  # activist
      }} UNION {{
        ?person wdt:P106 wd:Q18336849 .  # environmentalist
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


def get_climate_events_query(offset: int = 0) -> str:
    """Query for climate protests and environmental events."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel
           ?countryLabel ?description WHERE {{
      {{
        ?event wdt:P31/wdt:P279* wd:Q188055 .  # protest
        ?event wdt:P921 wd:Q7942 .  # main subject: climate change
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q188055 .  # protest
        ?event wdt:P921 wd:Q2934 .  # main subject: environmentalism
      }} UNION {{
        ?event wdt:P361 wd:Q56407116 .  # part of: climate strike
      }} UNION {{
        ?event wdt:P361 wd:Q66658878 .  # part of: Fridays for Future
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


def get_environmental_disasters_query(offset: int = 0) -> str:
    """Query for major environmental disasters."""
    return f"""
    SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel
           ?countryLabel ?description ?casualties WHERE {{
      {{
        ?event wdt:P31/wdt:P279* wd:Q3839081 .  # environmental disaster
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q7857 .  # nuclear accident
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q168983 .  # oil spill
      }} UNION {{
        ?event wdt:P31/wdt:P279* wd:Q16510064 .  # industrial disaster
      }}

      OPTIONAL {{ ?event wdt:P585 ?date . }}
      OPTIONAL {{ ?event wdt:P580 ?date . }}
      OPTIONAL {{ ?event wdt:P276 ?location . }}
      OPTIONAL {{ ?event wdt:P17 ?country . }}
      OPTIONAL {{ ?event wdt:P1120 ?casualties . }}
      OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}

      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY DESC(?date)
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_environmental_organizations_query(offset: int = 0) -> str:
    """Query for environmental organizations."""
    return f"""
    SELECT DISTINCT ?org ?orgLabel ?foundDate ?locationLabel
           ?countryLabel ?description WHERE {{
      {{
        ?org wdt:P31/wdt:P279* wd:Q43229 .  # organization
        ?org wdt:P101 wd:Q2934 .  # field of work: environmentalism
      }} UNION {{
        ?org wdt:P31/wdt:P279* wd:Q43229 .  # organization
        ?org wdt:P101 wd:Q7942 .  # field of work: climate change
      }} UNION {{
        ?org wdt:P31 wd:Q4120211 .  # environmental organization
      }}

      OPTIONAL {{ ?org wdt:P571 ?foundDate . }}
      OPTIONAL {{ ?org wdt:P159 ?location . }}
      OPTIONAL {{ ?org wdt:P17 ?country . }}
      OPTIONAL {{ ?org schema:description ?description . FILTER(LANG(?description) = "en") }}

      SERVICE wikibase:label {{ bd:serviceParam wbibase:language "en" . }}
    }}
    ORDER BY ?org
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_climate_agreements_query() -> str:
    """Query for international climate agreements."""
    return """
    SELECT DISTINCT ?agreement ?agreementLabel ?date ?description WHERE {
      {
        ?agreement wdt:P31/wdt:P279* wd:Q131569 .  # treaty
        ?agreement wdt:P921 wd:Q7942 .  # main subject: climate change
      } UNION {
        ?agreement wdt:P31/wdt:P279* wd:Q131569 .  # treaty
        ?agreement wdt:P921 wd:Q2934 .  # main subject: environmentalism
      } UNION {
        VALUES ?agreement { wd:Q21068 wd:Q219817 wd:Q1002529 wd:Q475750 }  # Known climate treaties
      }

      OPTIONAL { ?agreement wdt:P585 ?date . }
      OPTIONAL { ?agreement wdt:P571 ?date . }
      OPTIONAL { ?agreement schema:description ?description . FILTER(LANG(?description) = "en") }

      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
    }
    ORDER BY ?date
    """


def get_environmental_books_query(offset: int = 0) -> str:
    """Query for environmental and climate books."""
    return f"""
    SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description WHERE {{
      {{
        ?book wdt:P31/wdt:P279* wd:Q571 .  # book
        ?book wdt:P921 wd:Q7942 .          # main subject: climate change
      }} UNION {{
        ?book wdt:P31/wdt:P279* wd:Q571 .  # book
        ?book wdt:P921 wd:Q2934 .          # main subject: environmentalism
      }} UNION {{
        ?book wdt:P31/wdt:P279* wd:Q571 .  # book
        ?book wdt:P921 wd:Q159719 .        # main subject: ecology
      }}

      OPTIONAL {{ ?book wdt:P50 ?author . }}
      OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
      OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}

      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
    }}
    ORDER BY DESC(?pubDate)
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def process_person(item: dict, person_type: str = "environmental_activist") -> dict:
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
        "person_types": [person_type],
    }


def process_event(item: dict, event_type: str = "environmental") -> dict:
    """Process an event result into our format."""
    date = item.get("date", {}).get("value", "")
    
    return {
        "wikidata_id": item.get("event", {}).get("value", "").split("/")[-1],
        "name": item.get("eventLabel", {}).get("value", ""),
        "date": date[:10] if date else None,
        "location": item.get("locationLabel", {}).get("value", ""),
        "country": item.get("countryLabel", {}).get("value", ""),
        "description": item.get("description", {}).get("value", ""),
        "casualties": item.get("casualties", {}).get("value", None),
        "event_type": event_type,
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
        "topics": ["environmental", "climate"],
    }


def scrape_all():
    """Main scraping function."""
    logger.info("Starting Environmental movement data scraper")
    
    all_people = []
    all_events = []
    all_disasters = []
    all_organizations = []
    all_books = []
    
    # Scrape environmental activists
    logger.info("Scraping environmental activists...")
    offset = 0
    while True:
        result = query_wikidata(get_environmental_activists_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            person = process_person(item, "environmental_activist")
            if person["name"] and not person["name"].startswith("Q"):
                all_people.append(person)
        
        logger.info(f"  Fetched {len(bindings)} activists (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape indigenous land defenders
    logger.info("Scraping indigenous land defenders...")
    offset = 0
    while True:
        result = query_wikidata(get_indigenous_land_defenders_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            person = process_person(item, "indigenous_land_defender")
            if person["name"] and not person["name"].startswith("Q"):
                all_people.append(person)
        
        logger.info(f"  Fetched {len(bindings)} land defenders (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape climate events
    logger.info("Scraping climate events and protests...")
    offset = 0
    while True:
        result = query_wikidata(get_climate_events_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            event = process_event(item, "climate_protest")
            if event["name"] and not event["name"].startswith("Q"):
                all_events.append(event)
        
        logger.info(f"  Fetched {len(bindings)} events (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape environmental disasters
    logger.info("Scraping environmental disasters...")
    offset = 0
    while True:
        result = query_wikidata(get_environmental_disasters_query(offset))
        if not result or not result.get("results", {}).get("bindings"):
            break
        
        bindings = result["results"]["bindings"]
        for item in bindings:
            disaster = process_event(item, "environmental_disaster")
            if disaster["name"] and not disaster["name"].startswith("Q"):
                all_disasters.append(disaster)
        
        logger.info(f"  Fetched {len(bindings)} disasters (offset {offset})")
        if len(bindings) < BATCH_SIZE:
            break
        offset += BATCH_SIZE
    
    # Scrape organizations
    logger.info("Scraping environmental organizations...")
    offset = 0
    while True:
        result = query_wikidata(get_environmental_organizations_query(offset))
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
    
    # Scrape climate agreements
    logger.info("Scraping climate agreements...")
    result = query_wikidata(get_climate_agreements_query())
    climate_agreements = []
    if result and result.get("results", {}).get("bindings"):
        for item in result["results"]["bindings"]:
            date = item.get("date", {}).get("value", "")
            climate_agreements.append({
                "wikidata_id": item.get("agreement", {}).get("value", "").split("/")[-1],
                "name": item.get("agreementLabel", {}).get("value", ""),
                "date": date[:10] if date else None,
                "description": item.get("description", {}).get("value", ""),
            })
        logger.info(f"  Found {len(climate_agreements)} climate agreements")
    
    # Scrape books
    logger.info("Scraping environmental books...")
    offset = 0
    while True:
        result = query_wikidata(get_environmental_books_query(offset))
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
    
    # Deduplicate
    def dedupe(items, key="wikidata_id"):
        seen = set()
        result = []
        for item in items:
            wid = item.get(key, "")
            if wid and wid not in seen:
                seen.add(wid)
                result.append(item)
        return result
    
    all_people = dedupe(all_people)
    all_events = dedupe(all_events)
    all_disasters = dedupe(all_disasters)
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
    
    with open(OUTPUT_DIR / "disasters.json", "w") as f:
        json.dump(all_disasters, f, indent=2, default=str)
    logger.info(f"Saved {len(all_disasters)} disasters")
    
    with open(OUTPUT_DIR / "organizations.json", "w") as f:
        json.dump(all_organizations, f, indent=2, default=str)
    logger.info(f"Saved {len(all_organizations)} organizations")
    
    with open(OUTPUT_DIR / "climate_agreements.json", "w") as f:
        json.dump(climate_agreements, f, indent=2, default=str)
    logger.info(f"Saved {len(climate_agreements)} climate agreements")
    
    with open(OUTPUT_DIR / "books.json", "w") as f:
        json.dump(all_books, f, indent=2, default=str)
    logger.info(f"Saved {len(all_books)} books")
    
    # Summary
    total = len(all_people) + len(all_events) + len(all_disasters) + len(all_organizations) + len(all_books)
    logger.info(f"Scraping complete! Total records: {total}")
    
    return {
        "people": len(all_people),
        "events": len(all_events),
        "disasters": len(all_disasters),
        "organizations": len(all_organizations),
        "climate_agreements": len(climate_agreements),
        "books": len(all_books),
    }


if __name__ == "__main__":
    scrape_all()
