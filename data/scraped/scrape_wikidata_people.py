#!/usr/bin/env python3
"""Scrape historical people from Wikidata using SPARQL."""
import json
import time
import requests
from pathlib import Path

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent / "people"
OUTPUT_DIR.mkdir(exist_ok=True)

# Categories of people to scrape
PEOPLE_QUERIES = {
    "revolutionaries": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?deathPlaceLabel 
               ?countryLabel ?occupationLabel ?description
        WHERE {
          ?person wdt:P106 wd:Q3242115 .  # occupation: revolutionary
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P20 ?deathPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person wdt:P106 ?occupation . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 10000
    """,
    "communists": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?deathPlaceLabel 
               ?countryLabel ?partyLabel ?description
        WHERE {
          ?person wdt:P102 ?party .
          ?party wdt:P1142 wd:Q6186 .  # party ideology: communism
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P20 ?deathPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 10000
    """,
    "socialists": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?partyLabel ?description
        WHERE {
          ?person wdt:P102 ?party .
          ?party wdt:P1142 wd:Q7272 .  # party ideology: socialism
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 10000
    """,
    "anarchists": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          { ?person wdt:P106 wd:Q15253558 . }  # anarchist
          UNION
          { ?person wdt:P135 wd:Q6199 . }  # movement: anarchism
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "labor_leaders": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          ?person wdt:P106 wd:Q15627169 .  # trade union leader
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "anti_colonial_leaders": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          ?person wdt:P106 wd:Q1734662 .  # independence activist
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "civil_rights_activists": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          ?person wdt:P106 wd:Q15253558 .  # civil rights activist
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "political_theorists": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          ?person wdt:P106 wd:Q14467526 .  # political theorist
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "feminist_activists": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          { ?person wdt:P106 wd:Q10843402 . }  # women's rights activist
          UNION
          { ?person wdt:P135 wd:Q7252 . }  # movement: feminism
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
    "resistance_fighters": """
        SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?countryLabel ?description
        WHERE {
          ?person wdt:P106 wd:Q1397808 .  # resistance fighter
          OPTIONAL { ?person wdt:P569 ?birthDate . }
          OPTIONAL { ?person wdt:P570 ?deathDate . }
          OPTIONAL { ?person wdt:P19 ?birthPlace . }
          OPTIONAL { ?person wdt:P27 ?country . }
          OPTIONAL { ?person schema:description ?description . FILTER(LANG(?description) = "en") }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 5000
    """,
}

def run_sparql_query(query, category):
    """Run a SPARQL query against Wikidata."""
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
    all_people = {}
    
    for category, query in PEOPLE_QUERIES.items():
        print(f"Scraping {category}...")
        result = run_sparql_query(query, category)
        
        if result and "results" in result:
            bindings = result["results"]["bindings"]
            print(f"  Found {len(bindings)} {category}")
            
            # Save raw data
            output_file = OUTPUT_DIR / f"{category}_raw.json"
            with open(output_file, "w") as f:
                json.dump(bindings, f, indent=2)
            
            # Process and deduplicate
            for binding in bindings:
                person_uri = binding.get("person", {}).get("value", "")
                if not person_uri:
                    continue
                    
                wikidata_id = person_uri.split("/")[-1]
                
                if wikidata_id not in all_people:
                    all_people[wikidata_id] = {
                        "wikidata_id": wikidata_id,
                        "name": binding.get("personLabel", {}).get("value", ""),
                        "birth_date": binding.get("birthDate", {}).get("value", ""),
                        "death_date": binding.get("deathDate", {}).get("value", ""),
                        "birth_place": binding.get("birthPlaceLabel", {}).get("value", ""),
                        "death_place": binding.get("deathPlaceLabel", {}).get("value", ""),
                        "country": binding.get("countryLabel", {}).get("value", ""),
                        "description": binding.get("description", {}).get("value", ""),
                        "categories": [category],
                    }
                else:
                    if category not in all_people[wikidata_id]["categories"]:
                        all_people[wikidata_id]["categories"].append(category)
        
        # Rate limiting
        time.sleep(2)
    
    # Save combined data
    output_file = OUTPUT_DIR / "all_people.json"
    with open(output_file, "w") as f:
        json.dump(list(all_people.values()), f, indent=2)
    
    print(f"\nTotal unique people: {len(all_people)}")
    print(f"Saved to {output_file}")

if __name__ == "__main__":
    main()
