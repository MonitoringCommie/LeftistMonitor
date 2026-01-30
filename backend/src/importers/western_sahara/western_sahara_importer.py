"""
Western Sahara Occupation Data Importer

Western Sahara is a Non-Self-Governing Territory under illegal Moroccan occupation since 1975.
The International Court of Justice ruled in 1975 that there are no ties of sovereignty between
Morocco and Western Sahara, and that the Sahrawi people have the right to self-determination.

Data sources:
- MINURSO reports
- Human Rights Watch
- Amnesty International  
- Western Sahara Resource Watch
- Polisario Front documentation
"""
import asyncio
import json
from pathlib import Path
from uuid import uuid4
from sqlalchemy import text
from ...database import async_session_maker


def load_western_sahara_data():
    """Load Western Sahara data from JSON file."""
    json_path = Path(__file__).parent / "western_sahara_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class WesternSaharaImporter:
    """
    Importer for Western Sahara occupation infrastructure data.
    Documents the Moroccan occupation including:
    - The Sand Berm (2,700km separation wall)
    - Military installations
    - Sahrawi refugee camps
    - Settler population transfer
    - Illegal resource extraction
    - Key historical events
    """
    
    async def run(self):
        data = load_western_sahara_data()
        
        async with async_session_maker() as session:
            results = {}
            
            # Import events as historical events
            events_imported = 0
            for event in data.get("events", []):
                try:
                    existing = await session.execute(
                        text("SELECT id FROM events WHERE name = :name AND event_type = :type"),
                        {"name": event["name"], "type": "western_sahara"}
                    )
                    if existing.first():
                        continue
                    
                    await session.execute(
                        text("""
                            INSERT INTO events (id, name, date, description, event_type, significance, created_at)
                            VALUES (:id, :name, :date, :description, :event_type, :significance, NOW())
                        """),
                        {
                            "id": str(uuid4()),
                            "name": event["name"],
                            "date": event["date"],
                            "description": event["description"],
                            "event_type": "western_sahara",
                            "significance": event.get("significance"),
                        }
                    )
                    events_imported += 1
                except Exception as e:
                    print(f"Error importing event {event.get('name')}: {e}")
            
            results["events"] = events_imported
            
            await session.commit()
            print(f"Western Sahara import complete:")
            print(f"  Events: {events_imported}")
            print(f"  (Berm, bases, camps, resources stored in JSON for map display)")
            
            return results


async def main():
    importer = WesternSaharaImporter()
    result = await importer.run()
    print(f"Import complete: {result}")


if __name__ == "__main__":
    asyncio.run(main())
