#!/usr/bin/env python3
"""
Scrape books from Open Library API.
Focuses on political, historical, and social science books.
"""
import json
import time
import os
import requests
from datetime import datetime

# Output directory
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Subjects to search
SUBJECTS = [
    # Political
    "socialism", "communism", "marxism", "anarchism", "capitalism",
    "democracy", "fascism", "imperialism", "colonialism", "revolution",
    "labor movement", "trade unions", "workers rights",
    "civil rights", "human rights", "social justice",
    "political philosophy", "political theory", "political economy",
    
    # Historical
    "world war", "cold war", "russian revolution", "french revolution",
    "american revolution", "chinese revolution", "cuban revolution",
    "decolonization", "independence movements", "liberation movements",
    "slavery", "abolition", "apartheid",
    
    # Regional
    "palestine", "israel", "middle east conflict",
    "ireland history", "irish independence", "troubles northern ireland",
    "latin america politics", "africa colonialism", "asia imperialism",
    
    # Social movements
    "feminism", "womens suffrage", "civil rights movement",
    "black power", "pan africanism", "anti war movement",
    "environmental movement", "lgbtq rights",
    
    # Economic
    "wealth inequality", "class struggle", "poverty",
    "globalization", "neoliberalism", "welfare state",
]

def search_open_library(subject, limit=100, offset=0):
    """Search Open Library for books on a subject."""
    url = "https://openlibrary.org/search.json"
    params = {
        "subject": subject,
        "limit": limit,
        "offset": offset,
        "fields": "key,title,author_name,first_publish_year,subject,language,publisher,isbn,number_of_pages_median,edition_count"
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  Error searching '{subject}': {e}")
        return None

def process_book(doc, subject_query):
    """Process a book document into our format."""
    return {
        "open_library_key": doc.get("key", ""),
        "title": doc.get("title", ""),
        "authors": doc.get("author_name", []),
        "first_publish_year": doc.get("first_publish_year"),
        "subjects": doc.get("subject", [])[:20],  # Limit subjects
        "languages": doc.get("language", []),
        "publishers": doc.get("publisher", [])[:5],
        "isbn": doc.get("isbn", [])[:3] if doc.get("isbn") else [],
        "pages": doc.get("number_of_pages_median"),
        "edition_count": doc.get("edition_count", 1),
        "source_subject": subject_query,
        "source": "open_library"
    }

def scrape_all_subjects():
    """Scrape books for all subjects."""
    all_books = {}
    total_found = 0
    
    for i, subject in enumerate(SUBJECTS):
        print(f"[{i+1}/{len(SUBJECTS)}] Searching: {subject}")
        
        offset = 0
        subject_count = 0
        max_per_subject = 500  # Limit per subject to avoid huge files
        
        while offset < max_per_subject:
            result = search_open_library(subject, limit=100, offset=offset)
            
            if not result or "docs" not in result:
                break
            
            docs = result.get("docs", [])
            if not docs:
                break
            
            for doc in docs:
                key = doc.get("key", "")
                if key and key not in all_books:
                    all_books[key] = process_book(doc, subject)
                    subject_count += 1
                    total_found += 1
            
            print(f"  Found {len(docs)} books (offset {offset}), total unique: {len(all_books)}")
            
            offset += 100
            time.sleep(0.5)  # Rate limiting
            
            # Check if we got all results
            if len(docs) < 100:
                break
        
        print(f"  Subject '{subject}' complete: {subject_count} new books")
        
        # Save periodically
        if (i + 1) % 10 == 0:
            save_checkpoint(all_books, i + 1)
    
    return list(all_books.values())

def save_checkpoint(books_dict, checkpoint_num):
    """Save a checkpoint of scraped data."""
    filepath = os.path.join(OUTPUT_DIR, f"open_library_checkpoint_{checkpoint_num}.json")
    with open(filepath, 'w') as f:
        json.dump(list(books_dict.values()), f, indent=2)
    print(f"  Checkpoint saved: {len(books_dict)} books")

def main():
    print("=" * 60)
    print("Open Library Book Scraper")
    print(f"Searching {len(SUBJECTS)} subjects")
    print("=" * 60)
    
    start_time = datetime.now()
    
    books = scrape_all_subjects()
    
    # Save final output
    output_file = os.path.join(OUTPUT_DIR, "open_library_books.json")
    with open(output_file, 'w') as f:
        json.dump(books, f, indent=2)
    
    # Save stats
    stats = {
        "total_books": len(books),
        "subjects_searched": len(SUBJECTS),
        "scraped_at": datetime.now().isoformat(),
        "duration_seconds": (datetime.now() - start_time).total_seconds()
    }
    
    stats_file = os.path.join(OUTPUT_DIR, "open_library_stats.json")
    with open(stats_file, 'w') as f:
        json.dump(stats, f, indent=2)
    
    print("=" * 60)
    print(f"Complete! Scraped {len(books)} unique books")
    print(f"Output: {output_file}")
    print(f"Duration: {stats['duration_seconds']:.1f} seconds")
    print("=" * 60)

if __name__ == "__main__":
    main()
