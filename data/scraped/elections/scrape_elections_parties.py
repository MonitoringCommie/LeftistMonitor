#!/usr/bin/env python3
"""
Comprehensive Elections & Parties Scraper
Target: 100,000+ elections, 50,000+ parties from Wikidata
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


ELECTION_QUERIES = {
    "general_elections": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?typeLabel 
       ?winnerLabel ?turnout ?seatsLabel ?description
WHERE {{
  ?election wdt:P31/wdt:P279* wd:Q40231 .  # instance of election
  
  OPTIONAL {{ ?election wdt:P585 ?date . }}
  OPTIONAL {{ ?election wdt:P17 ?country . }}
  OPTIONAL {{ ?election wdt:P31 ?type . }}
  OPTIONAL {{ ?election wdt:P991 ?winner . }}
  OPTIONAL {{ ?election wdt:P1697 ?turnout . }}
  OPTIONAL {{ ?election wdt:P1410 ?seats . }}
  OPTIONAL {{ ?election schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",

    "presidential_elections": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?winnerLabel ?runnerUpLabel ?description
WHERE {{
  ?election wdt:P31 wd:Q858439 .  # presidential election
  
  OPTIONAL {{ ?election wdt:P585 ?date . }}
  OPTIONAL {{ ?election wdt:P17 ?country . }}
  OPTIONAL {{ ?election wdt:P991 ?winner . }}
  OPTIONAL {{ ?election schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "legislative_elections": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?seatsLabel ?description
WHERE {{
  ?election wdt:P31 wd:Q1076105 .  # legislative election
  
  OPTIONAL {{ ?election wdt:P585 ?date . }}
  OPTIONAL {{ ?election wdt:P17 ?country . }}
  OPTIONAL {{ ?election wdt:P1410 ?seats . }}
  OPTIONAL {{ ?election schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "referendums": """
SELECT DISTINCT ?election ?electionLabel ?date ?countryLabel ?topicLabel ?resultLabel ?description
WHERE {{
  ?election wdt:P31 wd:Q43109 .  # referendum
  
  OPTIONAL {{ ?election wdt:P585 ?date . }}
  OPTIONAL {{ ?election wdt:P17 ?country . }}
  OPTIONAL {{ ?election wdt:P921 ?topic . }}
  OPTIONAL {{ ?election schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
"""
}

PARTY_QUERIES = {
    "all_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate 
       ?ideologyLabel ?positionLabel ?colorsLabel ?description
WHERE {{
  ?party wdt:P31 wd:Q7278 .  # political party
  
  OPTIONAL {{ ?party wdt:P17 ?country . }}
  OPTIONAL {{ ?party wdt:P571 ?foundedDate . }}
  OPTIONAL {{ ?party wdt:P576 ?dissolvedDate . }}
  OPTIONAL {{ ?party wdt:P1142 ?ideology . }}
  OPTIONAL {{ ?party wdt:P1387 ?position . }}
  OPTIONAL {{ ?party wdt:P462 ?colors . }}
  OPTIONAL {{ ?party schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",

    "communist_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate ?description
WHERE {{
  ?party wdt:P31 wd:Q7278 .
  ?party wdt:P1142 wd:Q6186 .  # communist ideology
  
  OPTIONAL {{ ?party wdt:P17 ?country . }}
  OPTIONAL {{ ?party wdt:P571 ?foundedDate . }}
  OPTIONAL {{ ?party wdt:P576 ?dissolvedDate . }}
  OPTIONAL {{ ?party schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
""",

    "socialist_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate ?description
WHERE {{
  ?party wdt:P31 wd:Q7278 .
  ?party wdt:P1142 wd:Q7272 .  # socialist ideology
  
  OPTIONAL {{ ?party wdt:P17 ?country . }}
  OPTIONAL {{ ?party wdt:P571 ?foundedDate . }}
  OPTIONAL {{ ?party wdt:P576 ?dissolvedDate . }}
  OPTIONAL {{ ?party schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "labor_parties": """
SELECT DISTINCT ?party ?partyLabel ?countryLabel ?foundedDate ?dissolvedDate ?description
WHERE {{
  ?party wdt:P31 wd:Q7278 .
  {{ ?party wdt:P1142 wd:Q847743 . }}  # social democracy
  UNION
  {{ ?party wdt:P1142 wd:Q431826 . }}  # labourism
  
  OPTIONAL {{ ?party wdt:P17 ?country . }}
  OPTIONAL {{ ?party wdt:P571 ?foundedDate . }}
  OPTIONAL {{ ?party wdt:P576 ?dissolvedDate . }}
  OPTIONAL {{ ?party schema:description ?description . FILTER(LANG(?description) = "en") }}
  
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


def process_elections(results, category):
    if not results or "results" not in results:
        return []
    
    elections = []
    for binding in results["results"]["bindings"]:
        uri = extract_value(binding, "election")
        if not uri:
            continue
        
        wikidata_id = uri.split("/")[-1]
        
        election = {
            "wikidata_id": wikidata_id,
            "name": extract_value(binding, "electionLabel") or "",
            "date": extract_value(binding, "date"),
            "country": extract_value(binding, "countryLabel"),
            "election_type": extract_value(binding, "typeLabel") or category,
            "winner": extract_value(binding, "winnerLabel"),
            "turnout": extract_value(binding, "turnout"),
            "seats": extract_value(binding, "seatsLabel"),
            "description": extract_value(binding, "description"),
            "category": category,
        }
        
        if election["name"] and not election["name"].startswith("Q"):
            elections.append(election)
    
    return elections


def process_parties(results, category):
    if not results or "results" not in results:
        return []
    
    parties = []
    for binding in results["results"]["bindings"]:
        uri = extract_value(binding, "party")
        if not uri:
            continue
        
        wikidata_id = uri.split("/")[-1]
        
        party = {
            "wikidata_id": wikidata_id,
            "name": extract_value(binding, "partyLabel") or "",
            "country": extract_value(binding, "countryLabel"),
            "founded": extract_value(binding, "foundedDate"),
            "dissolved": extract_value(binding, "dissolvedDate"),
            "ideology": extract_value(binding, "ideologyLabel"),
            "position": extract_value(binding, "positionLabel"),
            "colors": extract_value(binding, "colorsLabel"),
            "description": extract_value(binding, "description"),
            "category": category,
        }
        
        if party["name"] and not party["name"].startswith("Q"):
            parties.append(party)
    
    return parties


def main():
    print("="*60)
    print("COMPREHENSIVE ELECTIONS & PARTIES SCRAPER")
    print("Target: 100,000+ elections, 50,000+ parties")
    print("="*60)
    
    all_elections = {}
    all_parties = {}
    stats = {"elections": {}, "parties": {}}
    
    # Scrape elections
    print("
Scraping elections...")
    for category, query in ELECTION_QUERIES.items():
        print(f"  {category}...", end=" ", flush=True)
        results = run_sparql_query(query, category)
        
        if results:
            elections = process_elections(results, category)
            for e in elections:
                wid = e["wikidata_id"]
                if wid not in all_elections:
                    all_elections[wid] = e
            
            stats["elections"][category] = len(elections)
            print(f"{len(elections)} found")
        else:
            print("failed")
        
        time.sleep(3)
    
    # Scrape parties
    print("
Scraping political parties...")
    for category, query in PARTY_QUERIES.items():
        print(f"  {category}...", end=" ", flush=True)
        results = run_sparql_query(query, category)
        
        if results:
            parties = process_parties(results, category)
            for p in parties:
                wid = p["wikidata_id"]
                if wid not in all_parties:
                    all_parties[wid] = p
                else:
                    # Merge ideology info
                    if p.get("ideology") and not all_parties[wid].get("ideology"):
                        all_parties[wid]["ideology"] = p["ideology"]
            
            stats["parties"][category] = len(parties)
            print(f"{len(parties)} found")
        else:
            print("failed")
        
        time.sleep(3)
    
    # Save results
    elections_file = OUTPUT_DIR / "all_elections.json"
    with open(elections_file, "w", encoding="utf-8") as f:
        json.dump(list(all_elections.values()), f, ensure_ascii=False, indent=2)
    
    parties_file = OUTPUT_DIR / "all_parties.json"
    with open(parties_file, "w", encoding="utf-8") as f:
        json.dump(list(all_parties.values()), f, ensure_ascii=False, indent=2)
    
    stats_file = OUTPUT_DIR / "scrape_stats.json"
    with open(stats_file, "w") as f:
        json.dump({
            "total_elections": len(all_elections),
            "total_parties": len(all_parties),
            "categories": stats,
            "scraped_at": datetime.now().isoformat()
        }, f, indent=2)
    
    print("
" + "="*60)
    print(f"COMPLETE: {len(all_elections)} elections, {len(all_parties)} parties")
    print(f"Elections: {elections_file}")
    print(f"Parties: {parties_file}")
    print("="*60)


if __name__ == "__main__":
    main()
