#!/usr/bin/env python3
"""Script to import CShapes data."""
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from src.database import async_session_maker
from src.importers.cshapes import import_cshapes


async def main(file_path: str):
    """Run the CShapes import."""
    print(f"Importing CShapes data from: {file_path}")
    
    async with async_session_maker() as session:
        stats = await import_cshapes(session, file_path)
        print(f"Import complete!")
        print(f"  Created: {stats['created']}")
        print(f"  Updated: {stats['updated']}")
        print(f"  Skipped: {stats['skipped']}")
        print(f"  Errors: {stats['errors']}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_cshapes.py <path-to-cshapes-file>")
        print("       Supports .geojson, .shp, or .zip files")
        sys.exit(1)
    
    asyncio.run(main(sys.argv[1]))
