#!/usr/bin/env python3
"""International Organizations & UN Data Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

INTL_QUERIES = {
    "international_orgs": """
SELECT DISTINCT ?org ?orgLabel ?foundedDate ?headquartersLabel ?membersLabel ?description
WHERE {
  ?org wdt:P31/wdt:P279* wd:Q484652 .
  OPTIONAL { ?org wdt:P571 ?foundedDate . }
  OPTIONAL { ?org wdt:P159 ?headquarters . }
  OPTIONAL { ?org wdt:P527 ?members . }
  OPTIONAL { ?org schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "un_bodies": """
SELECT DISTINCT ?org ?orgLabel ?foundedDate ?parentLabel ?description
WHERE {
  ?org wdt:P361 wd:Q1065 .
  OPTIONAL { ?org wdt:P571 ?foundedDate . }
  OPTIONAL { ?org wdt:P749 ?parent . }
  OPTIONAL { ?org schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 5000""",
    "un_resolutions": """
SELECT DISTINCT ?resolution ?resolutionLabel ?date ?topicLabel ?description
WHERE {
  { ?resolution wdt:P31 wd:Q26187044 . }
  UNION
  { ?resolution wdt:P31 wd:Q43754707 . }
  OPTIONAL { ?resolution wdt:P585 ?date . }
  OPTIONAL { ?resolution wdt:P921 ?topic . }
  OPTIONAL { ?resolution schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "treaties": """
SELECT DISTINCT ?treaty ?treatyLabel ?date ?signatoryLabel ?topicLabel ?description
WHERE {
  ?treaty wdt:P31/wdt:P279* wd:Q131569 .
  OPTIONAL { ?treaty wdt:P585 ?date . }
  OPTIONAL { ?treaty wdt:P710 ?signatory . }
  OPTIONAL { ?treaty wdt:P921 ?topic . }
  OPTIONAL { ?treaty schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "ngos": """
SELECT DISTINCT ?ngo ?ngoLabel ?foundedDate ?countryLabel ?headquartersLabel ?description
WHERE {
  ?ngo wdt:P31/wdt:P279* wd:Q163740 .
  OPTIONAL { ?ngo wdt:P571 ?foundedDate . }
  OPTIONAL { ?ngo wdt:P17 ?country . }
  OPTIONAL { ?ngo wdt:P159 ?headquarters . }
  OPTIONAL { ?ngo schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000"""
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
        for key in ["org", "resolution", "treaty", "ngo"]:
            uri = b.get(key, {}).get("value", "")
            if uri: break
        if not uri: continue
        for key in ["orgLabel", "resolutionLabel", "treatyLabel", "ngoLabel"]:
            name = b.get(key, {}).get("value", "")
            if name: break
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "date": b.get("date", {}).get("value"),
                "founded": b.get("foundedDate", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "headquarters": b.get("headquartersLabel", {}).get("value"),
                "topic": b.get("topicLabel", {}).get("value"),
                "parent": b.get("parentLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("INTERNATIONAL ORGS SCRAPER - Starting", flush=True)
    all_data = {}
    stats = {}
    
    for cat, query in INTL_QUERIES.items():
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
    
    with open(OUTPUT_DIR / "all_intl_orgs.json", "w") as f:
        json.dump(list(all_data.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_data), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_data)} international org records", flush=True)

if __name__ == "__main__":
    main()
