"""
Pytest Configuration and Fixtures

Provides common fixtures for testing the LeftistMonitor API.
"""

import pytest
import asyncio
from typing import AsyncGenerator, Generator
from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Test configuration
TEST_USER = {
    "id": str(uuid4()),
    "email": "test@example.com",
    "username": "testuser",
    "role": "contributor",
    "reputation": 100
}

TEST_ADMIN = {
    "id": str(uuid4()),
    "email": "admin@example.com",
    "username": "adminuser",
    "role": "admin",
    "reputation": 1000
}


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def app() -> FastAPI:
    """Create test FastAPI application."""
    from fastapi import FastAPI
    
    app = FastAPI(title="LeftistMonitor Test")
    
    # Import and include routers
    # In production, import actual routers
    
    return app


@pytest.fixture
def client(app: FastAPI) -> Generator:
    """Create synchronous test client."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
async def async_client(app: FastAPI) -> AsyncGenerator:
    """Create asynchronous test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def auth_headers() -> dict:
    """Get authentication headers for test user."""
    # In production, generate actual JWT
    return {"Authorization": "Bearer test-token"}


@pytest.fixture
def admin_headers() -> dict:
    """Get authentication headers for admin user."""
    return {"Authorization": "Bearer admin-test-token"}


@pytest.fixture
def sample_contribution() -> dict:
    """Create sample contribution data."""
    return {
        "contribution_type": "event",
        "data": {
            "title": "Test Historical Event",
            "description": "A test event for the contribution system. This is a detailed description of the historical event.",
            "date_start": "1920-05-01",
            "date_end": "1920-05-03",
            "location_name": "Test City, Test Country",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "country_code": "USA",
            "categories": ["labor", "protest"],
            "death_toll": 5,
            "participants": 1000
        },
        "sources": [
            {
                "type": "academic",
                "title": "Test Academic Source",
                "author": "Test Author",
                "url": "https://example.com/source"
            }
        ],
        "notes": "Test contribution notes",
        "language": "en"
    }


@pytest.fixture
def sample_person_contribution() -> dict:
    """Create sample person contribution data."""
    return {
        "contribution_type": "person",
        "data": {
            "name": "Test Historical Figure",
            "birth_date": "1890-01-15",
            "death_date": "1960-06-20",
            "birth_place": "Test City",
            "nationality": "American",
            "occupation": ["Activist", "Writer"],
            "organizations": ["Test Organization"],
            "biography": "A detailed biography of this test historical figure who contributed significantly to labor movements and social justice causes.",
            "achievements": ["Founded organization", "Led major protest"]
        },
        "sources": [
            {
                "type": "academic",
                "title": "Biography of Test Figure",
                "author": "Historian Name"
            }
        ],
        "language": "en"
    }


@pytest.fixture
def sample_thread() -> dict:
    """Create sample discussion thread data."""
    return {
        "entity_type": "event",
        "entity_id": str(uuid4()),
        "title": "Discussion about Test Event",
        "initial_comment": "This is the initial comment starting a discussion about this historical event. What are your thoughts?",
        "tags": ["discussion", "history", "labor"]
    }


@pytest.fixture
def sample_comment() -> dict:
    """Create sample comment data."""
    return {
        "content": "This is a test comment contributing to the discussion with relevant historical context.",
        "parent_id": None
    }
