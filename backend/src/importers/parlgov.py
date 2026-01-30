"""ParlGov data importer for elections and parties."""
import csv
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import UUID
import uuid

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..geography.models import Country
from ..politics.models import PoliticalParty, Election, ElectionResult


class ParlGovImporter:
    """Import election and party data from ParlGov CSV files."""

    COUNTRY_NAME_MAP = {
        "United States": "United States of America",
        "United Kingdom": "United Kingdom of Great Britain and Northern Ireland",
        "UK": "United Kingdom of Great Britain and Northern Ireland",
        "Czechia": "Czech Republic",
        "Korea South": "Korea, Republic of",
        "North Macedonia": "Macedonia",
    }

    def __init__(self, db: AsyncSession, data_dir: str):
        self.db = db
        self.data_dir = Path(data_dir)
        self.country_cache: dict[str, UUID] = {}
        self.party_cache: dict[int, UUID] = {}
        self.election_cache: dict[int, UUID] = {}
        self.stats = {"parties": 0, "elections": 0, "results": 0, "skipped": 0}

    async def _get_country_id(self, country_name: str) -> Optional[UUID]:
        if country_name in self.country_cache:
            return self.country_cache[country_name]
        search_name = self.COUNTRY_NAME_MAP.get(country_name, country_name)
        result = await self.db.execute(
            select(Country.id).where(Country.name_en.ilike(f"%{search_name}%")).limit(1)
        )
        row = result.first()
        if row:
            self.country_cache[country_name] = row[0]
            return row[0]
        result = await self.db.execute(
            select(Country.id).where(Country.name_en.ilike(f"{country_name}%")).limit(1)
        )
        row = result.first()
        if row:
            self.country_cache[country_name] = row[0]
            return row[0]
        return None

    def _parse_float(self, value: str) -> Optional[float]:
        if not value or value.strip() == "": return None
        try: return float(value)
        except ValueError: return None

    def _parse_int(self, value: str) -> Optional[int]:
        if not value or value.strip() == "": return None
        try: return int(float(value))
        except ValueError: return None

    async def import_parties(self) -> int:
        parties_file = self.data_dir / "parties.csv"
        if not parties_file.exists():
            print(f"Parties file not found: {parties_file}")
            return 0
        count = 0
        with open(parties_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                country_id = await self._get_country_id(row["country_name"])
                if not country_id: continue
                parlgov_id = int(row["party_id"])
                existing = await self.db.execute(
                    select(PoliticalParty.id).where(PoliticalParty.parlgov_id == parlgov_id)
                )
                existing_row = existing.first()
                if existing_row:
                    self.party_cache[parlgov_id] = existing_row[0]
                    continue
                party = PoliticalParty(
                    id=uuid.uuid4(), parlgov_id=parlgov_id,
                    name=row["party_name"] or row["party_name_english"],
                    name_english=row["party_name_english"] if row["party_name_english"] != row["party_name"] else None,
                    name_short=row["party_name_short"] if row["party_name_short"] else None,
                    country_id=country_id,
                    left_right_score=self._parse_float(row["left_right"]),
                    party_family=row["family_name"] if row.get("family_name") else None,
                )
                self.db.add(party)
                self.party_cache[parlgov_id] = party.id
                count += 1
                if count % 100 == 0:
                    await self.db.flush()
                    print(f"  Imported {count} parties...")
        await self.db.flush()
        self.stats["parties"] = count
        return count

    async def import_elections(self) -> tuple[int, int]:
        elections_file = self.data_dir / "elections.csv"
        if not elections_file.exists():
            print(f"Elections file not found: {elections_file}")
            return 0, 0
        election_count = 0
        result_count = 0
        elections_data: dict[int, list[dict]] = {}
        with open(elections_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                election_id = int(row["election_id"])
                if election_id not in elections_data: elections_data[election_id] = []
                elections_data[election_id].append(row)

        for parlgov_election_id, rows in elections_data.items():
            first_row = rows[0]
            country_id = await self._get_country_id(first_row["country_name"])
            if not country_id:
                self.stats["skipped"] += 1
                continue
            try:
                election_date = datetime.strptime(first_row["election_date"], "%Y-%m-%d").date()
            except ValueError:
                self.stats["skipped"] += 1
                continue
            # Check if election already exists by parlgov_id
            existing = await self.db.execute(
                select(Election.id).where(Election.parlgov_id == parlgov_election_id)
            )
            existing_row = existing.first()
            if existing_row:
                self.election_cache[parlgov_election_id] = existing_row[0]
                continue
            # Also check by unique constraint (country, date, type)
            existing = await self.db.execute(
                select(Election.id).where(and_(
                    Election.country_id == country_id,
                    Election.date == election_date,
                    Election.election_type == first_row["election_type"]
                ))
            )
            existing_row = existing.first()
            if existing_row:
                self.election_cache[parlgov_election_id] = existing_row[0]
                continue
            total_seats = self._parse_int(first_row["seats_total"])
            election = Election(
                id=uuid.uuid4(), country_id=country_id, date=election_date,
                election_type=first_row["election_type"], total_seats=total_seats,
                parlgov_id=parlgov_election_id,
            )
            self.db.add(election)
            self.election_cache[parlgov_election_id] = election.id
            election_count += 1

            for row in rows:
                parlgov_party_id = self._parse_int(row["party_id"])
                if not parlgov_party_id: continue
                if parlgov_party_id not in self.party_cache:
                    party = PoliticalParty(
                        id=uuid.uuid4(), parlgov_id=parlgov_party_id,
                        name=row["party_name"] or row["party_name_english"] or row["party_name_short"],
                        name_english=row["party_name_english"] if row["party_name_english"] else None,
                        name_short=row["party_name_short"] if row["party_name_short"] else None,
                        country_id=country_id, left_right_score=self._parse_float(row["left_right"]),
                    )
                    self.db.add(party)
                    self.party_cache[parlgov_party_id] = party.id
                    self.stats["parties"] += 1

                party_id = self.party_cache[parlgov_party_id]
                vote_share = self._parse_float(row["vote_share"])
                seats = self._parse_int(row["seats"])
                seat_share = None
                if seats is not None and total_seats:
                    seat_share = (seats / total_seats) * 100
                result = ElectionResult(
                    id=uuid.uuid4(), election_id=election.id, party_id=party_id,
                    vote_share=vote_share, seats=seats, seat_share=seat_share,
                )
                self.db.add(result)
                result_count += 1

            if election_count % 50 == 0:
                await self.db.flush()
                print(f"  Imported {election_count} elections, {result_count} results...")
        await self.db.flush()
        self.stats["elections"] = election_count
        self.stats["results"] = result_count
        return election_count, result_count

    async def run(self) -> dict:
        print("Importing ParlGov parties...")
        await self.import_parties()
        print("Importing ParlGov elections...")
        await self.import_elections()
        await self.db.commit()
        print(f"Import complete!")
        print(f"  Parties: {self.stats['parties']}")
        print(f"  Elections: {self.stats['elections']}")
        print(f"  Results: {self.stats['results']}")
        print(f"  Skipped: {self.stats['skipped']}")
        return self.stats
