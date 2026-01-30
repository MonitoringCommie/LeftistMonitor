#!/usr/bin/env python3
"""Scrape political theory books from Wikidata."""
import json
import time
import requests
from pathlib import Path

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent / "books"
OUTPUT_DIR.mkdir(exist_ok=True)

BOOK_QUERIES = {
    "political_theory_books": """
        SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description
        WHERE {
          ?book wdt:P31 wd:Q571 .  # instance of: book
          ?book wdt:P921 ?subject .  # main subject
          VALUES ?subject { wd:Q7163 wd:Q6186 wd:Q7272 wd:Q6199 wd:Q7169 }  # political philosophy, communism, socialism, anarchism, capitalism
          OPTIONAL { ?book wdt:P50 ?author . }
          OPTIONAL { ?book wdt:P577 ?pubDate . }
          OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 10000
    """,
    "manifestos": """
        SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description
        WHERE {
          ?book wdt:P31 wd:Q162685 .  # instance of: manifesto
          OPTIONAL { ?book wdt:P50 ?author . }
          OPTIONAL { ?book wdt:P577 ?pubDate . }
          OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 2000
    """,
    "political_pamphlets": """
        SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description
        WHERE {
          ?book wdt:P31 wd:Q190399 .  # instance of: pamphlet
          ?book wdt:P921 ?subject .
          ?subject wdt:P31*/wdt:P279* wd:Q7163 .  # subject related to politics
          OPTIONAL { ?book wdt:P50 ?author . }
          OPTIONAL { ?book wdt:P577 ?pubDate . }
          OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "economics_books": """
        SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description
        WHERE {
          ?book wdt:P31 wd:Q571 .
          ?book wdt:P921 wd:Q8134 .  # main subject: economics
          OPTIONAL { ?book wdt:P50 ?author . }
          OPTIONAL { ?book wdt:P577 ?pubDate . }
          OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "history_books": """
        SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubDate ?description
        WHERE {
          ?book wdt:P31 wd:Q571 .
          ?book wdt:P921 ?subject .
          VALUES ?subject { wd:Q10931 wd:Q8465 wd:Q198 wd:Q49776 }  # revolution, civil war, war, strike
          OPTIONAL { ?book wdt:P50 ?author . }
          OPTIONAL { ?book wdt:P577 ?pubDate . }
          OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
}

def run_sparql_query(query, category):
    headers = {
        "Accept": "application/json",
        "User-Agent": "LeftistMonitor/1.0 (historical research project)"
    }
    
    try:
        response = requests.get(
            WIKIDATA_ENDPOINT,
            params={"query": query, "format": "json"},
            headers=headers,
            timeout=120
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error querying {category}: {e}")
        return None

def main():
    all_books = {}
    
    for category, query in BOOK_QUERIES.items():
        print(f"Scraping {category}...")
        result = run_sparql_query(query, category)
        
        if result and "results" in result:
            bindings = result["results"]["bindings"]
            print(f"  Found {len(bindings)} {category}")
            
            output_file = OUTPUT_DIR / f"{category}_raw.json"
            with open(output_file, "w") as f:
                json.dump(bindings, f, indent=2)
            
            for binding in bindings:
                book_uri = binding.get("book", {}).get("value", "")
                if not book_uri:
                    continue
                    
                wikidata_id = book_uri.split("/")[-1]
                
                if wikidata_id not in all_books:
                    all_books[wikidata_id] = {
                        "wikidata_id": wikidata_id,
                        "title": binding.get("bookLabel", {}).get("value", ""),
                        "author": binding.get("authorLabel", {}).get("value", ""),
                        "publication_date": binding.get("pubDate", {}).get("value", ""),
                        "description": binding.get("description", {}).get("value", ""),
                        "categories": [category],
                    }
                else:
                    if category not in all_books[wikidata_id]["categories"]:
                        all_books[wikidata_id]["categories"].append(category)
        
        time.sleep(2)
    
    output_file = OUTPUT_DIR / "all_books.json"
    with open(output_file, "w") as f:
        json.dump(list(all_books.values()), f, indent=2)
    
    print(f"\nTotal unique books: {len(all_books)}")
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    main()
