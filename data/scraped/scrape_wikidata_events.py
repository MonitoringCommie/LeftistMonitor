#!/usr/bin/env python3
"""Scrape historical events from Wikidata using SPARQL."""
import json
import time
import requests
from pathlib import Path

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent / "events"
OUTPUT_DIR.mkdir(exist_ok=True)

EVENT_QUERIES = {
    "revolutions": """
        SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?countryLabel ?locationLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q10931 .  # instance of: revolution
          OPTIONAL { ?event wdt:P580 ?startDate . }
          OPTIONAL { ?event wdt:P582 ?endDate . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event wdt:P276 ?location . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "civil_wars": """
        SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?countryLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q8465 .  # instance of: civil war
          OPTIONAL { ?event wdt:P580 ?startDate . }
          OPTIONAL { ?event wdt:P582 ?endDate . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 3000
    """,
    "wars": """
        SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?description
        WHERE {
          ?event wdt:P31 wd:Q198 .  # instance of: war
          OPTIONAL { ?event wdt:P580 ?startDate . }
          OPTIONAL { ?event wdt:P582 ?endDate . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "strikes": """
        SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?countryLabel ?locationLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q49776 .  # instance of: strike action
          OPTIONAL { ?event wdt:P580 ?startDate . }
          OPTIONAL { ?event wdt:P582 ?endDate . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event wdt:P276 ?location . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "protests": """
        SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?countryLabel ?locationLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q273120 .  # instance of: protest
          OPTIONAL { ?event wdt:P580 ?startDate . }
          OPTIONAL { ?event wdt:P582 ?endDate . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event wdt:P276 ?location . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "massacres": """
        SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?locationLabel ?description ?casualties
        WHERE {
          ?event wdt:P31 wd:Q3199915 .  # instance of: massacre
          OPTIONAL { ?event wdt:P585 ?date . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event wdt:P276 ?location . }
          OPTIONAL { ?event wdt:P1120 ?casualties . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 3000
    """,
    "coups": """
        SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q45382 .  # instance of: coup d'état
          OPTIONAL { ?event wdt:P585 ?date . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 2000
    """,
    "independence_declarations": """
        SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q1464916 .  # instance of: declaration of independence
          OPTIONAL { ?event wdt:P585 ?date . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 1000
    """,
    "elections": """
        SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q40231 .  # instance of: election
          ?event wdt:P17 ?country .
          OPTIONAL { ?event wdt:P585 ?date . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 10000
    """,
    "rebellions": """
        SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?countryLabel ?description
        WHERE {
          ?event wdt:P31 wd:Q124734 .  # instance of: rebellion
          OPTIONAL { ?event wdt:P580 ?startDate . }
          OPTIONAL { ?event wdt:P582 ?endDate . }
          OPTIONAL { ?event wdt:P17 ?country . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 3000
    """,
    "treaties": """
        SELECT DISTINCT ?event ?eventLabel ?date ?description
        WHERE {
          ?event wdt:P31 wd:Q131569 .  # instance of: treaty
          OPTIONAL { ?event wdt:P585 ?date . }
          OPTIONAL { ?event schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
}

def run_sparql_query(query, category):
    headers = {
        "Accept": "application/json",
        "User-Agent": "LeftistMonitor/1.0 (historical research project)"
    }
    
    try:
        response = requests.get(
            WIKIDATA_ENDPOINT,
            params={"query": query, "format": "json"},
            headers=headers,
            timeout=120
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error querying {category}: {e}")
        return None

def main():
    all_events = {}
    
    for category, query in EVENT_QUERIES.items():
        print(f"Scraping {category}...")
        result = run_sparql_query(query, category)
        
        if result and "results" in result:
            bindings = result["results"]["bindings"]
            print(f"  Found {len(bindings)} {category}")
            
            output_file = OUTPUT_DIR / f"{category}_raw.json"
            with open(output_file, "w") as f:
                json.dump(bindings, f, indent=2)
            
            for binding in bindings:
                event_uri = binding.get("event", {}).get("value", "")
                if not event_uri:
                    continue
                    
                wikidata_id = event_uri.split("/")[-1]
                
                if wikidata_id not in all_events:
                    all_events[wikidata_id] = {
                        "wikidata_id": wikidata_id,
                        "title": binding.get("eventLabel", {}).get("value", ""),
                        "start_date": binding.get("startDate", {}).get("value", "") or binding.get("date", {}).get("value", ""),
                        "end_date": binding.get("endDate", {}).get("value", ""),
                        "country": binding.get("countryLabel", {}).get("value", ""),
                        "location": binding.get("locationLabel", {}).get("value", ""),
                        "description": binding.get("description", {}).get("value", ""),
                        "categories": [category],
                    }
                else:
                    if category not in all_events[wikidata_id]["categories"]:
                        all_events[wikidata_id]["categories"].append(category)
        
        time.sleep(2)
    
    output_file = OUTPUT_DIR / "all_events.json"
    with open(output_file, "w") as f:
        json.dump(list(all_events.values()), f, indent=2)
    
    print(f"\nTotal unique events: {len(all_events)}")
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    main()
