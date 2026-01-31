#!/usr/bin/env python3
"""Demographics & Population Data Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

DEMO_QUERIES = {
    "countries": """
SELECT DISTINCT ?country ?countryLabel ?population ?area ?capitalLabel ?governmentLabel ?currencyLabel ?description
WHERE {
  ?country wdt:P31 wd:Q6256 .
  OPTIONAL { ?country wdt:P1082 ?population . }
  OPTIONAL { ?country wdt:P2046 ?area . }
  OPTIONAL { ?country wdt:P36 ?capital . }
  OPTIONAL { ?country wdt:P122 ?government . }
  OPTIONAL { ?country wdt:P38 ?currency . }
  OPTIONAL { ?country schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 300""",
    "cities": """
SELECT DISTINCT ?city ?cityLabel ?countryLabel ?population ?coordinates ?description
WHERE {
  ?city wdt:P31/wdt:P279* wd:Q515 .
  ?city wdt:P1082 ?population .
  FILTER(?population > 100000)
  OPTIONAL { ?city wdt:P17 ?country . }
  OPTIONAL { ?city wdt:P625 ?coordinates . }
  OPTIONAL { ?city schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "ethnic_groups": """
SELECT DISTINCT ?group ?groupLabel ?countryLabel ?population ?description
WHERE {
  ?group wdt:P31/wdt:P279* wd:Q41710 .
  OPTIONAL { ?group wdt:P17 ?country . }
  OPTIONAL { ?group wdt:P1082 ?population . }
  OPTIONAL { ?group schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "languages": """
SELECT DISTINCT ?lang ?langLabel ?countryLabel ?speakersLabel ?familyLabel ?description
WHERE {
  ?lang wdt:P31 wd:Q34770 .
  OPTIONAL { ?lang wdt:P17 ?country . }
  OPTIONAL { ?lang wdt:P1098 ?speakers . }
  OPTIONAL { ?lang wdt:P279 ?family . }
  OPTIONAL { ?lang schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "religions": """
SELECT DISTINCT ?religion ?religionLabel ?foundedDate ?founderLabel ?followersLabel ?description
WHERE {
  ?religion wdt:P31/wdt:P279* wd:Q9174 .
  OPTIONAL { ?religion wdt:P571 ?foundedDate . }
  OPTIONAL { ?religion wdt:P112 ?founder . }
  OPTIONAL { ?religion wdt:P2124 ?followers . }
  OPTIONAL { ?religion schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "refugee_camps": """
SELECT DISTINCT ?camp ?campLabel ?countryLabel ?population ?coordinates ?description
WHERE {
  ?camp wdt:P31/wdt:P279* wd:Q152081 .
  OPTIONAL { ?camp wdt:P17 ?country . }
  OPTIONAL { ?camp wdt:P1082 ?population . }
  OPTIONAL { ?camp wdt:P625 ?coordinates . }
  OPTIONAL { ?camp schema:description ?description . FILTER(LANG(?description) = "en") }
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
            print(f"  Attempt {attempt+1} failed: {e}", flush=True)
            if attempt < 2: time.sleep(5 * (attempt + 1))
    return None

def process(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        for key in ["country", "city", "group", "lang", "religion", "camp"]:
            uri = b.get(key, {}).get("value", "")
            if uri: break
        if not uri: continue
        for key in ["countryLabel", "cityLabel", "groupLabel", "langLabel", "religionLabel", "campLabel"]:
            name = b.get(key, {}).get("value", "")
            if name: break
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "country": b.get("countryLabel", {}).get("value"),
                "population": b.get("population", {}).get("value"),
                "area": b.get("area", {}).get("value"),
                "capital": b.get("capitalLabel", {}).get("value"),
                "government": b.get("governmentLabel", {}).get("value"),
                "coordinates": b.get("coordinates", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("DEMOGRAPHICS SCRAPER - Starting", flush=True)
    all_data = {}
    stats = {}
    
    for cat, query in DEMO_QUERIES.items():
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
    
    with open(OUTPUT_DIR / "all_demographics.json", "w") as f:
        json.dump(list(all_data.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_data), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_data)} demographic records", flush=True)

if __name__ == "__main__":
    main()
