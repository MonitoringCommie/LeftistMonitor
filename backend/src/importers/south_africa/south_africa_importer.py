"""
Apartheid South Africa Historical Data Importer

Documents the apartheid system in South Africa (1948-1994).
Includes data on:
- Massacres (Sharpeville, Soweto, etc.)
- Bantustans/Homelands
- Political prisons (Robben Island)
- Forced removals
- Historical events
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


def load_south_africa_data() -> dict:
    """Load South Africa data from JSON file."""
    json_path = Path(__file__).parent / "south_africa_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class SouthAfricaImporter(BaseImporter):
    """Imports Apartheid South Africa historical data."""

    name = "south_africa"
    description = "Apartheid South Africa 1948-1994 - massacres, Bantustans, prisons, forced removals"

    async def run(self, session: AsyncSession) -> dict[str, Any]:
        """Import South Africa apartheid data."""
        

        data = load_south_africa_data()
        stats = {
            "massacres_imported": 0,
            "bantustans_imported": 0,
            "prisons_imported": 0,
            "forced_removals_imported": 0,
            "events_imported": 0
        }

        # Get South Africa
        result = await session.execute(
            select(Country).where(Country.name_en == "South Africa")
        )
        south_africa = result.scalar_one_or_none()

        if not south_africa:
            self.logger.warning("South Africa not found in database")
            return stats

        # Import massacres
        for massacre in data.get("massacres", []):
            try:
                coords = massacre.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    date_str = massacre.get("date", "1960-01-01")
                    parts = date_str.split("-")
                    event_date = date(int(parts[0]), int(parts[1]), int(parts[2]))

                    death_toll = massacre.get("death_toll", massacre.get("death_toll_low", 0))
                    
                    event = Event(
                        title=massacre["name"],
                        description=f"{massacre.get('description', '')} "
                                   f"Death toll: {death_toll}. "
                                   f"Injured: {massacre.get('injured', 'unknown')}. "
                                   f"Perpetrator: {massacre.get('perpetrator', '')}. "
                                   f"{massacre.get('notes', '')}",
                        start_date=event_date,
                        category="apartheid_massacre",
                        primary_country_id=south_africa.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="Apartheid was maintained through systematic state violence. "
                                            "The massacres documented here represent only a fraction of the "
                                            "killings carried out to enforce white supremacy."
                    )
                    session.add(event)
                    stats["massacres_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing massacre {massacre.get('name')}: {e}")

        # Import Bantustans
        for bantustan in data.get("bantustans", []):
            try:
                coords = bantustan.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    event = Event(
                        title=f"{bantustan['name']} Bantustan",
                        description=f"Type: {bantustan.get('type', 'homeland')}. "
                                   f"Population: {bantustan.get('population', 'unknown')}. "
                                   f"Independence declared: {bantustan.get('independence_declared', 'never')}. "
                                   f"{bantustan.get('notes', '')}",
                        start_date=date(bantustan.get("established", 1970), 1, 1),
                        category="bantustan",
                        primary_country_id=south_africa.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="Bantustans were created to deny Black South Africans citizenship "
                                            "in their own country. They were dumping grounds for 'surplus' Black labor, "
                                            "keeping wages low while maintaining fiction of separate development."
                    )
                    session.add(event)
                    stats["bantustans_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing bantustan {bantustan.get('name')}: {e}")

        # Import prisons
        for prison in data.get("prisons", []):
            try:
                coords = prison.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    event = Event(
                        name=prison["name"],
                        description=f"Type: {prison.get('type', 'prison')}. "
                                   f"{prison.get('notes', '')}",
                        start_date=date(prison.get("established", 1960), 1, 1),
                        category="apartheid_prison",
                        primary_country_id=south_africa.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="The apartheid regime imprisoned thousands of political activists. "
                                            "Many died in detention from torture. Robben Island held the leadership "
                                            "of the liberation movement for decades."
                    )
                    session.add(event)
                    stats["prisons_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing prison {prison.get('name')}: {e}")

        # Import forced removals
        for removal in data.get("forced_removals", []):
            try:
                coords = removal.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    date_str = str(removal.get("date", "1960"))
                    if "-" in date_str:
                        parts = date_str.split("-")
                        event_date = date(int(parts[0]), int(parts[1]) if len(parts) > 1 else 1, int(parts[2]) if len(parts) > 2 else 1)
                    else:
                        event_date = date(int(date_str), 1, 1)

                    event = Event(
                        title=f"{removal['name']}",
                        description=f"Location: {removal.get('location', '')}. "
                                   f"Population removed: {removal.get('population_removed', 'unknown')}. "
                                   f"{removal.get('notes', '')}",
                        start_date=event_date,
                        category="forced_removal",
                        primary_country_id=south_africa.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="Over 3.5 million Black South Africans were forcibly removed from "
                                            "their homes under the Group Areas Act. Vibrant communities were "
                                            "destroyed to create white-only areas."
                    )
                    session.add(event)
                    stats["forced_removals_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing removal {removal.get('name')}: {e}")

        # Import historical events
        for event_data in data.get("historical_events", []):
            try:
                date_str = str(event_data.get("date", "1948"))
                if "-" in date_str:
                    parts = date_str.split("-")
                    if len(parts) >= 3:
                        event_date = date(int(parts[0]), int(parts[1]), int(parts[2]))
                    else:
                        event_date = date(int(parts[0]), 1, 1)
                else:
                    event_date = date(int(date_str), 1, 1)

                event = Event(
                    title=event_data["name"],
                    description=f"{event_data.get('description', '')} {event_data.get('notes', '')}",
                    start_date=event_date,
                    category="apartheid_history",
                    primary_country_id=south_africa.id,
                    progressive_analysis="Apartheid was not just a South African system but was supported by "
                                        "Western powers, especially the US and UK, until the international "
                                        "solidarity movement forced sanctions and divestment."
                )
                session.add(event)
                stats["events_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing event {event_data.get('name')}: {e}")

        await session.commit()

        self.logger.info(f"South Africa apartheid import complete: {stats}")
        return stats
