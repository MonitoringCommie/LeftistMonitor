#!/usr/bin/env python3
"""
Scraper for political prisoner data from various sources.
"""

import json
import time
from datetime import datetime
import os

try:
    import httpx
except ImportError:
    import urllib.request
    httpx = None

WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"

HEADERS = {
    "User-Agent": "LeftistMonitor/1.0 (Educational project)",
    "Accept": "application/json",
}


def query_wikidata(sparql):
    """Execute SPARQL query against Wikidata."""
    try:
        if httpx:
            response = httpx.get(
                WIKIDATA_ENDPOINT,
                params={"query": sparql, "format": "json"},
                headers=HEADERS,
                timeout=60,
            )
            response.raise_for_status()
            return response.json().get("results", {}).get("bindings", [])
        else:
            import urllib.parse
            url = f"{WIKIDATA_ENDPOINT}?query={urllib.parse.quote(sparql)}&format=json"
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read()).get("results", {}).get("bindings", [])
    except Exception as e:
        print(f"Query error: {e}")
        return []


def scrape_prisoners_of_conscience():
    """Scrape prisoners of conscience from Wikidata."""
    print("Scraping prisoners of conscience...")
    
    query = """
    SELECT DISTINCT ?person ?personLabel ?countryLabel ?birthYear
    WHERE {
      ?person wdt:P31 wd:Q5 .
      { ?person wdt:P1344 wd:Q1322295 . }
      UNION
      { ?person wdt:P106 wd:Q12773225 . }
      
      OPTIONAL { ?person wdt:P27 ?country . }
      OPTIONAL { ?person wdt:P569 ?birth . BIND(YEAR(?birth) AS ?birthYear) }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    LIMIT 1000
    """
    
    results = query_wikidata(query)
    prisoners = []
    seen = set()
    
    for r in results:
        wid = r.get("person", {}).get("value", "").split("/")[-1]
        if wid in seen:
            continue
        seen.add(wid)
        
        prisoners.append({
            "wikidata_id": wid,
            "name": r.get("personLabel", {}).get("value", "Unknown"),
            "country": r.get("countryLabel", {}).get("value"),
            "birth_year": r.get("birthYear", {}).get("value"),
            "category": "prisoner_of_conscience",
            "source": "wikidata",
        })
    
    print(f"Found {len(prisoners)} prisoners of conscience")
    return prisoners


def add_known_prisoners():
    """Add documented current political prisoners."""
    return [
        {
            "name": "Ilham Tohti",
            "country": "China",
            "birth_year": "1969",
            "detention_start": "2014",
            "charge": "Separatism",
            "sentence": "Life imprisonment",
            "status": "Currently detained",
            "category": "uyghur_scholar",
            "notes": "Uyghur economist, Sakharov Prize 2019"
        },
        {
            "name": "Narges Mohammadi",
            "country": "Iran",
            "birth_year": "1972",
            "detention_start": "2021",
            "status": "Currently detained",
            "category": "womens_rights",
            "notes": "Nobel Peace Prize 2023"
        },
        {
            "name": "Ales Bialiatski",
            "country": "Belarus",
            "birth_year": "1962",
            "detention_start": "2021",
            "status": "Currently detained",
            "category": "human_rights",
            "notes": "Nobel Peace Prize 2022"
        },
        {
            "name": "Jimmy Lai",
            "country": "Hong Kong",
            "birth_year": "1947",
            "detention_start": "2020",
            "status": "Currently detained",
            "category": "press_freedom",
            "notes": "Pro-democracy activist"
        },
    ]


def main():
    """Main scraper function."""
    print("Starting political prisoner data collection...")
    
    all_data = {
        "metadata": {
            "scraped_at": datetime.now().isoformat(),
            "sources": ["Wikidata", "Manual"],
        },
        "prisoners_of_conscience": scrape_prisoners_of_conscience(),
        "known_current_prisoners": add_known_prisoners(),
    }
    
    total = sum(len(v) for k, v in all_data.items() if k != "metadata")
    all_data["metadata"]["total_records"] = total
    
    print(f"Total records: {total}")
    
    output_dir = os.path.dirname(os.path.abspath(__file__)).replace("/scrapers", "/scraped/prisoners")
    os.makedirs(output_dir, exist_ok=True)
    
    with open(os.path.join(output_dir, "political_prisoners.json"), "w") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved to {output_dir}/political_prisoners.json")


if __name__ == "__main__":
    main()
