#!/usr/bin/env python3
"""Download UCDP conflict data from their API."""
import json
import requests
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "ucdp"
OUTPUT_DIR.mkdir(exist_ok=True)

UCDP_BASE = "https://ucdpapi.pcr.uu.se/api"

def download_ucdp_data():
    endpoints = {
        "conflicts": "/gedevents/24.1?pagesize=10000",  # GED events
        "armed_conflicts": "/ucdpprioconflict/24.1?pagesize=1000",  # UCDP/PRIO Armed Conflict Dataset
        "battle_deaths": "/battledeaths/24.1?pagesize=1000",  # Battle-related deaths
        "nonstate": "/nonstate/24.1?pagesize=1000",  # Non-state conflicts
        "onesided": "/onesided/24.1?pagesize=1000",  # One-sided violence
    }
    
    for name, endpoint in endpoints.items():
        print(f"Downloading {name}...")
        all_data = []
        page = 1
        
        while True:
            url = f"{UCDP_BASE}{endpoint}&page={page}"
            try:
                response = requests.get(url, timeout=60)
                response.raise_for_status()
                data = response.json()
                
                if "Result" in data:
                    results = data["Result"]
                    if not results:
                        break
                    all_data.extend(results)
                    print(f"  Page {page}: {len(results)} records (total: {len(all_data)})")
                    
                    if len(results) < 10000:
                        break
                    page += 1
                else:
                    break
                    
            except Exception as e:
                print(f"  Error: {e}")
                break
        
        if all_data:
            output_file = OUTPUT_DIR / f"{name}.json"
            with open(output_file, "w") as f:
                json.dump(all_data, f, indent=2)
            print(f"  Saved {len(all_data)} records to {output_file}")

if __name__ == "__main__":
    download_ucdp_data()
