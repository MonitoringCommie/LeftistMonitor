#!/usr/bin/env python3
"""Comprehensive Books Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OPEN_LIBRARY_API = "https://openlibrary.org/search.json"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

BOOK_QUERIES = {
    "political_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?publisherLabel ?subjectLabel ?description
WHERE {
  ?book wdt:P31 wd:Q7725634 . ?book wdt:P921 ?subject .
  { ?subject wdt:P279* wd:Q7163 . } UNION { ?subject wdt:P279* wd:Q8434 . }
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . }
  OPTIONAL { ?book wdt:P123 ?publisher . }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "history_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?subjectLabel ?description
WHERE {
  ?book wdt:P31 wd:Q7725634 . ?book wdt:P921 ?subject . ?subject wdt:P279* wd:Q309 .
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "philosophy_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?subjectLabel ?description
WHERE {
  ?book wdt:P31 wd:Q7725634 . ?book wdt:P921 ?subject . ?subject wdt:P279* wd:Q5891 .
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000"""
}

SUBJECTS = ["history", "politics", "socialism", "communism", "revolution", "economics", "war", "colonialism"]

def run_query(query):
    for attempt in range(3):
        try:
            r = requests.get(WIKIDATA_ENDPOINT, params={"query": query, "format": "json"}, headers=HEADERS, timeout=180)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < 2: time.sleep(5 * (attempt + 1))
    return None

def search_open_library(subject, limit=1000):
    books = []
    offset = 0
    while len(books) < limit:
        try:
            params = {"subject": subject, "limit": 100, "offset": offset}
            r = requests.get(OPEN_LIBRARY_API, params=params, headers=HEADERS, timeout=60)
            r.raise_for_status()
            data = r.json()
            docs = data.get("docs", [])
            if not docs: break
            books.extend(docs)
            offset += 100
            if offset >= data.get("numFound", 0): break
            time.sleep(0.5)
        except Exception as e:
            print(f"  Error: {e}")
            break
    return books

def process_wikidata(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        uri = b.get("book", {}).get("value", "")
        if not uri: continue
        title = b.get("bookLabel", {}).get("value", "")
        if title and not title.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "title": title,
                "author": b.get("authorLabel", {}).get("value"),
                "publication_year": b.get("pubDate", {}).get("value"),
                "publisher": b.get("publisherLabel", {}).get("value"),
                "subject": b.get("subjectLabel", {}).get("value") or category,
                "description": b.get("description", {}).get("value"),
                "source": "wikidata", "category": category
            })
    return items

def process_openlibrary(docs, subject):
    items = []
    for d in docs:
        if d.get("title"):
            items.append({
                "open_library_key": d.get("key", ""), "title": d.get("title", ""),
                "author": ", ".join(d.get("author_name", [])) if d.get("author_name") else None,
                "publication_year": str(d.get("first_publish_year")) if d.get("first_publish_year") else None,
                "subjects": d.get("subject", [])[:5],
                "source": "open_library", "category": subject
            })
    return items

def main():
    print("BOOKS SCRAPER - Starting")
    all_books = {}
    stats = {"wikidata": {}, "open_library": {}}
    
    print("Scraping Wikidata...")
    for cat, query in BOOK_QUERIES.items():
        print(f"  {cat}...")
        results = run_query(query)
        if results:
            items = process_wikidata(results, cat)
            stats["wikidata"][cat] = len(items)
            print(f"    Found {len(items)}")
            for b in items:
                key = b.get("wikidata_id") or b["title"]
                if key not in all_books: all_books[key] = b
        time.sleep(3)
    
    print("Scraping Open Library...")
    for subject in SUBJECTS:
        print(f"  {subject}...")
        docs = search_open_library(subject, limit=2000)
        if docs:
            items = process_openlibrary(docs, subject)
            stats["open_library"][subject] = len(docs)
            print(f"    Found {len(docs)}")
            for b in items:
                key = b.get("open_library_key") or b["title"]
                if key not in all_books: all_books[key] = b
        time.sleep(1)
    
    with open(OUTPUT_DIR / "all_books_comprehensive.json", "w") as f:
        json.dump(list(all_books.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_books), "stats": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_books)} books")

if __name__ == "__main__":
    main()
