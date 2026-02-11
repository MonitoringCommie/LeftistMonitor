#!/usr/bin/env python3
"""
Import script for generated data files (conflicts, events, cities, ideologies, liberation struggles).
Formats and prepares data for backend API ingestion.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid
from dataclasses import dataclass, asdict
from enum import Enum


class DataType(Enum):
    """Supported data types"""
    CONFLICTS = "conflicts"
    EVENTS = "events"
    CITIES = "cities"
    IDEOLOGIES = "ideologies"
    LIBERATION_STRUGGLES = "liberation_struggles"


@dataclass
class ConflictData:
    """Conflict data model for API"""
    id: str
    name: str
    start_date: str
    end_date: Optional[str]
    conflict_type: str
    intensity: str
    casualties_low: int
    casualties_high: int
    description: str
    cities: List[Dict[str, Any]]
    progressive_analysis: str = ""
    outcome: str = ""

    def to_dict(self):
        return asdict(self)


@dataclass
class EventData:
    """Event data model for API"""
    id: str
    title: str
    year: int
    end_year: Optional[int]
    event_type: str
    category: str
    location: str
    lat: float
    lng: float
    country: str
    description: str
    importance: int
    casualties: int = 0

    def to_dict(self):
        return asdict(self)


@dataclass
class CityData:
    """City data model for API"""
    id: str
    name: str
    country: str
    lat: float
    lng: float
    population: int
    importance: int
    tags: List[str]

    def to_dict(self):
        return asdict(self)


@dataclass
class IdeologyData:
    """Ideology data model for API"""
    id: str
    name: str
    description: str
    left_right_position: int
    key_figures: List[str]
    key_texts: List[str]
    variants: List[str] = None
    core_concepts: List[str] = None

    def to_dict(self):
        return asdict(self)


@dataclass
class LiberationStruggleData:
    """Liberation struggle data model for API"""
    id: str
    name: str
    start_year: int
    status: str
    description: str
    key_cities: List[Dict[str, Any]]
    important_sites: List[Dict[str, Any]]
    key_events: List[Dict[str, Any]]
    key_figures: List[str]
    organizations: List[str]

    def to_dict(self):
        return asdict(self)


class DataImporter:
    """Import and transform generated data for backend API"""

    def __init__(self, data_dir: Path):
        """Initialize importer with data directory"""
        self.data_dir = Path(data_dir)
        self.conflicts = []
        self.events = []
        self.cities = []
        self.ideologies = []
        self.liberation_struggles = []

    def load_conflicts(self) -> List[Dict[str, Any]]:
        """Load and transform conflicts data"""
        filepath = self.data_dir / "conflicts_with_cities.json"
        if not filepath.exists():
            print(f"Warning: {filepath} not found")
            return []

        with open(filepath, 'r') as f:
            data = json.load(f)

        formatted = []
        for conflict in data.get("conflicts", []):
            conflict_id = str(uuid.uuid4())

            # Format dates as ISO strings
            start_date = f"{conflict.get('start_year')}-01-01" if conflict.get('start_year') else None
            end_date = f"{conflict.get('end_year')}-12-31" if conflict.get('end_year') else None

            formatted_conflict = {
                "id": conflict_id,
                "name": conflict.get("name"),
                "start_date": start_date,
                "end_date": end_date,
                "conflict_type": conflict.get("type", "interstate"),
                "intensity": conflict.get("intensity", "major"),
                "casualties_low": conflict.get("casualties_low", 0),
                "casualties_high": conflict.get("casualties_high", 0),
                "description": conflict.get("description", ""),
                "progressive_analysis": "",
                "outcome": "",
                "cities": conflict.get("cities", []),
                "imported_at": datetime.now().isoformat()
            }
            formatted.append(formatted_conflict)

        self.conflicts = formatted
        return formatted

    def load_events(self) -> List[Dict[str, Any]]:
        """Load and transform events data"""
        filepath = self.data_dir / "historical_events.json"
        if not filepath.exists():
            print(f"Warning: {filepath} not found")
            return []

        with open(filepath, 'r') as f:
            data = json.load(f)

        formatted = []
        for event in data.get("events", []):
            event_id = str(uuid.uuid4())

            formatted_event = {
                "id": event_id,
                "title": event.get("name", ""),
                "start_date": f"{event.get('year')}-01-01" if event.get('year') else None,
                "end_date": f"{event.get('end_year')}-12-31" if event.get('end_year') else None,
                "category": event.get("category", "political"),
                "event_type": event.get("type", "other"),
                "location_name": event.get("location", ""),
                "location": {
                    "type": "Point",
                    "coordinates": [event.get("lng", 0), event.get("lat", 0)]
                },
                "importance": event.get("importance", 5),
                "description": event.get("description", ""),
                "progressive_analysis": "",
                "tags": [],
                "imported_at": datetime.now().isoformat()
            }
            formatted.append(formatted_event)

        self.events = formatted
        return formatted

    def load_cities(self) -> List[Dict[str, Any]]:
        """Load and transform cities data"""
        filepath = self.data_dir / "world_cities.json"
        if not filepath.exists():
            print(f"Warning: {filepath} not found")
            return []

        with open(filepath, 'r') as f:
            data = json.load(f)

        formatted = []
        for city in data.get("cities", []):
            city_id = str(uuid.uuid4())

            formatted_city = {
                "id": city_id,
                "name": city.get("name", ""),
                "country": city.get("country", ""),
                "location": {
                    "type": "Point",
                    "coordinates": [city.get("lng", 0), city.get("lat", 0)]
                },
                "population": city.get("population", 0),
                "importance": city.get("importance", 5),
                "tags": city.get("tags", []),
                "imported_at": datetime.now().isoformat()
            }
            formatted.append(formatted_city)

        self.cities = formatted
        return formatted

    def load_ideologies(self) -> List[Dict[str, Any]]:
        """Load and transform ideologies data"""
        filepath = self.data_dir / "ideologies.json"
        if not filepath.exists():
            print(f"Warning: {filepath} not found")
            return []

        with open(filepath, 'r') as f:
            data = json.load(f)

        formatted = []
        for ideology in data.get("ideologies", []):
            ideology_id = str(uuid.uuid4())

            formatted_ideology = {
                "id": ideology_id,
                "name": ideology.get("name", ""),
                "slug": ideology.get("id", "").lower().replace("_", "-"),
                "description": ideology.get("description", ""),
                "left_right_position": ideology.get("left_right_position", 0),
                "key_figures": ideology.get("key_figures", []),
                "key_texts": ideology.get("key_texts", []),
                "variants": ideology.get("variants", []),
                "core_concepts": ideology.get("core_concepts", []),
                "imported_at": datetime.now().isoformat()
            }
            formatted.append(formatted_ideology)

        self.ideologies = formatted
        return formatted

    def load_liberation_struggles(self) -> List[Dict[str, Any]]:
        """Load and transform liberation struggles data"""
        filepath = self.data_dir / "liberation_struggles.json"
        if not filepath.exists():
            print(f"Warning: {filepath} not found")
            return []

        with open(filepath, 'r') as f:
            data = json.load(f)

        formatted = []
        for struggle in data.get("struggles", []):
            struggle_id = str(uuid.uuid4())

            formatted_struggle = {
                "id": struggle_id,
                "name": struggle.get("name", ""),
                "slug": struggle.get("id", "").lower().replace("_", "-"),
                "start_year": struggle.get("start_year"),
                "status": struggle.get("status", "ongoing"),
                "description": struggle.get("description", ""),
                "key_cities": struggle.get("key_cities", []),
                "important_sites": struggle.get("important_sites", []),
                "key_events": struggle.get("key_events", []),
                "key_figures": struggle.get("key_figures", []),
                "organizations": struggle.get("organizations", []),
                "imported_at": datetime.now().isoformat()
            }
            formatted.append(formatted_struggle)

        self.liberation_struggles = formatted
        return formatted

    def load_all(self) -> Dict[str, List[Dict[str, Any]]]:
        """Load all data"""
        return {
            "conflicts": self.load_conflicts(),
            "events": self.load_events(),
            "cities": self.load_cities(),
            "ideologies": self.load_ideologies(),
            "liberation_struggles": self.load_liberation_struggles()
        }

    def export_json(self, output_dir: Path, data_type: Optional[str] = None) -> None:
        """Export formatted data to JSON files"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        if data_type is None or data_type == "conflicts":
            with open(output_dir / "conflicts_formatted.json", 'w') as f:
                json.dump(self.conflicts, f, indent=2)
            print(f"Exported {len(self.conflicts)} conflicts to {output_dir / 'conflicts_formatted.json'}")

        if data_type is None or data_type == "events":
            with open(output_dir / "events_formatted.json", 'w') as f:
                json.dump(self.events, f, indent=2)
            print(f"Exported {len(self.events)} events to {output_dir / 'events_formatted.json'}")

        if data_type is None or data_type == "cities":
            with open(output_dir / "cities_formatted.json", 'w') as f:
                json.dump(self.cities, f, indent=2)
            print(f"Exported {len(self.cities)} cities to {output_dir / 'cities_formatted.json'}")

        if data_type is None or data_type == "ideologies":
            with open(output_dir / "ideologies_formatted.json", 'w') as f:
                json.dump(self.ideologies, f, indent=2)
            print(f"Exported {len(self.ideologies)} ideologies to {output_dir / 'ideologies_formatted.json'}")

        if data_type is None or data_type == "liberation_struggles":
            with open(output_dir / "liberation_struggles_formatted.json", 'w') as f:
                json.dump(self.liberation_struggles, f, indent=2)
            print(f"Exported {len(self.liberation_struggles)} liberation struggles to {output_dir / 'liberation_struggles_formatted.json'}")

    def print_summary(self) -> None:
        """Print data import summary"""
        print("\n" + "="*60)
        print("DATA IMPORT SUMMARY")
        print("="*60)
        print(f"Conflicts:             {len(self.conflicts):>4} entries")
        print(f"Events:                {len(self.events):>4} entries")
        print(f"Cities:                {len(self.cities):>4} entries")
        print(f"Ideologies:            {len(self.ideologies):>4} entries")
        print(f"Liberation Struggles:  {len(self.liberation_struggles):>4} entries")
        print("="*60)

        # Print sample data
        if self.conflicts:
            print(f"\nSample Conflict: {self.conflicts[0]['name']}")
        if self.events:
            print(f"Sample Event: {self.events[0]['title']}")
        if self.cities:
            print(f"Sample City: {self.cities[0]['name']}")
        if self.ideologies:
            print(f"Sample Ideology: {self.ideologies[0]['name']}")
        if self.liberation_struggles:
            print(f"Sample Struggle: {self.liberation_struggles[0]['name']}")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Import and format LeftistMonitor generated data"
    )
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=Path(__file__).parent.parent / "data" / "generated",
        help="Directory containing generated data files"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent.parent / "data" / "formatted",
        help="Output directory for formatted data"
    )
    parser.add_argument(
        "--type",
        choices=["conflicts", "events", "cities", "ideologies", "liberation_struggles"],
        help="Specific data type to import (default: all)"
    )
    parser.add_argument(
        "--summary",
        action="store_true",
        help="Print summary after import"
    )

    args = parser.parse_args()

    # Check data directory exists
    if not args.data_dir.exists():
        print(f"Error: Data directory not found: {args.data_dir}")
        sys.exit(1)

    # Initialize importer
    importer = DataImporter(args.data_dir)

    # Load data
    print(f"Loading data from {args.data_dir}...")
    all_data = importer.load_all()

    # Export formatted data
    print(f"Exporting formatted data to {args.output_dir}...")
    importer.export_json(args.output_dir, args.type)

    # Print summary if requested
    if args.summary:
        importer.print_summary()

    print("\nImport completed successfully!")


if __name__ == "__main__":
    main()
