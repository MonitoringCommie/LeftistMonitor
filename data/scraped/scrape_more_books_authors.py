#!/usr/bin/env python3
"""
Scrape many more leftist authors, economists, and books from Wikidata.
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
            timeout=120
        )
        response.raise_for_status()
        data = response.json()
        results = data.get("results", {}).get("bindings", [])
        print(f"  Found {len(results)} results")
        return results
    except Exception as e:
        print(f"  Error: {e}")
        return []

# Query for economists
ECONOMISTS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P106 wd:Q188094 .  # economist
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
"""

# Query for political theorists
POLITICAL_THEORISTS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P106 wd:Q14467526 .  # political theorist
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
"""

# Query for philosophers
PHILOSOPHERS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P106 wd:Q4964182 .  # philosopher
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# Query for historians
HISTORIANS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P106 wd:Q201788 .  # historian
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 15000
"""

# Query for sociologists
SOCIOLOGISTS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  ?person wdt:P106 wd:Q2306091 .  # sociologist
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
"""

# Query for labor leaders and union organizers
LABOR_LEADERS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  { ?person wdt:P106 wd:Q15627169 . }  # trade union leader
  UNION { ?person wdt:P106 wd:Q3242115 . }  # labor organizer
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 5000
"""

# Query for political writers and journalists
POLITICAL_WRITERS_QUERY = """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?description WHERE {
  ?person wdt:P31 wd:Q5 .
  { ?person wdt:P106 wd:Q6168364 . }  # political journalist
  UNION { ?person wdt:P106 wd:Q82955 . }  # politician who is also writer
  ?person wdt:P106 wd:Q36180 .  # writer
  OPTIONAL { ?person wdt:P569 ?birthDate . }
  OPTIONAL { ?person wdt:P570 ?deathDate . }
  OPTIONAL { ?person wdt:P19 ?birthPlace . }
  OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 8000
"""

def process_person(result, person_type):
    """Process a person result into a dictionary."""
    wikidata_id = result.get("person", {}).get("value", "").split("/")[-1]
    name = result.get("personLabel", {}).get("value", "")
    
    if not name or name == wikidata_id:
        return None
    
    birth_date = result.get("birthDate", {}).get("value", "")[:10] if result.get("birthDate") else None
    death_date = result.get("deathDate", {}).get("value", "")[:10] if result.get("deathDate") else None
    birth_place = result.get("birthPlaceLabel", {}).get("value", "")
    description = result.get("description", {}).get("value", "")
    
    return {
        "wikidata_id": wikidata_id,
        "name": name,
        "birth_date": birth_date,
        "death_date": death_date,
        "birth_place": birth_place,
        "description": description,
        "person_types": [person_type]
    }

def main():
    all_people = {}
    
    queries = [
        (ECONOMISTS_QUERY, "economists", "Economists"),
        (POLITICAL_THEORISTS_QUERY, "political_theorist", "Political theorists"),
        (PHILOSOPHERS_QUERY, "philosopher", "Philosophers"),
        (HISTORIANS_QUERY, "historian", "Historians"),
        (SOCIOLOGISTS_QUERY, "sociologist", "Sociologists"),
        (LABOR_LEADERS_QUERY, "labor_leader", "Labor leaders"),
        (POLITICAL_WRITERS_QUERY, "political_writer", "Political writers"),
    ]
    
    for query, person_type, description in queries:
        results = query_wikidata(query, description)
        time.sleep(2)
        
        for result in results:
            person = process_person(result, person_type)
            if person:
                wid = person["wikidata_id"]
                if wid in all_people:
                    # Merge person types
                    if person_type not in all_people[wid]["person_types"]:
                        all_people[wid]["person_types"].append(person_type)
                else:
                    all_people[wid] = person
    
    # Save results
    people_list = list(all_people.values())
    
    output_file = Path("more_authors.json")
    with open(output_file, "w") as f:
        json.dump(people_list, f, indent=2)
    
    print(f"\n{'='*60}")
    print(f"Total unique people: {len(people_list)}")
    print(f"Saved to {output_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
