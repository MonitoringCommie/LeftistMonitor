#!/usr/bin/env python3
"""Comprehensive Events Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

EVENT_QUERIES = {
    "revolutions": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q10931 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "wars": """
SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?locationLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q198 .
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "battles": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q178561 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "coups": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q45382 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "protests": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q273120 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "strikes": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q49776 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "massacres": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q3199915 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "treaties": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q131569 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "independence": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description
WHERE {
  ?event wdt:P31 wd:Q1464916 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 5000"""
}

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

def process(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        uri = b.get("event", {}).get("value", "")
        if not uri: continue
        name = b.get("eventLabel", {}).get("value", "")
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "date": b.get("date", {}).get("value"),
                "start_date": b.get("startDate", {}).get("value"),
                "end_date": b.get("endDate", {}).get("value"),
                "location": b.get("locationLabel", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "event_type": category
            })
    return items

def main():
    print("EVENTS SCRAPER - Starting")
    all_events = {}
    stats = {}
    
    for cat, query in EVENT_QUERIES.items():
        print(f"Scraping {cat}...")
        results = run_query(query)
        if results:
            items = process(results, cat)
            stats[cat] = len(items)
            print(f"  Found {len(items)}")
            for e in items:
                if e["wikidata_id"] not in all_events:
                    all_events[e["wikidata_id"]] = e
        time.sleep(3)
    
    with open(OUTPUT_DIR / "all_events_comprehensive.json", "w") as f:
        json.dump(list(all_events.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_events), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_events)} events")

if __name__ == "__main__":
    main()
