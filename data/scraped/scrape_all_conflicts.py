#!/usr/bin/env python3
"""
Scrape ALL historical conflicts from Wikidata - wars, battles, civil wars, 
rebellions, revolutions, coups, insurgencies from 1886 onwards.
"""

import requests
import json
import time
from pathlib import Path

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"

def query_wikidata(sparql_query, description):
    """Execute SPARQL query against Wikidata."""
    print(f"Querying: {description}...")
    
    headers = {
        "User-Agent": "LeftistMonitor/1.0 (Educational Project)",
        "Accept": "application/json"
    }
    
    try:
        response = requests.get(
            WIKIDATA_ENDPOINT,
            params={"query": sparql_query, "format": "json"},
            headers=headers,
            timeout=300
        )
        response.raise_for_status()
        data = response.json()
        results = data.get("results", {}).get("bindings", [])
        print(f"  Found {len(results)} results")
        return results
    except Exception as e:
        print(f"  Error: {e}")
        return []

# All wars
WARS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q198 .  # war or subclass
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 20000
"""

# Battles
BATTLES_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q178561 .  # battle
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }  # point in time
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 30000
"""

# Civil wars
CIVIL_WARS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q8465 .  # civil war
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
"""

# Rebellions and uprisings
REBELLIONS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  { ?conflict wdt:P31/wdt:P279* wd:Q124734 . }  # rebellion
  UNION { ?conflict wdt:P31/wdt:P279* wd:Q5765972 . }  # uprising
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
"""

# Revolutions
REVOLUTIONS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q10931 .  # revolution
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
"""

# Coups
COUPS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q45382 .  # coup d'etat
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 3000
"""

# Military operations
MILITARY_OPS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q645883 .  # military operation
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# Insurgencies
INSURGENCIES_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q149759 .  # insurgency
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
"""

# Massacres and genocides
MASSACRES_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  { ?conflict wdt:P31/wdt:P279* wd:Q3199915 . }  # massacre
  UNION { ?conflict wdt:P31/wdt:P279* wd:Q41397 . }  # genocide
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
"""

# Armed conflicts (generic)
ARMED_CONFLICTS_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q350604 .  # armed conflict
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# Sieges
SIEGES_QUERY = """
SELECT DISTINCT ?conflict ?conflictLabel ?startDate ?endDate ?description ?locationLabel ?casualties WHERE {
  ?conflict wdt:P31/wdt:P279* wd:Q188055 .  # siege
  OPTIONAL { ?conflict wdt:P580 ?startDate . }
  OPTIONAL { ?conflict wdt:P585 ?startDate . }
  OPTIONAL { ?conflict wdt:P582 ?endDate . }
  OPTIONAL { ?conflict wdt:P276 ?location . }
  OPTIONAL { ?conflict wdt:P1120 ?casualties . }
  OPTIONAL { ?conflict schema:description ?description . FILTER(LANG(?description) = "en") }
  FILTER(!BOUND(?startDate) || YEAR(?startDate) >= 1800)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 8000
"""

def process_conflict(result, conflict_type):
    """Process a conflict result into a dictionary."""
    wikidata_id = result.get("conflict", {}).get("value", "").split("/")[-1]
    name = result.get("conflictLabel", {}).get("value", "")
    
    if not name or name == wikidata_id:
        return None
    
    start_date = result.get("startDate", {}).get("value", "")[:10] if result.get("startDate") else None
    end_date = result.get("endDate", {}).get("value", "")[:10] if result.get("endDate") else None
    location = result.get("locationLabel", {}).get("value", "")
    description = result.get("description", {}).get("value", "")
    
    casualties = None
    if result.get("casualties"):
        try:
            casualties = int(result.get("casualties", {}).get("value", "0"))
        except:
            pass
    
    return {
        "wikidata_id": wikidata_id,
        "name": name,
        "start_date": start_date,
        "end_date": end_date,
        "location": location if location and location != wikidata_id else None,
        "description": description,
        "conflict_type": conflict_type,
        "casualties": casualties
    }

def main():
    all_conflicts = {}
    
    queries = [
        (WARS_QUERY, "war", "Wars"),
        (BATTLES_QUERY, "battle", "Battles"),
        (CIVIL_WARS_QUERY, "civil_war", "Civil wars"),
        (REBELLIONS_QUERY, "rebellion", "Rebellions and uprisings"),
        (REVOLUTIONS_QUERY, "revolution", "Revolutions"),
        (COUPS_QUERY, "coup", "Coups d'etat"),
        (MILITARY_OPS_QUERY, "military_operation", "Military operations"),
        (INSURGENCIES_QUERY, "insurgency", "Insurgencies"),
        (MASSACRES_QUERY, "massacre", "Massacres and genocides"),
        (ARMED_CONFLICTS_QUERY, "armed_conflict", "Armed conflicts"),
        (SIEGES_QUERY, "siege", "Sieges"),
    ]
    
    for query, conflict_type, description in queries:
        results = query_wikidata(query, description)
        time.sleep(3)
        
        for result in results:
            conflict = process_conflict(result, conflict_type)
            if conflict:
                wid = conflict["wikidata_id"]
                if wid not in all_conflicts:
                    all_conflicts[wid] = conflict
    
    # Save results
    conflicts_list = list(all_conflicts.values())
    
    output_file = Path("all_conflicts.json")
    with open(output_file, "w") as f:
        json.dump(conflicts_list, f, indent=2)
    
    # Stats
    by_type = {}
    for c in conflicts_list:
        t = c["conflict_type"]
        by_type[t] = by_type.get(t, 0) + 1
    
    print(f"\n{'='*60}")
    print(f"Total unique conflicts: {len(conflicts_list)}")
    print("\nBy type:")
    for t, count in sorted(by_type.items(), key=lambda x: -x[1]):
        print(f"  {t}: {count}")
    print(f"\nSaved to {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
