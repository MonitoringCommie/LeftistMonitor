"""Script to seed policy topics."""
import asyncio
import sys
from pathlib import Path
import uuid

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.database import async_session_maker
from src.policies.models import PolicyTopic


TOPICS = [
    {"name": "Economy", "color": "#f59e0b", "icon": "banknotes", "subtopics": [
        "Taxation", "Trade", "Labor", "Banking", "Industry", "Agriculture"
    ]},
    {"name": "Social Policy", "color": "#ec4899", "icon": "users", "subtopics": [
        "Healthcare", "Education", "Housing", "Welfare", "Pensions", "Family"
    ]},
    {"name": "Environment", "color": "#22c55e", "icon": "leaf", "subtopics": [
        "Climate", "Energy", "Conservation", "Pollution", "Sustainability"
    ]},
    {"name": "Civil Rights", "color": "#8b5cf6", "icon": "scale", "subtopics": [
        "Equality", "Privacy", "Speech", "Religion", "LGBTQ+", "Disability"
    ]},
    {"name": "Foreign Policy", "color": "#3b82f6", "icon": "globe", "subtopics": [
        "Defense", "Diplomacy", "Trade Agreements", "Immigration", "Aid"
    ]},
    {"name": "Governance", "color": "#64748b", "icon": "building", "subtopics": [
        "Elections", "Constitution", "Judiciary", "Local Government", "Transparency"
    ]},
    {"name": "Infrastructure", "color": "#06b6d4", "icon": "road", "subtopics": [
        "Transportation", "Telecommunications", "Water", "Power Grid"
    ]},
    {"name": "Security", "color": "#ef4444", "icon": "shield", "subtopics": [
        "Police", "Military", "Intelligence", "Cybersecurity", "Terrorism"
    ]},
]


async def seed_topics():
    async with async_session_maker() as session:
        for topic_data in TOPICS:
            # Create main topic
            parent = PolicyTopic(
                id=uuid.uuid4(),
                name=topic_data["name"],
                color=topic_data.get("color"),
                icon=topic_data.get("icon"),
            )
            session.add(parent)
            await session.flush()

            # Create subtopics
            for subtopic_name in topic_data.get("subtopics", []):
                subtopic = PolicyTopic(
                    id=uuid.uuid4(),
                    name=subtopic_name,
                    parent_id=parent.id,
                )
                session.add(subtopic)

        await session.commit()
        print("Seeded policy topics successfully")


if __name__ == "__main__":
    asyncio.run(seed_topics())
