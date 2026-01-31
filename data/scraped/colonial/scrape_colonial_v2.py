#!/usr/bin/env python3
"""Comprehensive Colonial History Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

COLONIAL_QUERIES = {
    "colonies": """
SELECT DISTINCT ?colony ?colonyLabel ?colonizerLabel ?startDate ?endDate ?capitalLabel ?description
WHERE {
  ?colony wdt:P31/wdt:P279* wd:Q133156 .
  OPTIONAL { ?colony wdt:P194 ?colonizer . }
  OPTIONAL { ?colony wdt:P580 ?startDate . }
  OPTIONAL { ?colony wdt:P582 ?endDate . }
  OPTIONAL { ?colony wdt:P36 ?capital . }
  OPTIONAL { ?colony schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "colonial_empires": """
SELECT DISTINCT ?empire ?empireLabel ?startDate ?endDate ?capitalLabel ?description
WHERE {
  ?empire wdt:P31/wdt:P279* wd:Q48349 .
  OPTIONAL { ?empire wdt:P580 ?startDate . }
  OPTIONAL { ?empire wdt:P582 ?endDate . }
  OPTIONAL { ?empire wdt:P36 ?capital . }
  OPTIONAL { ?empire schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 5000""",
    "decolonization_events": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?colonizerLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q220839 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "colonial_wars": """
SELECT DISTINCT ?war ?warLabel ?startDate ?endDate ?locationLabel ?description
WHERE {
  ?war wdt:P31/wdt:P279* wd:Q645883 .
  ?war wdt:P361 ?conflict .
  ?conflict wdt:P31/wdt:P279* wd:Q7283 .
  OPTIONAL { ?war wdt:P580 ?startDate . }
  OPTIONAL { ?war wdt:P582 ?endDate . }
  OPTIONAL { ?war wdt:P276 ?location . }
  OPTIONAL { ?war schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "slave_trade": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?locationLabel ?description
WHERE {
  { ?event wdt:P31/wdt:P279* wd:Q10737 . }
  UNION
  { ?event wdt:P31/wdt:P279* wd:Q179600 . }
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P276 ?location . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000"""
}

def run_query(query):
    for attempt in range(3):
        try:
            r = requests.get(WIKIDATA_ENDPOINT, params={"query": query, "format": "json"}, headers=HEADERS, timeout=180)
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"  Attempt {attempt+1} failed: {e}", flush=True)
            if attempt < 2: time.sleep(5 * (attempt + 1))
    return None

def process(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        for key in ["colony", "empire", "event", "war"]:
            uri = b.get(key, {}).get("value", "")
            if uri: break
        if not uri: continue
        for key in ["colonyLabel", "empireLabel", "eventLabel", "warLabel"]:
            name = b.get(key, {}).get("value", "")
            if name: break
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "date": b.get("date", {}).get("value"),
                "start_date": b.get("startDate", {}).get("value"),
                "end_date": b.get("endDate", {}).get("value"),
                "location": b.get("locationLabel", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "colonizer": b.get("colonizerLabel", {}).get("value"),
                "capital": b.get("capitalLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("COLONIAL HISTORY SCRAPER - Starting", flush=True)
    all_data = {}
    stats = {}
    
    for cat, query in COLONIAL_QUERIES.items():
        print(f"Scraping {cat}...", flush=True)
        results = run_query(query)
        if results:
            items = process(results, cat)
            stats[cat] = len(items)
            print(f"  Found {len(items)}", flush=True)
            for item in items:
                if item["wikidata_id"] not in all_data:
                    all_data[item["wikidata_id"]] = item
        time.sleep(3)
    
    with open(OUTPUT_DIR / "all_colonial.json", "w") as f:
        json.dump(list(all_data.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_data), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_data)} colonial records", flush=True)

if __name__ == "__main__":
    main()
