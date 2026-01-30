"""
Kurdistan Destroyed Villages Importer

Documents the ~4,000 Kurdish villages destroyed by Turkey, primarily during
the 1990s conflict. Includes data on:
- Destroyed villages by province
- Dam projects displacing Kurdish populations  
- Massacres
- Political prisoners
- Historical events
- Cultural suppression
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


def load_kurdistan_data() -> dict:
    """Load Kurdistan data from JSON file."""
    json_path = Path(__file__).parent / "kurdistan_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class KurdistanImporter(BaseImporter):
    """Imports Kurdistan occupation/destruction data."""
    
    name = "kurdistan"
    description = "Kurdish villages destroyed by Turkey and related occupation data"
    
    async def run(self, session: AsyncSession) -> dict[str, Any]:
        """Import Kurdistan data."""

        
        data = load_kurdistan_data()
        stats = {
            "villages_imported": 0,
            "provinces_imported": 0,
            "dams_imported": 0,
            "massacres_imported": 0,
            "events_imported": 0
        }
        
        # Get Turkey country
        result = await session.execute(
            select(Country).where(Country.name_en == "Turkey")
        )
        turkey = result.scalar_one_or_none()
        
        if not turkey:
            self.logger.warning("Turkey not found in database")
            return stats
        
        # Import destroyed villages as historical events
        for village in data.get("destroyed_villages", []):
            try:
                coords = village.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    event = Event(
                        title=f"Destruction of {village['name']}",
                        description=f"Kurdish village {village.get('name_kurdish', village['name'])} in {village['province']} province destroyed. "
                                   f"Population before: {village.get('population_before', 'unknown')}. "
                                   f"Type: {village.get('destruction_type', 'forced evacuation')}. "
                                   f"{village.get('notes', '')}",
                        start_date=date(village.get("destruction_year", 1994), 1, 1),
                        category="village_destruction",
                        primary_country_id=turkey.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Part of systematic destruction of ~4,000 Kurdish villages during Turkish military operations in the 1990s. "
                                            f"This village in {village['district']} district was part of forced displacement affecting over 1 million Kurds."
                    )
                    session.add(event)
                    stats["villages_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing village {village.get('name')}: {e}")
        
        # Import massacres
        for massacre in data.get("massacres", []):
            try:
                coords = massacre.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    # Parse date
                    date_str = massacre.get("date", "1990")
                    if "-" in date_str and len(date_str) == 10:
                        year, month, day = date_str.split("-")
                        event_date = date(int(year), int(month), int(day))
                    elif "-" in date_str:
                        year = date_str.split("-")[0]
                        event_date = date(int(year), 1, 1)
                    else:
                        event_date = date(int(date_str), 1, 1)
                    
                    event = Event(
                        title=massacre["name"],
                        description=f"{massacre.get('name_kurdish', '')} - {massacre.get('description', '')} "
                                   f"Location: {massacre.get('location', '')}. "
                                   f"Death toll: {massacre.get('death_toll_low', '?')}-{massacre.get('death_toll_high', '?')}. "
                                   f"Perpetrator: {massacre.get('perpetrator', '')}.",
                        start_date=event_date,
                        category="massacre",
                        primary_country_id=turkey.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Part of systematic violence against Kurdish population. "
                                            f"These events document state violence that has been largely ignored by international community."
                    )
                    session.add(event)
                    stats["massacres_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing massacre {massacre.get('name')}: {e}")
        
        # Import dam projects as events
        for dam in data.get("dam_projects", []):
            try:
                coords = dam.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]
                    
                    # Extract year from status
                    status = dam.get("status", "")
                    if "completed" in status:
                        year = int(status.split("_")[1]) if "_" in status else 2000
                    else:
                        year = 2020
                    
                    event = Event(
                        title=f"{dam['name']} ({dam.get('name_kurdish', '')})",
                        description=f"Dam on {dam.get('river', '')} river. "
                                   f"Status: {status}. "
                                   f"Villages flooded: {dam.get('villages_flooded', '?')}. "
                                   f"Population displaced: {dam.get('population_displaced', '?')}. "
                                   f"{dam.get('notes', '')}",
                        start_date=date(year, 1, 1),
                        category="dam_displacement",
                        primary_country_id=turkey.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis=f"Dam projects in Kurdish regions often serve dual purposes: energy production and demographic engineering. "
                                            f"The flooding of Kurdish villages and historic sites represents cultural genocide through infrastructure."
                    )
                    session.add(event)
                    stats["dams_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing dam {dam.get('name')}: {e}")
        
        # Import historical events
        for event_data in data.get("historical_events", []):
            try:
                date_str = event_data.get("date", "1990")
                if "-" in date_str and len(date_str) == 10:
                    year, month, day = date_str.split("-")
                    event_date = date(int(year), int(month), int(day))
                elif "-" in date_str:
                    year = date_str.split("-")[0]
                    event_date = date(int(year), 1, 1)
                else:
                    event_date = date(int(date_str), 1, 1)
                
                event = Event(
                    title=event_data["name"],
                    description=f"{event_data.get('name_kurdish', '')} - {event_data.get('description', '')} "
                               f"Death toll: {event_data.get('death_toll', 'N/A')}. "
                               f"Displaced: {event_data.get('displaced', 'N/A')}.",
                    start_date=event_date,
                    category="kurdish_resistance",
                    primary_country_id=turkey.id,
                    progressive_analysis=f"Part of the century-long Kurdish struggle for recognition, rights, and self-determination "
                                        f"against Turkish state policies of assimilation and suppression."
                )
                session.add(event)
                stats["events_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing event {event_data.get('name')}: {e}")
        
        await session.commit()
        
        self.logger.info(f"Kurdistan import complete: {stats}")
        return stats
