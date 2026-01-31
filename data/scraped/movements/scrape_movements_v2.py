#!/usr/bin/env python3
"""Comprehensive Social Movements Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

MOVEMENT_QUERIES = {
    "social_movements": """
SELECT DISTINCT ?movement ?movementLabel ?startDate ?endDate ?countryLabel ?description
WHERE {
  ?movement wdt:P31/wdt:P279* wd:Q49773 .
  OPTIONAL { ?movement wdt:P580 ?startDate . }
  OPTIONAL { ?movement wdt:P582 ?endDate . }
  OPTIONAL { ?movement wdt:P17 ?country . }
  OPTIONAL { ?movement schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "labor_strikes": """
SELECT DISTINCT ?strike ?strikeLabel ?date ?startDate ?endDate ?locationLabel ?countryLabel ?description
WHERE {
  ?strike wdt:P31/wdt:P279* wd:Q49776 .
  OPTIONAL { ?strike wdt:P585 ?date . }
  OPTIONAL { ?strike wdt:P580 ?startDate . }
  OPTIONAL { ?strike wdt:P582 ?endDate . }
  OPTIONAL { ?strike wdt:P276 ?location . }
  OPTIONAL { ?strike wdt:P17 ?country . }
  OPTIONAL { ?strike schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "protests": """
SELECT DISTINCT ?protest ?protestLabel ?date ?locationLabel ?countryLabel ?participantsLabel ?description
WHERE {
  ?protest wdt:P31/wdt:P279* wd:Q273120 .
  OPTIONAL { ?protest wdt:P585 ?date . }
  OPTIONAL { ?protest wdt:P276 ?location . }
  OPTIONAL { ?protest wdt:P17 ?country . }
  OPTIONAL { ?protest wdt:P1120 ?participants . }
  OPTIONAL { ?protest schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "riots": """
SELECT DISTINCT ?riot ?riotLabel ?date ?locationLabel ?countryLabel ?description
WHERE {
  ?riot wdt:P31/wdt:P279* wd:Q124757 .
  OPTIONAL { ?riot wdt:P585 ?date . }
  OPTIONAL { ?riot wdt:P276 ?location . }
  OPTIONAL { ?riot wdt:P17 ?country . }
  OPTIONAL { ?riot schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "civil_rights_movements": """
SELECT DISTINCT ?movement ?movementLabel ?startDate ?endDate ?countryLabel ?description
WHERE {
  ?movement wdt:P31/wdt:P279* wd:Q2373821 .
  OPTIONAL { ?movement wdt:P580 ?startDate . }
  OPTIONAL { ?movement wdt:P582 ?endDate . }
  OPTIONAL { ?movement wdt:P17 ?country . }
  OPTIONAL { ?movement schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "independence_movements": """
SELECT DISTINCT ?movement ?movementLabel ?startDate ?endDate ?countryLabel ?description
WHERE {
  ?movement wdt:P31/wdt:P279* wd:Q1323623 .
  OPTIONAL { ?movement wdt:P580 ?startDate . }
  OPTIONAL { ?movement wdt:P582 ?endDate . }
  OPTIONAL { ?movement wdt:P17 ?country . }
  OPTIONAL { ?movement schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "feminist_movements": """
SELECT DISTINCT ?movement ?movementLabel ?startDate ?endDate ?countryLabel ?description
WHERE {
  { ?movement wdt:P31/wdt:P279* wd:Q3428920 . }
  UNION
  { ?movement wdt:P135 wd:Q7252 . }
  OPTIONAL { ?movement wdt:P580 ?startDate . }
  OPTIONAL { ?movement wdt:P582 ?endDate . }
  OPTIONAL { ?movement wdt:P17 ?country . }
  OPTIONAL { ?movement schema:description ?description . FILTER(LANG(?description) = "en") }
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
        for key in ["movement", "strike", "protest", "riot"]:
            uri = b.get(key, {}).get("value", "")
            if uri: break
        if not uri: continue
        for key in ["movementLabel", "strikeLabel", "protestLabel", "riotLabel"]:
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
                "participants": b.get("participantsLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("SOCIAL MOVEMENTS SCRAPER - Starting")
    all_data = {}
    stats = {}
    
    for cat, query in MOVEMENT_QUERIES.items():
        print(f"Scraping {cat}...")
        results = run_query(query)
        if results:
            items = process(results, cat)
            stats[cat] = len(items)
            print(f"  Found {len(items)}")
            for item in items:
                if item["wikidata_id"] not in all_data:
                    all_data[item["wikidata_id"]] = item
        time.sleep(3)
    
    with open(OUTPUT_DIR / "all_movements.json", "w") as f:
        json.dump(list(all_data.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_data), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_data)} movement records")

if __name__ == "__main__":
    main()
