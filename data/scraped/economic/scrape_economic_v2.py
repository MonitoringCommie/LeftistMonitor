#!/usr/bin/env python3
"""Comprehensive Economic Data Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

ECONOMIC_QUERIES = {
    "economic_crises": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?countryLabel ?description
WHERE {
  { ?event wdt:P31/wdt:P279* wd:Q83267 . }
  UNION
  { ?event wdt:P31/wdt:P279* wd:Q861656 . }
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P580 ?startDate . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "trade_agreements": """
SELECT DISTINCT ?agreement ?agreementLabel ?date ?signatoryLabel ?description
WHERE {
  ?agreement wdt:P31/wdt:P279* wd:Q625298 .
  OPTIONAL { ?agreement wdt:P585 ?date . }
  OPTIONAL { ?agreement wdt:P710 ?signatory . }
  OPTIONAL { ?agreement schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "nationalizations": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?companyLabel ?description
WHERE {
  ?event wdt:P31/wdt:P279* wd:Q1055015 .
  OPTIONAL { ?event wdt:P585 ?date . }
  OPTIONAL { ?event wdt:P17 ?country . }
  OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "sanctions": """
SELECT DISTINCT ?sanction ?sanctionLabel ?date ?startDate ?targetLabel ?imposerLabel ?description
WHERE {
  ?sanction wdt:P31/wdt:P279* wd:Q1369832 .
  OPTIONAL { ?sanction wdt:P585 ?date . }
  OPTIONAL { ?sanction wdt:P580 ?startDate . }
  OPTIONAL { ?sanction wdt:P710 ?target . }
  OPTIONAL { ?sanction schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "companies": """
SELECT DISTINCT ?company ?companyLabel ?countryLabel ?foundedDate ?industryLabel ?description
WHERE {
  ?company wdt:P31/wdt:P279* wd:Q4830453 .
  ?company wdt:P17 ?country .
  OPTIONAL { ?company wdt:P571 ?foundedDate . }
  OPTIONAL { ?company wdt:P452 ?industry . }
  OPTIONAL { ?company schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "labor_unions": """
SELECT DISTINCT ?union ?unionLabel ?countryLabel ?foundedDate ?membersLabel ?description
WHERE {
  ?union wdt:P31/wdt:P279* wd:Q178790 .
  OPTIONAL { ?union wdt:P17 ?country . }
  OPTIONAL { ?union wdt:P571 ?foundedDate . }
  OPTIONAL { ?union wdt:P2124 ?members . }
  OPTIONAL { ?union schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000"""
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
        for key in ["event", "agreement", "sanction", "company", "union"]:
            uri = b.get(key, {}).get("value", "")
            if uri: break
        if not uri: continue
        for key in ["eventLabel", "agreementLabel", "sanctionLabel", "companyLabel", "unionLabel"]:
            name = b.get(key, {}).get("value", "")
            if name: break
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "date": b.get("date", {}).get("value"),
                "start_date": b.get("startDate", {}).get("value"),
                "end_date": b.get("endDate", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "founded": b.get("foundedDate", {}).get("value"),
                "industry": b.get("industryLabel", {}).get("value"),
                "members": b.get("membersLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("ECONOMIC DATA SCRAPER - Starting")
    all_data = {}
    stats = {}
    
    for cat, query in ECONOMIC_QUERIES.items():
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
    
    with open(OUTPUT_DIR / "all_economic.json", "w") as f:
        json.dump(list(all_data.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_data), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_data)} economic records")

if __name__ == "__main__":
    main()
