#!/usr/bin/env python3
"""
Comprehensive Books Scraper
Target: 500,000+ books from Wikidata and Open Library
"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OPEN_LIBRARY_API = "https://openlibrary.org/search.json"
OUTPUT_DIR = Path(__file__).parent
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "LeftistMonitor/1.0 (historical research)"
}

# Book subject categories to search
BOOK_SUBJECTS = [
    "history", "politics", "political science", "economics", "socialism",
    "communism", "marxism", "anarchism", "revolution", "labor movement",
    "civil rights", "feminism", "colonialism", "imperialism", "war",
    "social movements", "philosophy", "sociology", "democracy",
    "capitalism", "class struggle", "working class", "poverty",
    "human rights", "international relations", "government",
    "biography", "autobiography", "political theory", "social theory",
    "anti-colonialism", "decolonization", "nationalism", "liberation",
    "palestine", "ireland", "cuba", "vietnam", "apartheid",
    "fascism", "anti-fascism", "resistance", "world war",
    "cold war", "nuclear", "environment", "climate", "ecology"
]

WIKIDATA_BOOK_QUERIES = {
    "political_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?publisherLabel 
       ?countryLabel ?languageLabel ?subjectLabel ?description
WHERE {{
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P921 ?subject .
  {{ ?subject wdt:P279* wd:Q7163 . }}  # politics
  UNION
  {{ ?subject wdt:P279* wd:Q8434 . }}  # economics
  UNION  
  {{ ?subject wdt:P279* wd:Q309 . }}  # history
  
  OPTIONAL {{ ?book wdt:P50 ?author . }}
  OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
  OPTIONAL {{ ?book wdt:P123 ?publisher . }}
  OPTIONAL {{ ?book wdt:P495 ?country . }}
  OPTIONAL {{ ?book wdt:P407 ?language . }}
  OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",

    "history_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?subjectLabel ?description
WHERE {{
  ?book wdt:P31 wd:Q7725634 .
  ?book wdt:P921 ?subject .
  ?subject wdt:P279* wd:Q309 .  # history
  
  OPTIONAL {{ ?book wdt:P50 ?author . }}
  OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
  OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",

    "economics_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?subjectLabel ?description
WHERE {{
  ?book wdt:P31 wd:Q7725634 .
  ?book wdt:P921 ?subject .
  ?subject wdt:P279* wd:Q8434 .  # economics
  
  OPTIONAL {{ ?book wdt:P50 ?author . }}
  OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
  OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "philosophy_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?subjectLabel ?description
WHERE {{
  ?book wdt:P31 wd:Q7725634 .
  ?book wdt:P921 ?subject .
  ?subject wdt:P279* wd:Q5891 .  # philosophy
  
  OPTIONAL {{ ?book wdt:P50 ?author . }}
  OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
  OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "sociology_books": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?subjectLabel ?description
WHERE {{
  ?book wdt:P31 wd:Q7725634 .
  ?book wdt:P921 ?subject .
  ?subject wdt:P279* wd:Q21201 .  # sociology
  
  OPTIONAL {{ ?book wdt:P50 ?author . }}
  OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
  OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "biography_political": """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?aboutLabel ?description
WHERE {{
  ?book wdt:P31 wd:Q36279 .  # biography
  ?book wdt:P921 ?about .
  ?about wdt:P106 ?occupation .
  {{ ?occupation wdt:P279* wd:Q82955 . }}  # politician
  UNION
  {{ ?about wdt:P106 wd:Q3242115 . }}  # revolutionary
  
  OPTIONAL {{ ?book wdt:P50 ?author . }}
  OPTIONAL {{ ?book wdt:P577 ?pubDate . }}
  OPTIONAL {{ ?book schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
"""
}


def run_sparql_query(query, category):
    for attempt in range(3):
        try:
            response = requests.get(
                WIKIDATA_ENDPOINT,
                params={"query": query, "format": "json"},
                headers=HEADERS,
                timeout=180
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return None


def search_open_library(subject, limit=1000):
    """Search Open Library for books on a subject."""
    all_books = []
    offset = 0
    
    while len(all_books) < limit:
        try:
            params = {
                "subject": subject,
                "limit": 100,
                "offset": offset,
                "fields": "key,title,author_name,first_publish_year,publisher,subject,language,isbn"
            }
            
            response = requests.get(OPEN_LIBRARY_API, params=params, headers=HEADERS, timeout=60)
            response.raise_for_status()
            data = response.json()
            
            docs = data.get("docs", [])
            if not docs:
                break
            
            all_books.extend(docs)
            offset += 100
            
            if offset >= data.get("numFound", 0):
                break
            
            time.sleep(0.5)  # Rate limiting
            
        except Exception as e:
            print(f"  Open Library error for {subject}: {e}")
            break
    
    return all_books


def extract_value(binding, key):
    if key in binding and "value" in binding[key]:
        return binding[key]["value"]
    return None


def process_wikidata_books(results, category):
    if not results or "results" not in results:
        return []
    
    books = []
    for binding in results["results"]["bindings"]:
        uri = extract_value(binding, "book")
        if not uri:
            continue
        
        wikidata_id = uri.split("/")[-1]
        
        book = {
            "wikidata_id": wikidata_id,
            "title": extract_value(binding, "bookLabel") or "",
            "author": extract_value(binding, "authorLabel"),
            "publication_year": extract_value(binding, "pubDate"),
            "publisher": extract_value(binding, "publisherLabel"),
            "country": extract_value(binding, "countryLabel"),
            "language": extract_value(binding, "languageLabel"),
            "subject": extract_value(binding, "subjectLabel") or category,
            "description": extract_value(binding, "description"),
            "source": "wikidata",
            "category": category,
        }
        
        if book["title"] and not book["title"].startswith("Q"):
            books.append(book)
    
    return books


def process_open_library_books(docs, subject):
    books = []
    for doc in docs:
        book = {
            "open_library_key": doc.get("key", ""),
            "title": doc.get("title", ""),
            "author": ", ".join(doc.get("author_name", [])) if doc.get("author_name") else None,
            "publication_year": str(doc.get("first_publish_year")) if doc.get("first_publish_year") else None,
            "publisher": doc.get("publisher", [None])[0] if doc.get("publisher") else None,
            "subjects": doc.get("subject", [])[:10],  # Limit subjects
            "language": doc.get("language", [None])[0] if doc.get("language") else None,
            "isbn": doc.get("isbn", [None])[0] if doc.get("isbn") else None,
            "source": "open_library",
            "category": subject,
        }
        
        if book["title"]:
            books.append(book)
    
    return books


def main():
    print("="*60)
    print("COMPREHENSIVE BOOKS SCRAPER")
    print("Target: 500,000+ books")
    print("="*60)
    
    all_books = {}
    stats = {"wikidata": {}, "open_library": {}}
    
    # 1. Scrape Wikidata
    print("
Scraping Wikidata books...")
    for category, query in WIKIDATA_BOOK_QUERIES.items():
        print(f"  {category}...", end=" ", flush=True)
        results = run_sparql_query(query, category)
        
        if results:
            books = process_wikidata_books(results, category)
            for b in books:
                key = b.get("wikidata_id") or b["title"]
                if key not in all_books:
                    all_books[key] = b
            
            stats["wikidata"][category] = len(books)
            print(f"{len(books)} found")
        else:
            print("failed")
        
        time.sleep(3)
    
    # 2. Scrape Open Library
    print("
Scraping Open Library books...")
    for subject in BOOK_SUBJECTS[:20]:  # Limit to avoid too long runtime
        print(f"  {subject}...", end=" ", flush=True)
        docs = search_open_library(subject, limit=2000)
        
        if docs:
            books = process_open_library_books(docs, subject)
            for b in books:
                key = b.get("open_library_key") or b["title"]
                if key not in all_books:
                    all_books[key] = b
            
            stats["open_library"][subject] = len(docs)
            print(f"{len(docs)} found")
        else:
            print("none")
        
        time.sleep(1)
    
    # Save results
    output_file = OUTPUT_DIR / "all_books_comprehensive.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(list(all_books.values()), f, ensure_ascii=False, indent=2)
    
    stats_file = OUTPUT_DIR / "scrape_stats.json"
    with open(stats_file, "w") as f:
        json.dump({
            "total_books": len(all_books),
            "sources": stats,
            "scraped_at": datetime.now().isoformat()
        }, f, indent=2)
    
    print("
" + "="*60)
    print(f"COMPLETE: {len(all_books)} unique books scraped")
    print(f"Output: {output_file}")
    print("="*60)


if __name__ == "__main__":
    main()
