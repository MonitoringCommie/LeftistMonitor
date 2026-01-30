#!/usr/bin/env python3
"""Run all scrapers to collect massive amounts of data."""
import subprocess
import sys
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

SCRIPT_DIR = Path(__file__).parent

SCRAPERS = [
    "scrape_wikidata_people.py",
    "scrape_wikidata_events.py",
    "scrape_wikidata_books.py",
    "scrape_ucdp.py",
    "scrape_marxists_archive.py",
    "download_datasets.py",
]

def run_scraper(script_name):
    script_path = SCRIPT_DIR / script_name
    print(f"\n{'='*60}")
    print(f"STARTING: {script_name}")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            capture_output=False,
            timeout=3600,  # 1 hour timeout per scraper
        )
        return script_name, result.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT: {script_name}")
        return script_name, False
    except Exception as e:
        print(f"ERROR in {script_name}: {e}")
        return script_name, False

def main():
    print("="*60)
    print("LEFTIST MONITOR - MASSIVE DATA COLLECTION")
    print("="*60)
    
    results = {}
    
    # Run scrapers sequentially to avoid rate limiting
    for scraper in SCRAPERS:
        name, success = run_scraper(scraper)
        results[name] = success
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    for name, success in results.items():
        status = "SUCCESS" if success else "FAILED"
        print(f"  {name}: {status}")
    
    # Print data sizes
    print("\n" + "="*60)
    print("DATA COLLECTED")
    print("="*60)
    
    for subdir in SCRIPT_DIR.iterdir():
        if subdir.is_dir() and not subdir.name.startswith('.'):
            total_size = sum(f.stat().st_size for f in subdir.rglob('*') if f.is_file())
            file_count = sum(1 for f in subdir.rglob('*') if f.is_file())
            if file_count > 0:
                print(f"  {subdir.name}: {file_count} files, {total_size / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    main()
