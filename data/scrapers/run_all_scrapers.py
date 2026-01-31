#!/usr/bin/env python3
"""
Master script to run all Wikidata scrapers in sequence.

Runs scrapers for: books, politicians, elections, parties, conflicts
"""

import sys
import time
import logging
import subprocess
from pathlib import Path
from datetime import datetime

# Configuration
SCRAPERS_DIR = Path("/Users/linusgollnow/LeftistMonitor/data/scrapers")
LOG_FILE = SCRAPERS_DIR / "run_all.log"

# List of scrapers to run in order
SCRAPERS = [
    "scrape_wikidata_books.py",
    "scrape_wikidata_politicians.py",
    "scrape_wikidata_elections.py",
    "scrape_wikidata_parties.py",
    "scrape_wikidata_conflicts.py",
]


def setup_logging():
    """Setup logging configuration."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(LOG_FILE)
        ]
    )
    return logging.getLogger(__name__)


def run_scraper(scraper_name, logger):
    """Run a single scraper and return success status."""
    scraper_path = SCRAPERS_DIR / scraper_name
    
    if not scraper_path.exists():
        logger.error(f"Scraper not found: {scraper_path}")
        return False
    
    logger.info(f"Starting scraper: {scraper_name}")
    start_time = time.time()
    
    try:
        result = subprocess.run(
            [sys.executable, str(scraper_path)],
            capture_output=True,
            text=True,
            cwd=str(SCRAPERS_DIR)
        )
        
        elapsed = time.time() - start_time
        
        if result.returncode == 0:
            logger.info(f"Completed {scraper_name} in {elapsed:.1f} seconds")
            return True
        else:
            logger.error(f"Failed {scraper_name} with return code {result.returncode}")
            logger.error(f"STDOUT: {result.stdout[-2000:] if result.stdout else 'None'}")
            logger.error(f"STDERR: {result.stderr[-2000:] if result.stderr else 'None'}")
            return False
            
    except Exception as e:
        logger.error(f"Exception running {scraper_name}: {e}")
        return False


def main():
    """Run all scrapers in sequence."""
    logger = setup_logging()
    
    logger.info("="*60)
    logger.info("Starting LeftistMonitor Wikidata Scrapers")
    logger.info(f"Start time: {datetime.now().isoformat()}")
    logger.info("="*60)
    
    results = {}
    total_start = time.time()
    
    for scraper in SCRAPERS:
        logger.info("-"*40)
        success = run_scraper(scraper, logger)
        results[scraper] = success
        
        if not success:
            logger.warning(f"Scraper {scraper} failed, continuing with next...")
        
        # Small delay between scrapers
        time.sleep(2)
    
    total_elapsed = time.time() - total_start
    
    # Summary
    logger.info("="*60)
    logger.info("SCRAPING COMPLETE - SUMMARY")
    logger.info("="*60)
    
    successful = sum(1 for v in results.values() if v)
    failed = sum(1 for v in results.values() if not v)
    
    for scraper, success in results.items():
        status = "SUCCESS" if success else "FAILED"
        logger.info(f"  {scraper}: {status}")
    
    logger.info("-"*40)
    logger.info(f"Total: {successful} succeeded, {failed} failed")
    logger.info(f"Total time: {total_elapsed/60:.1f} minutes")
    logger.info(f"End time: {datetime.now().isoformat()}")
    
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
