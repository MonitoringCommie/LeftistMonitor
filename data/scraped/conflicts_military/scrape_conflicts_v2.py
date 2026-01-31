#!/usr/bin/env python3
"""Comprehensive Conflicts & Military Data Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

CONFLICT_QUERIES = {
    "wars": """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?locationLabel ?casualtiesLabel ?description
WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q198 .
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "civil_wars": """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?countryLabel ?description
WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q8465 .
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P17 ?country . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "armed_conflicts": """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?locationLabel ?description
WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q180684 .
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "rebellions": """
SELECT DISTINCT ?conflict ?conflictLabel ?date ?startDate ?endDate ?countryLabel ?description
WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q124734 .
  OPTIONAL { ?conflict wdt:P585 ?date . }
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P17 ?country . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "genocides": """
SELECT DISTINCT ?conflict ?conflictLabel ?date ?startDate ?endDate ?locationLabel ?casualtiesLabel ?description
WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q41397 .
  OPTIONAL { ?conflict wdt:P585 ?date . }
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 5000""",
    "military_operations": """
SELECT DISTINCT ?conflict ?conflictLabel ?date ?startDate ?endDate ?locationLabel ?description
WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q645883 .
  OPTIONAL { ?conflict wdt:P585 ?date . }
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000"""
}

MILITARY_QUERIES = {
    "military_bases": """
SELECT DISTINCT ?base ?baseLabel ?countryLabel ?locationLabel ?operatorLabel ?coordinates ?description
WHERE {
  ?base wdt:P31/wdt:P279* wd:Q18691599 .
  OPTIONAL { ?base wdt:P17 ?country . }
  OPTIONAL { ?base wdt:P276 ?location . }
  OPTIONAL { ?base wdt:P137 ?operator . }
  OPTIONAL { ?base wdt:P625 ?coordinates . }
  OPTIONAL { ?base schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "military_alliances": """
SELECT DISTINCT ?alliance ?allianceLabel ?foundedDate ?dissolvedDate ?memberLabel ?description
WHERE {
  ?alliance wdt:P31 wd:Q1127126 .
  OPTIONAL { ?alliance wdt:P571 ?foundedDate . }
  OPTIONAL { ?alliance wdt:P576 ?dissolvedDate . }
  OPTIONAL { ?alliance wdt:P527 ?member . }
  OPTIONAL { ?alliance schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 5000""",
    "coups": """
SELECT DISTINCT ?coup ?coupLabel ?date ?countryLabel ?leaderLabel ?outcomeLabel ?description
WHERE {
  ?coup wdt:P31/wdt:P279* wd:Q45382 .
  OPTIONAL { ?coup wdt:P585 ?date . }
  OPTIONAL { ?coup wdt:P17 ?country . }
  OPTIONAL { ?coup wdt:P710 ?leader . }
  OPTIONAL { ?coup schema:description ?description . FILTER(LANG(?description) = "en") }
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
            print(f"  Attempt {attempt+1} failed: {e}")
            if attempt < 2: time.sleep(5 * (attempt + 1))
    return None

def process(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        uri = b.get("conflict", {}).get("value") or b.get("base", {}).get("value") or b.get("alliance", {}).get("value") or b.get("coup", {}).get("value", "")
        if not uri: continue
        name = b.get("conflictLabel", {}).get("value") or b.get("baseLabel", {}).get("value") or b.get("allianceLabel", {}).get("value") or b.get("coupLabel", {}).get("value", "")
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "date": b.get("date", {}).get("value"),
                "start_date": b.get("startDate", {}).get("value"),
                "end_date": b.get("endDate", {}).get("value"),
                "location": b.get("locationLabel", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "casualties": b.get("casualtiesLabel", {}).get("value"),
                "coordinates": b.get("coordinates", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("CONFLICTS & MILITARY SCRAPER - Starting")
    all_conflicts, all_military = {}, {}
    stats = {"conflicts": {}, "military": {}}
    
    print("Scraping conflicts...")
    for cat, query in CONFLICT_QUERIES.items():
        print(f"  {cat}...")
        results = run_query(query)
        if results:
            items = process(results, cat)
            stats["conflicts"][cat] = len(items)
            print(f"    Found {len(items)}")
            for c in items:
                if c["wikidata_id"] not in all_conflicts:
                    all_conflicts[c["wikidata_id"]] = c
        time.sleep(3)
    
    print("Scraping military data...")
    for cat, query in MILITARY_QUERIES.items():
        print(f"  {cat}...")
        results = run_query(query)
        if results:
            items = process(results, cat)
            stats["military"][cat] = len(items)
            print(f"    Found {len(items)}")
            for m in items:
                if m["wikidata_id"] not in all_military:
                    all_military[m["wikidata_id"]] = m
        time.sleep(3)
    
    with open(OUTPUT_DIR / "all_conflicts.json", "w") as f:
        json.dump(list(all_conflicts.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "all_military.json", "w") as f:
        json.dump(list(all_military.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"conflicts": len(all_conflicts), "military": len(all_military), "stats": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_conflicts)} conflicts, {len(all_military)} military records")

if __name__ == "__main__":
    main()
