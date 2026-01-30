"""
Kashmir Occupation Data Importer

Documents Indian occupation of Kashmir, one of the world's most militarized zones.
Includes data on:
- Military installations and camps
- Checkpoints
- Massacres and mass graves
- Communication blackouts
- Political prisoners
- Enforced disappearances
- Pellet gun casualties
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


def load_kashmir_data() -> dict:
    """Load Kashmir data from JSON file."""
    json_path = Path(__file__).parent / "kashmir_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class KashmirImporter(BaseImporter):
    """Imports Kashmir occupation data."""
    
    name = "kashmir"
    description = "Indian occupation of Kashmir - military installations, massacres, human rights violations"
    
    async def run(self, session: AsyncSession) -> dict[str, Any]:
        """Import Kashmir data."""
        
        
        data = load_kashmir_data()
        stats = {
            "military_installations_imported": 0,
            "checkpoints_imported": 0,
            "massacres_imported": 0,
            "mass_graves_imported": 0,
            "events_imported": 0
        }
        
        # Get India country (as the occupying power for context)
        result = await session.execute(
            select(Country).where(Country.name_en == "India")
        )
        india = result.scalar_one_or_none()
        
        if not india:
            self.logger.warning("India not found in database")
            return stats
        
        # Import military installations as events
        for installation in data.get("military_installations", []):
            try:
                coords = installation.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    event = Event(
                        title=f"{installation['name']} Military Installation",
                        description=f"Type: {installation.get('type', 'military base')}. "
                                   f"Location: {installation.get('location', '')}. "
                                   f"{installation.get('notes', '')}",
                        start_date=date(installation.get("established", 1990), 1, 1),
                        category="military_installation",
                        primary_country_id=india.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Part of India's massive military presence in Kashmir - over 700,000 troops "
                                            f"making it one of the world's most militarized zones with 1 soldier per 17 civilians."
                    )
                    session.add(event)
                    stats["military_installations_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing installation {installation.get('name')}: {e}")
        
        # Import checkpoints
        for checkpoint in data.get("checkpoints", []):
            try:
                coords = checkpoint.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    event = Event(
                        title=f"{checkpoint['name']}",
                        description=f"Type: {checkpoint.get('type', 'checkpoint')}. "
                                   f"Location: {checkpoint.get('location', '')}. "
                                   f"{checkpoint.get('notes', '')}",
                        start_date=date(1990, 1, 1),
                        category="checkpoint",
                        primary_country_id=india.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Kashmiris must pass through numerous military checkpoints daily, "
                                            f"facing searches, delays, and potential harassment. These checkpoints "
                                            f"restrict freedom of movement and are sites of frequent human rights violations."
                    )
                    session.add(event)
                    stats["checkpoints_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing checkpoint {checkpoint.get('name')}: {e}")
        
        # Import massacres
        for massacre in data.get("massacres", []):
            try:
                coords = massacre.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    # Parse date
                    date_str = massacre.get("date", "1990-01-01")
                    parts = date_str.split("-")
                    event_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                    
                    event = Event(
                        title=massacre["name"],
                        description=f"{massacre.get('description', '')} "
                                   f"Death toll: {massacre.get('death_toll_low', '?')}-{massacre.get('death_toll_high', '?')}. "
                                   f"Perpetrator: {massacre.get('perpetrator', '')}. "
                                   f"{massacre.get('notes', '')}",
                        start_date=event_date,
                        category="massacre",
                        primary_country_id=india.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Indian security forces operate with near-total impunity in Kashmir under AFSPA. "
                                            f"Massacres, extrajudicial killings, and fake encounters continue with no accountability."
                    )
                    session.add(event)
                    stats["massacres_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing massacre {massacre.get('name')}: {e}")
        
        # Import mass graves
        for grave in data.get("mass_graves", []):
            try:
                coords = grave.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    event = Event(
                        title=f"{grave['name']}",
                        description=f"Discovered: {grave.get('discovered', 'unknown')}. "
                                   f"Bodies: {grave.get('bodies_low', '?')}-{grave.get('bodies_high', '?')}. "
                                   f"{grave.get('notes', '')}",
                        start_date=date(grave.get("discovered", 2008), 1, 1),
                        category="mass_grave",
                        primary_country_id=india.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"The State Human Rights Commission documented thousands of unmarked graves "
                                            f"in Kashmir containing bodies of victims of enforced disappearances. "
                                            f"Over 8,000 people have been forcibly disappeared since 1989."
                    )
                    session.add(event)
                    stats["mass_graves_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing mass grave {grave.get('name')}: {e}")
        
        # Import historical events
        for event_data in data.get("historical_events", []):
            try:
                date_str = str(event_data.get("date", "1990"))
                if "-" in date_str:
                    parts = date_str.split("-")
                    if len(parts) == 3:
                        event_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                    else:
                        event_date = date(int(parts[0]), 1, 1)
                else:
                    event_date = date(int(date_str), 1, 1)
                
                event = Event(
                    title=event_data["name"],
                    description=f"{event_data.get('description', '')} {event_data.get('notes', '')}",
                    start_date=event_date,
                    category="kashmir_history",
                    primary_country_id=india.id,
                    progressive_analysis=f"Kashmir's struggle for self-determination has been ongoing since 1947. "
                                        f"Despite UN resolutions calling for a plebiscite, Kashmiris have never been "
                                        f"allowed to vote on their future. India's occupation continues with impunity."
                )
                session.add(event)
                stats["events_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing event {event_data.get('name')}: {e}")
        
        await session.commit()
        
        self.logger.info(f"Kashmir import complete: {stats}")
        return stats
