"""Seed person_country_association from people.primary_country_id.

Strategy:
For all people where primary_country_id IS NOT NULL, insert a row into
person_country_association(person_id, country_id) with relationship_type='citizen'.

This alone should go from ~101 rows to potentially thousands, since many people
have primary_country_id set but no entry in the association table.
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from src.database import async_session_maker


async def seed_person_countries():
    async with async_session_maker() as session:
        # Count existing
        before_result = await session.execute(
            text("SELECT COUNT(*) FROM person_country_association")
        )
        before_count = before_result.scalar()

        # Insert from primary_country_id where not already in association table
        insert_result = await session.execute(text("""
            INSERT INTO person_country_association (person_id, country_id, relationship_type)
            SELECT p.id, p.primary_country_id, 'citizen'
            FROM people p
            WHERE p.primary_country_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM person_country_association pca
                  WHERE pca.person_id = p.id
                    AND pca.country_id = p.primary_country_id
              )
        """))

        primary_inserted = insert_result.rowcount

        # Also try to match birth_place against country names
        birth_result = await session.execute(text("""
            INSERT INTO person_country_association (person_id, country_id, relationship_type)
            SELECT DISTINCT p.id, c.id, 'born'
            FROM people p
            JOIN countries c ON LOWER(p.birth_place) LIKE '%%' || LOWER(c.name_en) || '%%'
            WHERE p.birth_place IS NOT NULL
              AND LENGTH(c.name_en) > 3
              AND NOT EXISTS (
                  SELECT 1 FROM person_country_association pca
                  WHERE pca.person_id = p.id
                    AND pca.country_id = c.id
                    AND pca.relationship_type = 'born'
              )
            LIMIT 5000
        """))

        birth_inserted = birth_result.rowcount

        # Also match death_place
        death_result = await session.execute(text("""
            INSERT INTO person_country_association (person_id, country_id, relationship_type)
            SELECT DISTINCT p.id, c.id, 'died'
            FROM people p
            JOIN countries c ON LOWER(p.death_place) LIKE '%%' || LOWER(c.name_en) || '%%'
            WHERE p.death_place IS NOT NULL
              AND LENGTH(c.name_en) > 3
              AND NOT EXISTS (
                  SELECT 1 FROM person_country_association pca
                  WHERE pca.person_id = p.id
                    AND pca.country_id = c.id
                    AND pca.relationship_type = 'died'
              )
            LIMIT 5000
        """))

        death_inserted = death_result.rowcount

        await session.commit()

        # Final count
        after_result = await session.execute(
            text("SELECT COUNT(*) FROM person_country_association")
        )
        after_count = after_result.scalar()

        print(f"Seeded person_country_association successfully")
        print(f"  Before: {before_count}")
        print(f"  Inserted from primary_country_id: {primary_inserted}")
        print(f"  Inserted from birth_place: {birth_inserted}")
        print(f"  Inserted from death_place: {death_inserted}")
        print(f"  Total now: {after_count}")


if __name__ == "__main__":
    asyncio.run(seed_person_countries())
