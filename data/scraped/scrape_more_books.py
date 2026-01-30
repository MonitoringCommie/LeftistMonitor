#!/usr/bin/env python3
"""
Scrape many more books from Wikidata - economics, political theory, history, philosophy.
"""

import requests
import json
import time
from pathlib import Path

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"

def query_wikidata(sparql_query, description):
    """Execute SPARQL query against Wikidata."""
    print(f"Querying: {description}...")
    
    headers = {
        "User-Agent": "LeftistMonitor/1.0 (Educational Project)",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(
            WIKIDATA_ENDPOINT,
            params={"query": sparql_query, "format": "json"},
            headers=headers,
            timeout=180
        )
        response.raise_for_status()
        data = response.json()
        results = data.get("results", {}).get("bindings", [])
        print(f"  Found {len(results)} results")
        return results
    except Exception as e:
        print(f"  Error: {e}")
        return []

# Economics books
ECONOMICS_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P921 ?subject .  # main subject
  ?subject wdt:P279* wd:Q8134 .  # economics or subclass
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
"""

# Political science books
POLITICAL_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P921 ?subject .  # main subject
  ?subject wdt:P279* wd:Q7163 .  # politics or subclass
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# Philosophy books
PHILOSOPHY_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P921 ?subject .  # main subject
  ?subject wdt:P279* wd:Q5891 .  # philosophy or subclass
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# History books
HISTORY_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P921 ?subject .  # main subject
  ?subject wdt:P279* wd:Q309 .  # history or subclass
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# Sociology books
SOCIOLOGY_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P921 ?subject .  # main subject
  ?subject wdt:P279* wd:Q21201 .  # sociology or subclass
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 8000
"""

# Labor/working class books
LABOR_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  { ?book wdt:P921 wd:Q178706 . }  # labor movement
  UNION { ?book wdt:P921 wd:Q327333 . }  # trade union
  UNION { ?book wdt:P921 wd:Q7278 . }  # working class
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
"""

# Revolution/revolutionary books
REVOLUTION_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  { ?book wdt:P921 wd:Q10931 . }  # revolution
  UNION { ?book wdt:P921 wd:Q28108 . }  # social movement  
  UNION { ?book wdt:P921 wd:Q189445 . }  # Marxism
  UNION { ?book wdt:P921 wd:Q6186 . }  # socialism
  OPTIONAL { ?book wdt:P50 ?author . }
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 8000
"""

# Non-fiction books by economists
ECONOMIST_WRITTEN_BOOKS_QUERY = """
SELECT DISTINCT ?book ?bookLabel ?authorLabel ?pubYear ?description WHERE {
  ?book wdt:P31 wd:Q7725634 .  # literary work
  ?book wdt:P50 ?author .
  ?author wdt:P106 wd:Q188094 .  # author is economist
  OPTIONAL { ?book wdt:P577 ?pubDate . BIND(YEAR(?pubDate) AS ?pubYear) }
  OPTIONAL { ?book schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

def process_book(result, book_type):
    """Process a book result into a dictionary."""
    wikidata_id = result.get("book", {}).get("value", "").split("/")[-1]
    title = result.get("bookLabel", {}).get("value", "")
    
    if not title or title == wikidata_id:
        return None
    
    author = result.get("authorLabel", {}).get("value", "")
    pub_year = result.get("pubYear", {}).get("value", "")
    description = result.get("description", {}).get("value", "")
    
    try:
        pub_year = int(pub_year) if pub_year else None
    except:
        pub_year = None
    
    return {
        "wikidata_id": wikidata_id,
        "title": title,
        "author": author if author and author != wikidata_id else None,
        "publication_year": pub_year,
        "description": description,
        "book_type": book_type,
        "topics": [book_type]
    }

def main():
    all_books = {}
    
    queries = [
        (ECONOMICS_BOOKS_QUERY, "economics", "Economics books"),
        (POLITICAL_BOOKS_QUERY, "political_theory", "Political science books"),
        (PHILOSOPHY_BOOKS_QUERY, "philosophy", "Philosophy books"),
        (HISTORY_BOOKS_QUERY, "history", "History books"),
        (SOCIOLOGY_BOOKS_QUERY, "sociology", "Sociology books"),
        (LABOR_BOOKS_QUERY, "labor", "Labor/working class books"),
        (REVOLUTION_BOOKS_QUERY, "revolution", "Revolution/social movement books"),
        (ECONOMIST_WRITTEN_BOOKS_QUERY, "economics", "Books by economists"),
    ]
    
    for query, book_type, description in queries:
        results = query_wikidata(query, description)
        time.sleep(3)
        
        for result in results:
            book = process_book(result, book_type)
            if book:
                wid = book["wikidata_id"]
                if wid in all_books:
                    # Merge topics
                    if book_type not in all_books[wid]["topics"]:
                        all_books[wid]["topics"].append(book_type)
                else:
                    all_books[wid] = book
    
    # Save results
    books_list = list(all_books.values())
    
    output_file = Path("more_books.json")
    with open(output_file, "w") as f:
        json.dump(books_list, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Total unique books: {len(books_list)}")
    print(f"Saved to {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
