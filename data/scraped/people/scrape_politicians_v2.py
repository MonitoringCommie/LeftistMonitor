#!/usr/bin/env python3
"""Comprehensive Politicians Scraper - Target: 500,000+ people"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
HEADERS = {"Accept": "application/json", "User-Agent": "LeftistMonitor/1.0"}

QUERIES = {
    "heads_of_state": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?positionLabel ?description
WHERE {
  { ?person wdt:P39 wd:Q48352 . } UNION { ?person wdt:P39 wd:Q2285706 . }
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person wdt:P39 ?position . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 50000""",
    "revolutionaries": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {
  ?person wdt:P106 wd:Q3242115 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "communists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?partyLabel ?description
WHERE {
  ?person wdt:P102 ?party . ?party wdt:P1142 wd:Q6186 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "socialists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?partyLabel ?description
WHERE {
  ?person wdt:P102 ?party . ?party wdt:P1142 wd:Q7272 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 30000""",
    "labor_leaders": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {
  ?person wdt:P106 wd:Q15627169 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000""",
    "independence_activists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {
  ?person wdt:P106 wd:Q1734662 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "political_theorists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {
  ?person wdt:P106 wd:Q14467526 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 20000""",
    "resistance_fighters": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {
  ?person wdt:P106 wd:Q1397808 .
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P27 ?country . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} LIMIT 15000"""
}

def run_query(query, category):
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
    people = []
    for b in results["results"]["bindings"]:
        uri = b.get("person", {}).get("value", "")
        if not uri: continue
        wid = uri.split("/")[-1]
        name = b.get("personLabel", {}).get("value", "")
        if name and not name.startswith("Q"):
            people.append({
                "wikidata_id": wid, "name": name,
                "birth_date": b.get("birthDate", {}).get("value"),
                "death_date": b.get("deathDate", {}).get("value"),
                "country": b.get("countryLabel", {}).get("value"),
                "position": b.get("positionLabel", {}).get("value"),
                "party": b.get("partyLabel", {}).get("value"),
                "description": b.get("description", {}).get("value"),
                "category": category
            })
    return people

def main():
    print("POLITICIANS SCRAPER - Starting")
    all_people, stats = {}, {}
    
    for cat, query in QUERIES.items():
        print(f"Scraping {cat}...")
        results = run_query(query, cat)
        if results:
            people = process(results, cat)
            stats[cat] = len(people)
            print(f"  Found {len(people)}")
            for p in people:
                wid = p["wikidata_id"]
                if wid not in all_people:
                    all_people[wid] = p
                    all_people[wid]["categories"] = [cat]
                elif cat not in all_people[wid].get("categories", []):
                    all_people[wid].setdefault("categories", []).append(cat)
        time.sleep(3)
    
    with open(OUTPUT_DIR / "all_people_comprehensive.json", "w") as f:
        json.dump(list(all_people.values()), f, ensure_ascii=False, indent=2)
    with open(OUTPUT_DIR / "scrape_stats.json", "w") as f:
        json.dump({"total": len(all_people), "categories": stats, "scraped_at": datetime.now().isoformat()}, f, indent=2)
    print(f"COMPLETE: {len(all_people)} people")

if __name__ == "__main__":
    main()
