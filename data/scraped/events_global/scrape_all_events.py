#!/usr/bin/env python3
"""
Comprehensive Events Scraper
Target: 500,000+ historical/political events from Wikidata
"""
import json
import time
import requests
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "LeftistMonitor/1.0 (historical research)"
}

EVENT_QUERIES = {
    "revolutions": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?locationLabel 
       ?countryLabel ?participantLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q10931 .  # revolution
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P580 ?startDate . }}
  OPTIONAL {{ ?event wdt:P582 ?endDate . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P710 ?participant . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "wars": """
SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?locationLabel 
       ?participantLabel ?casualtiesLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q198 .  # war
  
  OPTIONAL {{ ?event wdt:P580 ?startDate . }}
  OPTIONAL {{ ?event wdt:P582 ?endDate . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P710 ?participant . }}
  OPTIONAL {{ ?event wdt:P1120 ?casualties . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "battles": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel 
       ?participantLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q178561 .  # battle
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P710 ?participant . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",

    "coups": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?leaderLabel 
       ?outcomeLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q45382 .  # coup d etat
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P710 ?leader . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
""",

    "protests": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel 
       ?participantLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q273120 .  # protest
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P710 ?participant . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "strikes": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?locationLabel 
       ?countryLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q49776 .  # strike action
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P580 ?startDate . }}
  OPTIONAL {{ ?event wdt:P582 ?endDate . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "massacres": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel 
       ?casualtiesLabel ?perpetratorLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q3199915 .  # massacre
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P1120 ?casualties . }}
  OPTIONAL {{ ?event wdt:P8031 ?perpetrator . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "treaties": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?signatoryLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q131569 .  # treaty
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P710 ?signatory . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "independence_declarations": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?description
WHERE {{
  ?event wdt:P31 wd:Q1464916 .  # declaration of independence
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 5000
""",

    "occupations": """
SELECT DISTINCT ?event ?eventLabel ?startDate ?endDate ?locationLabel 
       ?occupierLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q188686 .  # military occupation
  
  OPTIONAL {{ ?event wdt:P580 ?startDate . }}
  OPTIONAL {{ ?event wdt:P582 ?endDate . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P710 ?occupier . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
""",

    "sieges": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?locationLabel 
       ?attackerLabel ?defenderLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q188055 .  # siege
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P580 ?startDate . }}
  OPTIONAL {{ ?event wdt:P582 ?endDate . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "elections_events": """
SELECT DISTINCT ?event ?eventLabel ?date ?countryLabel ?winnerLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q40231 .  # election
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P991 ?winner . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",

    "assassinations": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?victimLabel 
       ?perpetratorLabel ?description
WHERE {{
  ?event wdt:P31 wd:Q3882219 .  # assassination
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P1339 ?victim . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
""",

    "natural_disasters": """
SELECT DISTINCT ?event ?eventLabel ?date ?locationLabel ?countryLabel 
       ?casualtiesLabel ?description
WHERE {{
  ?event wdt:P31/wdt:P279* wd:Q8065 .  # natural disaster
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P276 ?location . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event wdt:P1120 ?casualties . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "economic_crises": """
SELECT DISTINCT ?event ?eventLabel ?date ?startDate ?endDate ?countryLabel ?description
WHERE {{
  {{ ?event wdt:P31/wdt:P279* wd:Q83267 . }}  # economic crisis
  UNION
  {{ ?event wdt:P31/wdt:P279* wd:Q861656 . }}  # financial crisis
  
  OPTIONAL {{ ?event wdt:P585 ?date . }}
  OPTIONAL {{ ?event wdt:P580 ?startDate . }}
  OPTIONAL {{ ?event wdt:P582 ?endDate . }}
  OPTIONAL {{ ?event wdt:P17 ?country . }}
  OPTIONAL {{ ?event schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
"""
}


def run_sparql_query(query, category):
    for attempt in range(3):
        try:
            response = requests.get(
                WIKIDATA_ENDPOINT,
                params={"query": query, "format": "json"},
                headers=HEADERS,
                timeout=180
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return None


def extract_value(binding, key):
    if key in binding and "value" in binding[key]:
        return binding[key]["value"]
    return None


def process_events(results, category):
    if not results or "results" not in results:
        return []
    
    events = []
    for binding in results["results"]["bindings"]:
        uri = extract_value(binding, "event")
        if not uri:
            continue
        
        wikidata_id = uri.split("/")[-1]
        
        event = {
            "wikidata_id": wikidata_id,
            "name": extract_value(binding, "eventLabel") or "",
            "date": extract_value(binding, "date"),
            "start_date": extract_value(binding, "startDate"),
            "end_date": extract_value(binding, "endDate"),
            "location": extract_value(binding, "locationLabel"),
            "country": extract_value(binding, "countryLabel"),
            "participants": extract_value(binding, "participantLabel"),
            "casualties": extract_value(binding, "casualtiesLabel"),
            "description": extract_value(binding, "description"),
            "event_type": category,
        }
        
        if event["name"] and not event["name"].startswith("Q"):
            events.append(event)
    
    return events


def main():
    print("="*60)
    print("COMPREHENSIVE EVENTS SCRAPER")
    print("Target: 500,000+ events")
    print("="*60)
    
    all_events = {}
    stats = {}
    
    for category, query in EVENT_QUERIES.items():
        print(f"
Scraping {category}...", end=" ", flush=True)
        results = run_sparql_query(query, category)
        
        if results:
            events = process_events(results, category)
            for e in events:
                wid = e["wikidata_id"]
                if wid not in all_events:
                    all_events[wid] = e
            
            stats[category] = len(events)
            print(f"{len(events)} found")
        else:
            print("failed")
        
        time.sleep(3)
    
    # Save results
    output_file = OUTPUT_DIR / "all_events_comprehensive.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(list(all_events.values()), f, ensure_ascii=False, indent=2)
    
    stats_file = OUTPUT_DIR / "scrape_stats.json"
    with open(stats_file, "w") as f:
        json.dump({
            "total_events": len(all_events),
            "categories": stats,
            "scraped_at": datetime.now().isoformat()
        }, f, indent=2)
    
    print("
" + "="*60)
    print(f"COMPLETE: {len(all_events)} unique events scraped")
    print(f"Output: {output_file}")
    print("="*60)


if __name__ == "__main__":
    main()
