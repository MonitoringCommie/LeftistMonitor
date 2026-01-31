#!/usr/bin/env python3
"""
Comprehensive Politicians & People Scraper
Target: 1,000,000+ people from Wikidata

Scrapes:
- All politicians from every country (past and present)
- Heads of state/government throughout history
- Political activists, revolutionaries, theorists
- Authors of political/historical works
"""
import json
import time
import requests
import os
from pathlib import Path
from datetime import datetime

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
OUTPUT_DIR = Path(__file__).parent
OUTPUT_DIR.mkdir(exist_ok=True)

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "LeftistMonitor/1.0 (historical research; contact@example.com)"
}

# All countries ISO codes for systematic scraping
COUNTRY_CODES = {
    "Q30": "United States", "Q145": "United Kingdom", "Q142": "France", 
    "Q183": "Germany", "Q159": "Russia", "Q148": "China", "Q668": "India",
    "Q17": "Japan", "Q155": "Brazil", "Q96": "Mexico", "Q414": "Argentina",
    "Q298": "Chile", "Q739": "Colombia", "Q419": "Peru", "Q717": "Venezuela",
    "Q241": "Cuba", "Q786": "Dominican Republic", "Q774": "Guatemala",
    "Q38": "Italy", "Q29": "Spain", "Q36": "Poland", "Q28": "Hungary",
    "Q213": "Czech Republic", "Q214": "Slovakia", "Q218": "Romania",
    "Q219": "Bulgaria", "Q41": "Greece", "Q215": "Slovenia", "Q224": "Croatia",
    "Q225": "Bosnia", "Q229": "Serbia", "Q221": "North Macedonia",
    "Q227": "Azerbaijan", "Q399": "Armenia", "Q230": "Georgia",
    "Q212": "Ukraine", "Q184": "Belarus", "Q211": "Latvia", "Q37": "Lithuania",
    "Q191": "Estonia", "Q36": "Poland", "Q35": "Denmark", "Q20": "Norway",
    "Q34": "Sweden", "Q33": "Finland", "Q189": "Iceland",
    "Q55": "Netherlands", "Q31": "Belgium", "Q32": "Luxembourg",
    "Q39": "Switzerland", "Q40": "Austria", "Q27": "Ireland",
    "Q43": "Turkey", "Q794": "Iran", "Q796": "Iraq", "Q801": "Israel",
    "Q79": "Egypt", "Q262": "Algeria", "Q1028": "Morocco", "Q948": "Tunisia",
    "Q1016": "Libya", "Q1049": "Sudan", "Q115": "Ethiopia", "Q114": "Kenya",
    "Q1033": "Nigeria", "Q258": "South Africa", "Q954": "Zimbabwe",
    "Q916": "Angola", "Q1029": "Mozambique", "Q974": "DR Congo",
    "Q1008": "Ivory Coast", "Q1005": "Gambia", "Q1006": "Guinea",
    "Q1009": "Cameroon", "Q657": "Chad", "Q929": "Central African Republic",
    "Q912": "Mali", "Q1007": "Niger", "Q965": "Burkina Faso",
    "Q1000": "Gabon", "Q971": "Republic of Congo", "Q967": "Burundi",
    "Q1036": "Uganda", "Q114": "Kenya", "Q924": "Tanzania", "Q1037": "Rwanda",
    "Q843": "Pakistan", "Q902": "Bangladesh", "Q837": "Nepal",
    "Q854": "Sri Lanka", "Q836": "Myanmar", "Q869": "Thailand",
    "Q881": "Vietnam", "Q334": "Singapore", "Q833": "Malaysia",
    "Q252": "Indonesia", "Q928": "Philippines", "Q884": "South Korea",
    "Q423": "North Korea", "Q865": "Taiwan", "Q424": "Cambodia",
    "Q819": "Laos", "Q574": "East Timor", "Q889": "Afghanistan",
    "Q851": "Saudi Arabia", "Q878": "UAE", "Q842": "Oman",
    "Q817": "Kuwait", "Q398": "Bahrain", "Q846": "Qatar",
    "Q805": "Yemen", "Q810": "Jordan", "Q822": "Lebanon", "Q858": "Syria",
    "Q219060": "Palestine", "Q664": "New Zealand", "Q408": "Australia",
    "Q16": "Canada", "Q733": "Paraguay", "Q77": "Uruguay", "Q750": "Bolivia",
    "Q736": "Ecuador", "Q717": "Venezuela", "Q734": "Guyana",
    "Q730": "Suriname", "Q783": "Honduras", "Q792": "El Salvador",
    "Q800": "Costa Rica", "Q804": "Panama", "Q811": "Nicaragua",
    "Q298": "Chile", "Q45": "Portugal", "Q408": "Australia",
}

# Query templates for different categories
QUERY_TEMPLATES = {
    "politicians_by_country": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel 
       ?deathPlaceLabel ?positionLabel ?partyLabel ?genderLabel ?description
WHERE {{
  ?person wdt:P27 wd:{country_id} .
  ?person wdt:P106 ?occupation .
  ?occupation wdt:P279* wd:Q82955 .  # politician
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P19 ?birthPlace . }}
  OPTIONAL {{ ?person wdt:P20 ?deathPlace . }}
  OPTIONAL {{ ?person wdt:P39 ?position . }}
  OPTIONAL {{ ?person wdt:P102 ?party . }}
  OPTIONAL {{ ?person wdt:P21 ?gender . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
""",
    
    "heads_of_state": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel 
       ?positionLabel ?startDate ?endDate ?partyLabel ?description
WHERE {{
  {{ ?person wdt:P39 wd:Q48352 . }}  # head of state
  UNION
  {{ ?person wdt:P39 wd:Q2285706 . }}  # head of government
  UNION
  {{ ?person wdt:P39/wdt:P279* wd:Q48352 . }}  # subclass of head of state
  UNION
  {{ ?person wdt:P39/wdt:P279* wd:Q2285706 . }}
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person wdt:P39 ?position . }}
  OPTIONAL {{ ?person wdt:P102 ?party . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 50000
""",
    
    "revolutionaries": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel 
       ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q3242115 .  # revolutionary
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P19 ?birthPlace . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "political_theorists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel 
       ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q14467526 .  # political theorist
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P19 ?birthPlace . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "independence_activists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel 
       ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q1734662 .  # independence activist
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P19 ?birthPlace . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
""",

    "labor_leaders": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel 
       ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q15627169 .  # trade union leader
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P19 ?birthPlace . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "communists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?partyLabel ?description
WHERE {{
  ?person wdt:P102 ?party .
  ?party wdt:P1142 wd:Q6186 .  # communist ideology
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "socialists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?partyLabel ?description
WHERE {{
  ?person wdt:P102 ?party .
  ?party wdt:P1142 wd:Q7272 .  # socialist ideology
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 30000
""",

    "anarchists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {{
  {{ ?person wdt:P106 wd:Q15253558 . }}  # anarchist
  UNION
  {{ ?person wdt:P135 wd:Q6199 . }}  # movement: anarchism
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 10000
""",

    "resistance_fighters": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q1397808 .  # resistance fighter
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "civil_rights_activists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q15253558 .  # human rights activist
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "feminist_activists": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {{
  {{ ?person wdt:P106 wd:Q10843402 . }}  # women rights activist
  UNION
  {{ ?person wdt:P135 wd:Q7252 . }}  # feminism movement
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 15000
""",

    "political_authors": """
SELECT DISTINCT ?person ?personLabel ?birthDate ?deathDate ?countryLabel ?description
WHERE {{
  ?person wdt:P106 wd:Q36180 .  # writer
  ?person wdt:P101 ?field .
  {{ ?field wdt:P279* wd:Q7163 . }}  # politics
  UNION
  {{ ?field wdt:P279* wd:Q8434 . }}  # economics
  UNION
  {{ ?field wdt:P279* wd:Q21201 . }}  # sociology
  
  OPTIONAL {{ ?person wdt:P569 ?birthDate . }}
  OPTIONAL {{ ?person wdt:P570 ?deathDate . }}
  OPTIONAL {{ ?person wdt:P27 ?country . }}
  OPTIONAL {{ ?person schema:description ?description . FILTER(LANG(?description) = "en") }}
  
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
LIMIT 20000
"""
}


def run_sparql_query(query, category):
    """Execute SPARQL query with retries."""
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
    """Safely extract value from SPARQL binding."""
    if key in binding and "value" in binding[key]:
        return binding[key]["value"]
    return None


def process_results(results, category):
    """Transform SPARQL results to standardized format."""
    if not results or "results" not in results:
        return []
    
    people = []
    for binding in results["results"]["bindings"]:
        person_uri = extract_value(binding, "person")
        if not person_uri:
            continue
        
        wikidata_id = person_uri.split("/")[-1]
        
        person = {
            "wikidata_id": wikidata_id,
            "name": extract_value(binding, "personLabel") or "",
            "birth_date": extract_value(binding, "birthDate"),
            "death_date": extract_value(binding, "deathDate"),
            "birth_place": extract_value(binding, "birthPlaceLabel"),
            "death_place": extract_value(binding, "deathPlaceLabel"),
            "country": extract_value(binding, "countryLabel"),
            "position": extract_value(binding, "positionLabel"),
            "party": extract_value(binding, "partyLabel"),
            "gender": extract_value(binding, "genderLabel"),
            "description": extract_value(binding, "description"),
            "category": category,
        }
        
        # Filter out entities without proper names
        if person["name"] and not person["name"].startswith("Q"):
            people.append(person)
    
    return people


def main():
    print("="*60)
    print("COMPREHENSIVE POLITICIANS & PEOPLE SCRAPER")
    print("Target: 1,000,000+ people from Wikidata")
    print("="*60)
    
    all_people = {}
    stats = {}
    
    # 1. First scrape general categories (not by country)
    general_categories = [
        "heads_of_state", "revolutionaries", "political_theorists",
        "independence_activists", "labor_leaders", "communists",
        "socialists", "anarchists", "resistance_fighters",
        "civil_rights_activists", "feminist_activists", "political_authors"
    ]
    
    for category in general_categories:
        print(f"
Scraping {category}...")
        query = QUERY_TEMPLATES[category]
        results = run_sparql_query(query, category)
        
        if results:
            people = process_results(results, category)
            stats[category] = len(people)
            print(f"  Found {len(people)} {category}")
            
            for person in people:
                wid = person["wikidata_id"]
                if wid not in all_people:
                    all_people[wid] = person
                    all_people[wid]["categories"] = [category]
                else:
                    if category not in all_people[wid].get("categories", []):
                        all_people[wid].setdefault("categories", []).append(category)
        
        time.sleep(3)  # Rate limiting
    
    # 2. Then scrape politicians by country (sample of major countries for now)
    major_countries = [
        ("Q30", "United States"), ("Q145", "United Kingdom"), 
        ("Q142", "France"), ("Q183", "Germany"), ("Q159", "Russia"),
        ("Q148", "China"), ("Q668", "India"), ("Q155", "Brazil"),
        ("Q38", "Italy"), ("Q29", "Spain"), ("Q17", "Japan"),
        ("Q96", "Mexico"), ("Q241", "Cuba"), ("Q414", "Argentina"),
        ("Q79", "Egypt"), ("Q1028", "Morocco"), ("Q258", "South Africa"),
        ("Q43", "Turkey"), ("Q794", "Iran"), ("Q212", "Ukraine"),
        ("Q36", "Poland"), ("Q884", "South Korea"), ("Q252", "Indonesia"),
        ("Q423", "North Korea"), ("Q881", "Vietnam"), ("Q298", "Chile"),
        ("Q27", "Ireland"), ("Q219060", "Palestine"), ("Q801", "Israel"),
    ]
    
    print(f"
Scraping politicians by country ({len(major_countries)} countries)...")
    
    for country_id, country_name in major_countries:
        print(f"  {country_name}...", end=" ", flush=True)
        
        query = QUERY_TEMPLATES["politicians_by_country"].format(country_id=country_id)
        results = run_sparql_query(query, f"politicians_{country_name}")
        
        if results:
            people = process_results(results, f"politician")
            count = 0
            for person in people:
                wid = person["wikidata_id"]
                person["country"] = country_name
                if wid not in all_people:
                    all_people[wid] = person
                    all_people[wid]["categories"] = ["politician"]
                    count += 1
                else:
                    if "politician" not in all_people[wid].get("categories", []):
                        all_people[wid].setdefault("categories", []).append("politician")
            
            print(f"{count} new")
            stats[f"politicians_{country_name}"] = count
        else:
            print("failed")
        
        time.sleep(2)
    
    # Save all results
    output_file = OUTPUT_DIR / "all_people_comprehensive.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(list(all_people.values()), f, ensure_ascii=False, indent=2)
    
    # Save stats
    stats_file = OUTPUT_DIR / "scrape_stats.json"
    with open(stats_file, "w") as f:
        json.dump({
            "total_unique_people": len(all_people),
            "categories": stats,
            "scraped_at": datetime.now().isoformat()
        }, f, indent=2)
    
    print("
" + "="*60)
    print(f"COMPLETE: {len(all_people)} unique people scraped")
    print(f"Output: {output_file}")
    print(f"Stats: {stats_file}")
    print("="*60)


if __name__ == "__main__":
    main()
