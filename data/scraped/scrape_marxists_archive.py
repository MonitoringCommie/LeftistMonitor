#!/usr/bin/env python3
"""Scrape the Marxists Internet Archive for texts and authors."""
import json
import re
import time
import requests
from bs4 import BeautifulSoup
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent / "marxists_archive"
OUTPUT_DIR.mkdir(exist_ok=True)

MIA_BASE = "https://www.marxists.org"

def get_soup(url):
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return BeautifulSoup(response.text, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def scrape_author_index():
    """Scrape the main author index."""
    print("Scraping author index...")
    authors = []
    
    # Main archive index
    soup = get_soup(f"{MIA_BASE}/archive/index.htm")
    if not soup:
        return authors
    
    # Find all author links
    for link in soup.find_all('a', href=True):
        href = link.get('href', '')
        text = link.get_text(strip=True)
        
        if '/archive/' in href and text and len(text) > 2:
            # Clean up the URL
            if href.startswith('/'):
                full_url = MIA_BASE + href
            elif href.startswith('http'):
                full_url = href
            else:
                full_url = f"{MIA_BASE}/archive/{href}"
            
            authors.append({
                "name": text,
                "url": full_url,
            })
    
    print(f"Found {len(authors)} potential authors")
    return authors

def scrape_author_works(author_url, author_name):
    """Scrape works from an author's page."""
    works = []
    soup = get_soup(author_url)
    if not soup:
        return works
    
    # Look for links to works
    for link in soup.find_all('a', href=True):
        href = link.get('href', '')
        text = link.get_text(strip=True)
        
        # Filter for likely work links
        if text and len(text) > 5 and not text.startswith('['):
            # Try to extract year from text or nearby content
            year_match = re.search(r'\b(1[789]\d{2}|20[0-2]\d)\b', text)
            year = year_match.group(1) if year_match else None
            
            works.append({
                "title": text[:200],
                "url": href if href.startswith('http') else f"{author_url.rsplit('/', 1)[0]}/{href}",
                "year": year,
                "author": author_name,
            })
    
    return works[:50]  # Limit per author

def scrape_subject_index():
    """Scrape the subject index for categorized texts."""
    print("Scraping subject index...")
    subjects = {}
    
    soup = get_soup(f"{MIA_BASE}/subject/index.htm")
    if not soup:
        return subjects
    
    for link in soup.find_all('a', href=True):
        href = link.get('href', '')
        text = link.get_text(strip=True)
        
        if '/subject/' in href and text:
            subjects[text] = MIA_BASE + href if href.startswith('/') else href
    
    print(f"Found {len(subjects)} subjects")
    return subjects

def main():
    all_data = {
        "authors": [],
        "works": [],
        "subjects": [],
    }
    
    # Scrape author index
    authors = scrape_author_index()
    all_data["authors"] = authors
    
    # Save authors
    with open(OUTPUT_DIR / "authors.json", "w") as f:
        json.dump(authors, f, indent=2)
    
    # Scrape some major authors' works
    major_authors = [
        ("Marx", f"{MIA_BASE}/archive/marx/works/index.htm"),
        ("Engels", f"{MIA_BASE}/archive/marx/works/index.htm"),
        ("Lenin", f"{MIA_BASE}/archive/lenin/works/index.htm"),
        ("Trotsky", f"{MIA_BASE}/archive/trotsky/works/index.htm"),
        ("Luxemburg", f"{MIA_BASE}/archive/luxemburg/index.htm"),
        ("Gramsci", f"{MIA_BASE}/archive/gramsci/index.htm"),
        ("Mao", f"{MIA_BASE}/reference/archive/mao/index.htm"),
        ("Ho Chi Minh", f"{MIA_BASE}/reference/archive/ho-chi-minh/index.htm"),
        ("Che Guevara", f"{MIA_BASE}/archive/guevara/index.htm"),
        ("Fanon", f"{MIA_BASE}/subject/africa/fanon/index.htm"),
    ]
    
    for author_name, author_url in major_authors:
        print(f"Scraping works by {author_name}...")
        works = scrape_author_works(author_url, author_name)
        all_data["works"].extend(works)
        print(f"  Found {len(works)} works")
        time.sleep(1)
    
    # Scrape subject index
    subjects = scrape_subject_index()
    all_data["subjects"] = [{"name": k, "url": v} for k, v in subjects.items()]
    
    # Save all data
    with open(OUTPUT_DIR / "all_mia_data.json", "w") as f:
        json.dump(all_data, f, indent=2)
    
    with open(OUTPUT_DIR / "works.json", "w") as f:
        json.dump(all_data["works"], f, indent=2)
    
    print(f"\nTotal authors: {len(all_data['authors'])}")
    print(f"Total works: {len(all_data['works'])}")
    print(f"Total subjects: {len(all_data['subjects'])}")

if __name__ == "__main__":
    main()
