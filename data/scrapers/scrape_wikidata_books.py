#!/usr/bin/env python3
"""
Scrape political/historical books from Wikidata.

Queries for books with subjects: politics, history, economics, philosophy,
socialism, communism, anarchism, revolution, colonialism, imperialism.

Saves results to /Users/linusgollnow/LeftistMonitor/data/scraped/books/
"""

import json
import os
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import requests

# Configuration
OUTPUT_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scraped/books")
STATE_FILE = OUTPUT_DIR / ".scraper_state.json"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
MAX_FILE_SIZE_MB = 50
RATE_LIMIT_SECONDS = 1.0
BATCH_SIZE = 5000

# Subject topics to query
SUBJECT_TOPICS = [
    ("Q7163", "politics"),
    ("Q309", "history"),
    ("Q8134", "economics"),
    ("Q5891", "philosophy"),
    ("Q7272", "socialism"),
    ("Q6186", "communism"),
    ("Q6199", "anarchism"),
    ("Q10931", "revolution"),
    ("Q7167", "colonialism"),
    ("Q7260", "imperialism"),
    ("Q49773", "social_movements"),
    ("Q4359", "capitalism"),
    ("Q171174", "liberalism"),
    ("Q79701", "fascism"),
    ("Q135", "marxism"),
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


def get_sparql_query(subject_id, offset=0):
    """Generate SPARQL query for books on a specific subject."""
    return f"""
    SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description ?topicLabel WHERE {{
      ?book wdt:P31 wd:Q7725634 .
      ?book wdt:P921 wd:{subject_id} .
      
      OPTIONAL {{ ?book wdt:P50 ?author . }}
      OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
      OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
      OPTIONAL {{ ?book wdt:P921 ?topic . }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?book
    LIMIT {BATCH_SIZE}
    OFFSET {offset}
    """


def get_broader_query(offset=0):
    """Broader query for political/historical books."""
    return f"""
    SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description WHERE {{
      VALUES ?bookType {{ wd:Q7725634 wd:Q571 wd:Q47461344 }}
      ?book wdt:P31 ?bookType .
      
      {{
        ?book wdt:P136 ?genre .
        VALUES ?genre {{ wd:Q213714 wd:Q35760 wd:Q186424 wd:Q8261 wd:Q223683 }}
      }} UNION {{
        ?book wdt:P921 ?subject .
        ?subject wdt:P279* ?parentSubject .
        VALUES ?parentSubject {{ wd:Q7163 wd:Q309 wd:Q8134 wd:Q5891 }}
      }}
      
      OPTIONAL {{ ?book wdt:P50 ?author . }}
      OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
      OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
      
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,de,fr,es" . }}
    }}
    ORDER BY ?book
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


def parse_results(results, subject_name=""):
    """Parse SPARQL results into book records."""
    books = []
    
    for binding in results.get("results", {}).get("bindings", []):
        book_uri = binding.get("book", {}).get("value", "")
        wikidata_id = book_uri.split("/")[-1] if book_uri else ""
        
        pub_date_raw = binding.get("pubDate", {}).get("value", "")
        pub_year = None
        if pub_date_raw:
            try:
                pub_year = int(pub_date_raw[:4])
            except (ValueError, IndexError):
                pass
        
        book = {
            "wikidata_id": wikidata_id,
            "title": binding.get("bookLabel", {}).get("value", ""),
            "author": binding.get("authorLabel", {}).get("value", ""),
            "publication_year": pub_year,
            "description": binding.get("description", {}).get("value", ""),
            "topics": [subject_name] if subject_name else [],
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        if "topicLabel" in binding:
            topic = binding["topicLabel"].get("value", "")
            if topic and topic not in book["topics"]:
                book["topics"].append(topic)
        
        books.append(book)
    
    return books


def deduplicate_books(books):
    """Deduplicate books by wikidata_id, merging topics."""
    seen = {}
    
    for book in books:
        wid = book["wikidata_id"]
        if wid in seen:
            existing_topics = set(seen[wid]["topics"])
            new_topics = set(book["topics"])
            seen[wid]["topics"] = list(existing_topics | new_topics)
        else:
            seen[wid] = book
    
    return list(seen.values())


def load_state():
    """Load scraper state for resumability."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            pass
    return {"completed_subjects": [], "current_offset": 0, "total_books": 0}


def save_state(state):
    """Save scraper state."""
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def save_books(books, file_index, logger):
    """Save books to JSON file."""
    filename = f"books_{file_index:04d}.json"
    filepath = OUTPUT_DIR / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(books, f, indent=2, ensure_ascii=False)
    
    logger.info(f"Saved {len(books)} books to {filename}")
    return filepath


def main():
    """Main scraper function."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logger = setup_logging()
    
    logger.info("Starting Wikidata Books Scraper")
    logger.info(f"Output directory: {OUTPUT_DIR}")
    
    state = load_state()
    all_books = []
    file_index = 1
    
    existing_files = list(OUTPUT_DIR.glob("books_*.json"))
    if existing_files:
        file_index = max(int(f.stem.split("_")[1]) for f in existing_files) + 1
    
    for subject_id, subject_name in SUBJECT_TOPICS:
        if subject_name in state["completed_subjects"]:
            logger.info(f"Skipping already completed subject: {subject_name}")
            continue
        
        logger.info(f"Scraping books on subject: {subject_name} ({subject_id})")
        offset = 0
        subject_books = []
        
        while True:
            query = get_sparql_query(subject_id, offset)
            logger.info(f"  Querying offset {offset}...")
            
            results = execute_sparql(query, logger)
            time.sleep(RATE_LIMIT_SECONDS)
            
            if not results:
                logger.error(f"  Failed to get results for {subject_name} at offset {offset}")
                break
            
            batch = parse_results(results, subject_name)
            
            if not batch:
                logger.info(f"  No more results for {subject_name}")
                break
            
            subject_books.extend(batch)
            logger.info(f"  Got {len(batch)} books (total for subject: {len(subject_books)})")
            
            offset += BATCH_SIZE
            
            if len(batch) < BATCH_SIZE:
                break
        
        all_books.extend(subject_books)
        state["completed_subjects"].append(subject_name)
        state["total_books"] = len(all_books)
        save_state(state)
        
        logger.info(f"Completed {subject_name}: {len(subject_books)} books found")
    
    logger.info("Running broader political/historical books query...")
    offset = 0
    
    while True:
        query = get_broader_query(offset)
        logger.info(f"  Broader query offset {offset}...")
        
        results = execute_sparql(query, logger)
        time.sleep(RATE_LIMIT_SECONDS)
        
        if not results:
            logger.error(f"  Failed broader query at offset {offset}")
            break
        
        batch = parse_results(results)
        
        if not batch:
            break
        
        all_books.extend(batch)
        logger.info(f"  Got {len(batch)} books (total: {len(all_books)})")
        
        offset += BATCH_SIZE
        
        if len(batch) < BATCH_SIZE:
            break
    
    logger.info(f"Deduplicating {len(all_books)} books...")
    all_books = deduplicate_books(all_books)
    logger.info(f"After deduplication: {len(all_books)} unique books")
    
    current_chunk = []
    current_size = 0
    
    for book in all_books:
        book_json = json.dumps(book, ensure_ascii=False)
        book_size = len(book_json.encode("utf-8"))
        
        if current_size + book_size > MAX_FILE_SIZE_MB * 1024 * 1024:
            save_books(current_chunk, file_index, logger)
            file_index += 1
            current_chunk = []
            current_size = 0
        
        current_chunk.append(book)
        current_size += book_size
    
    if current_chunk:
        save_books(current_chunk, file_index, logger)
    
    if STATE_FILE.exists():
        STATE_FILE.unlink()
    
    logger.info(f"Scraping complete! Total unique books: {len(all_books)}")
    
    return len(all_books)


if __name__ == "__main__":
    main()
