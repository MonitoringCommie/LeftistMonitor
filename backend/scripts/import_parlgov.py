#!/usr/bin/env python
"""Script to import ParlGov election and party data."""
import asyncio
import sys
from pathlib import Path

# Ensure we can import from src
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from src.database import async_session_maker
from src.importers.parlgov import ParlGovImporter


async def main():
    """Run the ParlGov import."""
    data_dir = backend_dir.parent / "data" / "parlgov"
    
    if not data_dir.exists():
        print(f"Data directory not found: {data_dir}")
        print("Please download ParlGov data to this directory.")
        return
    
    print(f"Importing ParlGov data from: {data_dir}")
    print("-" * 50)
    
    async with async_session_maker() as session:
        importer = ParlGovImporter(session, str(data_dir))
        stats = await importer.run()
        
    print("-" * 50)
    print("Import complete!")
    return stats


if __name__ == "__main__":
    asyncio.run(main())
