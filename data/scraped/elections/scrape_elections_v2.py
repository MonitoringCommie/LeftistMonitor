#!/usr/bin/env python3
"""Comprehensive Elections & Parties Scraper"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

ELECTION_QUERIES = {
    "general_elections": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?typeLabel ?winnerLabel ?description
WHERE {
  ?election wdt:P31/wdt:P279* wd:Q40231 .
  OPTIONAL { ?election wdt:P585 ?date . }
  OPTIONAL { ?election wdt:P17 ?country . }
  OPTIONAL { ?election wdt:P31 ?type . }
  OPTIONAL { ?election wdt:P991 ?winner . }
  OPTIONAL { ?election schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "presidential_elections": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?winnerLabel ?description
WHERE {
  ?election wdt:P31 wd:Q858439 .
  OPTIONAL { ?election wdt:P585 ?date . }
  OPTIONAL { ?election wdt:P17 ?country . }
  OPTIONAL { ?election wdt:P991 ?winner . }
  OPTIONAL { ?election schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "referendums": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?description
WHERE {
  ?election wdt:P31 wd:Q43109 .
  OPTIONAL { ?election wdt:P585 ?date . }
  OPTIONAL { ?election wdt:P17 ?country . }
  OPTIONAL { ?election schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000"""
}

PARTY_QUERIES = {
    "all_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate ?ideologyLabel ?positionLabel ?description
WHERE {
  ?party wdt:P31 wd:Q7278 .
  OPTIONAL { ?party wdt:P17 ?country . }
  OPTIONAL { ?party wdt:P571 ?foundedDate . }
  OPTIONAL { ?party wdt:P576 ?dissolvedDate . }
  OPTIONAL { ?party wdt:P1142 ?ideology . }
  OPTIONAL { ?party wdt:P1387 ?position . }
  OPTIONAL { ?party schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "communist_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate ?description
WHERE {
  ?party wdt:P31 wd:Q7278 . ?party wdt:P1142 wd:Q6186 .
  OPTIONAL { ?party wdt:P17 ?country . }
  OPTIONAL { ?party wdt:P571 ?foundedDate . }
  OPTIONAL { ?party wdt:P576 ?dissolvedDate . }
  OPTIONAL { ?party schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 10000""",
    "socialist_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate ?description
WHERE {
  ?party wdt:P31 wd:Q7278 . ?party wdt:P1142 wd:Q7272 .
  OPTIONAL { ?party wdt:P17 ?country . }
  OPTIONAL { ?party wdt:P571 ?foundedDate . }
  OPTIONAL { ?party wdt:P576 ?dissolvedDate . }
  OPTIONAL { ?party schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000"""
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

def process_elections(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        uri = b.get("election", {}).get("value", "")
        if not uri: continue
        name = b.get("electionLabel", {}).get("value", "")
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "date": b.get("date", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "election_type": b.get("typeLabel", {}).get("value") or category,
                "winner": b.get("winnerLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def process_parties(results, category):
    if not results or "results" not in results: return []
    items = []
    for b in results["results"]["bindings"]:
        uri = b.get("party", {}).get("value", "")
        if not uri: continue
        name = b.get("partyLabel", {}).get("value", "")
        if name and not name.startswith("Q"):
            items.append({
                "wikidata_id": uri.split("/")[-1], "name": name,
                "country": b.get("countryLabel", {}).get("value"),
                "founded": b.get("foundedDate", {}).get("value"),
                "dissolved": b.get("dissolvedDate", {}).get("value"),
                "ideology": b.get("ideologyLabel", {}).get("value"),
                "position": b.get("positionLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return items

def main():
    print("ELECTIONS & PARTIES SCRAPER - Starting")
    all_elections, all_parties = {}, {}
    stats = {"elections": {}, "parties": {}}
    
    print("Scraping elections...")
    for cat, query in ELECTION_QUERIES.items():
        print(f"  {cat}...")
        results = run_query(query)
        if results:
            items = process_elections(results, cat)
            stats["elections"][cat] = len(items)
            print(f"    Found {len(items)}")
            for e in items:
                if e["wikidata_id"] not in all_elections:
                    all_elections[e["wikidata_id"]] = e
        time.sleep(3)
    
    print("Scraping parties...")
    for cat, query in PARTY_QUERIES.items():
        print(f"  {cat}...")
        results = run_query(query)
        if results:
            items = process_parties(results, cat)
            stats["parties"][cat] = len(items)
            print(f"    Found {len(items)}")
            for p in items:
                if p["wikidata_id"] not in all_parties:
                    all_parties[p["wikidata_id"]] = p
        time.sleep(3)
    
    with open(OUTPUT_DIR / "all_elections.json", "w") as f:
        json.dump(list(all_elections.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "all_parties.json", "w") as f:
        json.dump(list(all_parties.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"elections": len(all_elections), "parties": len(all_parties), "stats": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_elections)} elections, {len(all_parties)} parties")

if __name__ == "__main__":
    main()
