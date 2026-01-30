#!/usr/bin/env python3
"""Script to import leftist figures and books."""
import sys
import os

# Add the backend src to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

import asyncio
from src.database import async_session_factory
from src.people.leftist_importer import LeftistDataImporter


async def main():
    print("Starting leftist data import...")
    async with async_session_factory() as session:
        importer = LeftistDataImporter(session)
        await importer.run()


if __name__ == "__main__":
    asyncio.run(main())
