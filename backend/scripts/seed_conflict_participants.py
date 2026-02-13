"""Seed conflict_participants by matching conflict names to countries.

Strategy:
1. For all conflicts: extract country names from the conflict name field
   (many are formatted "Country A - Country B" or "Government of X vs Rebels of Y")
2. Match extracted names against countries table
3. INSERT into conflict_participants with appropriate side assignments

Uses raw SQL to avoid ORM FK resolution issues.
"""
import asyncio
import re
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from src.database import async_session_maker


# Common government/state prefixes to strip when matching
GOV_PREFIXES = [
    "Government of ", "Republic of ", "People's Republic of ",
    "Democratic Republic of ", "Kingdom of ", "State of ",
    "Federation of ", "Federal Republic of ", "Union of ",
    "Socialist Republic of ", "Islamic Republic of ",
]

# Common non-state actor patterns (skip these for country matching)
NON_STATE_PATTERNS = [
    r"rebels?", r"opposition", r"militia", r"insurgent",
    r"faction", r"guerrilla", r"forces of", r"movement",
    r"front", r"army", r"liberation", r"party",
    r"FARC", r"ELN", r"PKK", r"LTTE", r"IRA", r"ETA",
    r"al-", r"Al-", r"ISIS", r"ISIL", r"Daesh",
    r"Hezbollah", r"Hamas", r"Taliban",
]


def extract_sides_from_name(name: str) -> tuple[list[str], list[str]]:
    """Extract potential country names from conflict name."""
    for sep in [" vs ", " vs. ", " - ", " versus ", " against "]:
        if sep in name:
            parts = name.split(sep, 1)
            return (extract_names(parts[0]), extract_names(parts[1]))
    return (extract_names(name), [])


def extract_names(fragment: str) -> list[str]:
    """Extract potential country names from a text fragment."""
    names = []
    cleaned = fragment.strip()

    for prefix in GOV_PREFIXES:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break

    parts = [p.strip() for p in cleaned.split(",")]
    for part in parts:
        is_non_state = False
        for pattern in NON_STATE_PATTERNS:
            if re.search(pattern, part, re.IGNORECASE):
                is_non_state = True
                break

        if not is_non_state:
            part = re.sub(r'\(.*?\)', '', part).strip()
            if part and len(part) > 2:
                names.append(part)

    return names


def find_country(name: str, lookup: dict[str, tuple[str, str]]) -> tuple[str, str] | None:
    """Find a country by name with fuzzy matching."""
    lower = name.lower().strip()

    if lower in lookup:
        return lookup[lower]

    for prefix in GOV_PREFIXES:
        stripped = lower.removeprefix(prefix.lower())
        if stripped != lower and stripped in lookup:
            return lookup[stripped]

    for country_lower, (cid, cname) in lookup.items():
        if len(country_lower) > 3 and country_lower in lower:
            return (cid, cname)

    return None


async def seed_conflict_participants():
    async with async_session_maker() as session:
        # Get all countries for matching
        countries_result = await session.execute(
            text("SELECT id, name_en FROM countries")
        )
        country_lookup: dict[str, tuple[str, str]] = {}
        for c in countries_result.fetchall():
            country_lookup[c.name_en.lower()] = (str(c.id), c.name_en)

        # Get existing participant conflict_ids to avoid duplicates
        existing_result = await session.execute(
            text("SELECT DISTINCT conflict_id FROM conflict_participants")
        )
        existing_conflict_ids = {str(row[0]) for row in existing_result.fetchall()}

        # Get all conflicts using raw SQL
        conflicts_result = await session.execute(
            text("SELECT id, name FROM conflicts")
        )
        conflicts = conflicts_result.fetchall()

        inserted = 0
        matched_conflicts = 0
        batch = []

        for conflict in conflicts:
            conflict_id = str(conflict.id)
            if conflict_id in existing_conflict_ids:
                continue

            side_a_names, side_b_names = extract_sides_from_name(conflict.name)
            participants_added = False

            for name in side_a_names:
                country = find_country(name, country_lookup)
                if country:
                    batch.append({
                        "id": str(uuid.uuid4()),
                        "conflict_id": conflict_id,
                        "country_id": country[0],
                        "actor_name": None,
                        "side": "side_a",
                        "role": "primary",
                    })
                    inserted += 1
                    participants_added = True
                elif len(name) > 2:
                    batch.append({
                        "id": str(uuid.uuid4()),
                        "conflict_id": conflict_id,
                        "country_id": None,
                        "actor_name": name,
                        "side": "side_a",
                        "role": "primary",
                    })
                    inserted += 1
                    participants_added = True

            for name in side_b_names:
                country = find_country(name, country_lookup)
                if country:
                    batch.append({
                        "id": str(uuid.uuid4()),
                        "conflict_id": conflict_id,
                        "country_id": country[0],
                        "actor_name": None,
                        "side": "side_b",
                        "role": "primary",
                    })
                    inserted += 1
                    participants_added = True
                elif len(name) > 2:
                    batch.append({
                        "id": str(uuid.uuid4()),
                        "conflict_id": conflict_id,
                        "country_id": None,
                        "actor_name": name,
                        "side": "side_b",
                        "role": "primary",
                    })
                    inserted += 1
                    participants_added = True

            if participants_added:
                matched_conflicts += 1

            # Insert in batches of 500
            if len(batch) >= 500:
                await session.execute(
                    text("""
                        INSERT INTO conflict_participants (id, conflict_id, country_id, actor_name, side, role)
                        VALUES (:id, :conflict_id, :country_id, :actor_name, :side, :role)
                    """),
                    batch,
                )
                batch = []

        # Insert remaining
        if batch:
            await session.execute(
                text("""
                    INSERT INTO conflict_participants (id, conflict_id, country_id, actor_name, side, role)
                    VALUES (:id, :conflict_id, :country_id, :actor_name, :side, :role)
                """),
                batch,
            )

        await session.commit()

        # Final count
        count_result = await session.execute(
            text("SELECT COUNT(*) FROM conflict_participants")
        )
        total = count_result.scalar()

        print(f"Seeded conflict_participants successfully")
        print(f"  New records inserted: {inserted}")
        print(f"  Conflicts matched: {matched_conflicts}")
        print(f"  Total participants now: {total}")


if __name__ == "__main__":
    asyncio.run(seed_conflict_participants())
