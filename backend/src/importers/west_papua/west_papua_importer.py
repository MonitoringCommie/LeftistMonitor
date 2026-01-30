"""
West Papua Occupation Data Importer

Documents Indonesian occupation of West Papua since 1963.
Includes data on:
- Military installations
- Massacres
- Resource extraction (Freeport mine, etc.)
- Transmigration settlements
- Restricted zones
- Political prisoners
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


def load_west_papua_data() -> dict:
    """Load West Papua data from JSON file."""
    json_path = Path(__file__).parent / "west_papua_data.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


class WestPapuaImporter(BaseImporter):
    """Imports West Papua occupation data."""

    name = "west_papua"
    description = "Indonesian occupation of West Papua - military, massacres, resource extraction, transmigration"

    async def run(self, session: AsyncSession) -> dict[str, Any]:
        """Import West Papua data."""
        

        data = load_west_papua_data()
        stats = {
            "military_installations_imported": 0,
            "massacres_imported": 0,
            "resource_extraction_imported": 0,
            "transmigration_imported": 0,
            "events_imported": 0
        }

        # Get Indonesia as the occupying power
        result = await session.execute(
            select(Country).where(Country.name_en == "Indonesia")
        )
        indonesia = result.scalar_one_or_none()

        if not indonesia:
            self.logger.warning("Indonesia not found in database")
            return stats

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
                        start_date=date(installation.get("established", 1963), 1, 1),
                        category="military_installation",
                        primary_country_id=indonesia.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="Indonesian military occupation of West Papua involves systematic "
                                            "human rights violations. The military operates with impunity, "
                                            "controlling access and suppressing independence movements."
                    )
                    session.add(event)
                    stats["military_installations_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing installation {installation.get('name')}: {e}")

        # Import massacres
        for massacre in data.get("massacres", []):
            try:
                coords = massacre.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    date_str = massacre.get("date", "1963-01-01")
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
                        primary_country_id=indonesia.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="Estimates suggest 100,000-500,000 Papuans killed since 1963. "
                                            "Indonesian military operates with total impunity. "
                                            "Foreign journalists banned, limiting documentation."
                    )
                    session.add(event)
                    stats["massacres_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing massacre {massacre.get('name')}: {e}")

        # Import resource extraction sites
        for site in data.get("resource_extraction", []):
            try:
                coords = site.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    event = Event(
                        name=site["name"],
                        description=f"Type: {site.get('type', 'extraction')}. "
                                   f"Operator: {site.get('operator', 'unknown')}. "
                                   f"{site.get('notes', '')} "
                                   f"Environmental damage: {site.get('environmental_damage', 'significant')}",
                        start_date=date(site.get("established", 1967), 1, 1),
                        category="resource_extraction",
                        primary_country_id=indonesia.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="West Papua's resources are extracted by multinational corporations "
                                            "with Indonesian military protection. Indigenous peoples displaced "
                                            "and ecosystems destroyed while profits flow to Jakarta and foreign capitals."
                    )
                    session.add(event)
                    stats["resource_extraction_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing resource site {site.get('name')}: {e}")

        # Import transmigration settlements
        for settlement in data.get("transmigration_settlements", []):
            try:
                coords = settlement.get("coordinates", [])
                if len(coords) >= 2:
                    lat, lon = coords[0], coords[1]

                    event = Event(
                        title=f"{settlement['name']} Transmigration Settlement",
                        description=f"Location: {settlement.get('location', '')}. "
                                   f"Population settled: {settlement.get('population_settled', 'unknown')}. "
                                   f"{settlement.get('notes', '')}",
                        start_date=date(settlement.get("established", 1980), 1, 1),
                        category="transmigration",
                        primary_country_id=indonesia.id,
                        location=ST_SetSRID(ST_MakePoint(lon, lat), 4326),
                        progressive_analysis="Indonesia's transmigration program has moved hundreds of thousands "
                                            "of Javanese settlers to Papua, reducing the indigenous population "
                                            "to a minority in many areas. This constitutes demographic engineering "
                                            "in violation of international law."
                    )
                    session.add(event)
                    stats["transmigration_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing transmigration {settlement.get('name')}: {e}")

        # Import historical events
        for event_data in data.get("historical_events", []):
            try:
                date_str = str(event_data.get("date", "1963"))
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
                    category="west_papua_history",
                    primary_country_id=indonesia.id,
                    progressive_analysis="West Papua's annexation by Indonesia was never legitimate. "
                                        "The 1969 'Act of Free Choice' was a sham supervised by the UN. "
                                        "Papuans continue to resist for self-determination."
                )
                session.add(event)
                stats["events_imported"] += 1
            except Exception as e:
                self.logger.error(f"Error importing event {event_data.get('name')}: {e}")

        await session.commit()

        self.logger.info(f"West Papua import complete: {stats}")
        return stats
