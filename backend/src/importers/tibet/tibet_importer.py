"""
Tibet Occupation Data Importer

Documents Chinese occupation of Tibet since 1950.
Includes data on:
- Destroyed monasteries
- Military installations
- Self-immolations
- Massacres and crackdowns
- Political prisoners
- Settler colonialism
- Cultural destruction
"""

import json
from pathlib import Path
from typing import Any
from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint

from ..base import BaseImporter
from ...events.models import Event
from ...geography.models import Country


def load_tibet_data() -> dict:
    """Load Tibet data from JSON file."""
    json_path = Path(__file__).parent / "tibet_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class TibetImporter(BaseImporter):
    """Imports Tibet occupation data."""
    
    name = "tibet"
    description = "Chinese occupation of Tibet - destroyed monasteries, massacres, self-immolations"
    
    async def run(self, session: AsyncSession) -> dict[str, Any]:
        """Import Tibet data."""
        
        
        data = load_tibet_data()
        stats = {
            "monasteries_imported": 0,
            "military_installations_imported": 0,
            "self_immolations_imported": 0,
            "massacres_imported": 0,
            "events_imported": 0
        }
        
        # Get China country
        result = await session.execute(
            select(Country).where(Country.name_en == "China")
        )
        china = result.scalar_one_or_none()
        
        if not china:
            self.logger.warning("China not found in database")
            return stats
        
        # Import destroyed monasteries
        for monastery in data.get("destroyed_monasteries", []):
            try:
                coords = monastery.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    event = Event(
                        title=f"Destruction of {monastery['name']}",
                        description=f"Founded: {monastery.get('founded', 'unknown')}. "
                                   f"Location: {monastery.get('location', '')}. "
                                   f"Destruction year: {monastery.get('destruction_year', 'unknown')}. "
                                   f"Rebuilt: {monastery.get('rebuilt', 'unknown')}. "
                                   f"{monastery.get('notes', '')}",
                        start_date=date(monastery.get("destruction_year", 1959), 1, 1),
                        category="monastery_destruction",
                        primary_country_id=china.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Over 6,000 monasteries were destroyed during the Chinese occupation "
                                            f"of Tibet, primarily during the Cultural Revolution. This represents "
                                            f"systematic cultural genocide targeting Tibetan Buddhist civilization."
                    )
                    session.add(event)
                    stats["monasteries_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing monastery {monastery.get('name')}: {e}")
        
        # Import military installations
        for installation in data.get("military_installations", []):
            try:
                coords = installation.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    event = Event(
                        title=f"{installation['name']}",
                        description=f"Type: {installation.get('type', 'military base')}. "
                                   f"Location: {installation.get('location', '')}. "
                                   f"{installation.get('notes', '')}",
                        start_date=date(1950, 1, 1),
                        category="military_installation",
                        primary_country_id=china.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"China maintains extensive military infrastructure in Tibet, "
                                            f"both to suppress Tibetan resistance and for strategic purposes "
                                            f"given Tibet's borders with India, Nepal, and other nations."
                    )
                    session.add(event)
                    stats["military_installations_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing installation {installation.get('name')}: {e}")
        
        # Import self-immolations
        for immolation in data.get("self_immolations", []):
            try:
                date_str = immolation.get("date", "2010-01-01")
                parts = date_str.split("-")
                event_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                
                event = Event(
                    title=f"Self-Immolation of {immolation['name']}",
                    description=f"Age: {immolation.get('age', 'unknown')}. "
                               f"Location: {immolation.get('location', '')}. "
                               f"Survived: {immolation.get('survived', False)}. "
                               f"{immolation.get('notes', '')}",
                    start_date=event_date,
                    category="self_immolation",
                    primary_country_id=china.id,
                    progressive_analysis=f"Over 150 Tibetans have self-immolated since 2009 in protest "
                                        f"of Chinese occupation. These acts of desperation highlight "
                                        f"the severity of repression when other forms of protest are impossible."
                )
                session.add(event)
                stats["self_immolations_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing self-immolation {immolation.get('name')}: {e}")
        
        # Import massacres
        for massacre in data.get("massacres_and_crackdowns", []):
            try:
                coords = massacre.get("coordinates", [])
                date_str = massacre.get("date", "1959-03-10")
                
                if "-" in date_str:
                    parts = date_str.split("-")
                    if len(parts) >= 2:
                        event_date = date(int(parts[0]), int(parts[1]) if parts[1].isdigit() else 1, 1)
                    else:
                        event_date = date(int(parts[0]), 1, 1)
                else:
                    event_date = date(int(date_str), 1, 1)
                
                event = Event(
                    title=massacre["name"],
                    description=f"Location: {massacre.get('location', '')}. "
                               f"Death toll: {massacre.get('death_toll_low', '?')}-{massacre.get('death_toll_high', '?')}. "
                               f"{massacre.get('notes', '')}",
                    start_date=event_date,
                    category="massacre",
                    primary_country_id=china.id,
                    location=ST_SetSRID(ST_MakePoint(coords[1], coords[0]), 4326) if len(coords) >= 2 else None,
                    progressive_analysis=f"China has used military force repeatedly to suppress Tibetan resistance. "
                                        f"Conservative estimates suggest 1.2 million Tibetans died as a result "
                                        f"of the occupation through violence, famine, and imprisonment."
                )
                session.add(event)
                stats["massacres_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing massacre {massacre.get('name')}: {e}")
        
        # Import historical events
        for event_data in data.get("historical_events", []):
            try:
                date_str = str(event_data.get("date", "1950"))
                if "-" in date_str:
                    parts = date_str.split("-")
                    if len(parts) >= 3:
                        event_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                    elif len(parts) == 2:
                        event_date = date(int(parts[0]), int(parts[1]), 1)
                    else:
                        event_date = date(int(parts[0]), 1, 1)
                else:
                    event_date = date(int(date_str), 1, 1)
                
                event = Event(
                    title=event_data["name"],
                    description=event_data.get("description", ""),
                    start_date=event_date,
                    category="tibet_history",
                    primary_country_id=china.id,
                    progressive_analysis=f"Tibet was an independent nation before China's 1950 invasion. "
                                        f"The occupation represents one of the longest-running colonial occupations "
                                        f"in modern history, with ongoing cultural genocide and resistance."
                )
                session.add(event)
                stats["events_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing event {event_data.get('name')}: {e}")
        
        await session.commit()
        
        self.logger.info(f"Tibet import complete: {stats}")
        return stats
