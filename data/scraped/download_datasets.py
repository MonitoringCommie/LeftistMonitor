#!/usr/bin/env python3
"""Download large public datasets."""
import requests
import zipfile
import io
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent

def download_file(url, output_path):
    print(f"Downloading {url}...")
    try:
        response = requests.get(url, timeout=300, stream=True)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        print(f"  Saved to {output_path}")
        return True
    except Exception as e:
        print(f"  Error: {e}")
        return False

def download_and_extract_zip(url, output_dir):
    print(f"Downloading and extracting {url}...")
    try:
        response = requests.get(url, timeout=300)
        response.raise_for_status()
        
        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            z.extractall(output_dir)
        print(f"  Extracted to {output_dir}")
        return True
    except Exception as e:
        print(f"  Error: {e}")
        return False

def main():
    # ParlGov database (elections and parties)
    parlgov_dir = OUTPUT_DIR / "parlgov"
    parlgov_dir.mkdir(exist_ok=True)
    
    # ParlGov CSVs
    parlgov_files = [
        "https://www.parlgov.org/data/parlgov-development_csv-utf-8/view_cabinet.csv",
        "https://www.parlgov.org/data/parlgov-development_csv-utf-8/view_election.csv",
        "https://www.parlgov.org/data/parlgov-development_csv-utf-8/view_party.csv",
        "https://www.parlgov.org/data/parlgov-development_csv-utf-8/country.csv",
    ]
    
    for url in parlgov_files:
        filename = url.split("/")[-1]
        download_file(url, parlgov_dir / filename)
    
    # Correlates of War datasets
    cow_dir = OUTPUT_DIR / "correlates_of_war"
    cow_dir.mkdir(exist_ok=True)
    
    cow_datasets = [
        # Interstate wars
        ("https://correlatesofwar.org/wp-content/uploads/Inter-StateWarData_v4.0.csv", "interstate_wars.csv"),
        # Intrastate wars
        ("https://correlatesofwar.org/wp-content/uploads/Intra-StateWarData_v4.1.csv", "intrastate_wars.csv"),
        # Extra-state wars
        ("https://correlatesofwar.org/wp-content/uploads/Extra-StateWarData_v4.0.csv", "extrastate_wars.csv"),
        # National Material Capabilities
        ("https://correlatesofwar.org/wp-content/uploads/NMC-60-abridged.csv", "national_capabilities.csv"),
    ]
    
    for url, filename in cow_datasets:
        download_file(url, cow_dir / filename)
    
    # ACLED (sample - full requires API key)
    # Leaving placeholder for manual download
    
    print("\nDataset downloads complete!")
    print("\nNote: Some datasets require manual download or API keys:")
    print("- Manifesto Project: https://manifesto-project.wzb.eu/datasets")
    print("- ACLED: https://acleddata.com/data-export-tool/")
    print("- V-Dem: https://v-dem.net/data/the-v-dem-dataset/")

if __name__ == "__main__":
    main()
