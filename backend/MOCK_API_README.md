# LeftistMonitor Mock API Server

A comprehensive, production-quality FastAPI mock server that loads all JSON data files and serves them through the exact endpoints the frontend expects. **Works WITHOUT PostgreSQL, Redis, or any database.**

## Overview

This mock API server (`mock_api.py`) provides a complete working API for the LeftistMonitor frontend. It:

- Loads all JSON data files from `/data/` on startup
- Serves 40+ endpoints matching the frontend's API expectations
- Implements CORS for localhost:5173 and localhost:5174
- Supports pagination, filtering, and search
- Generates deterministic UUIDs for consistency
- Handles large datasets efficiently by limiting initial loads (2000 people, 2000 books, 500 large conflicts, etc.)

## Quick Start

### Prerequisites

Python 3.11+ with FastAPI, Uvicorn, and Pydantic already installed (via `pyproject.toml`).

### Running the Server

```bash
cd /sessions/peaceful-practical-mayer/mnt/LeftistMonitor/backend

# Run directly with Python
python3 mock_api.py

# Or use uvicorn directly
uvicorn mock_api:app --host 0.0.0.0 --port 8000 --reload
```

The API will start loading data (takes a few seconds) and be available at:
- **API**: http://localhost:8000
- **Health check**: http://localhost:8000/health
- **API endpoints**: http://localhost:8000/api/v1/*

### Frontend Integration

The frontend runs on `localhost:5173` and proxies `/api/*` requests to `localhost:8000/api/v1`. This is configured in the Vite dev server.

## Data Files Loaded

All data is loaded from `/sessions/peaceful-practical-mayer/mnt/LeftistMonitor/data/`:

| File | Type | Count | Usage |
|------|------|-------|-------|
| `formatted/conflicts_formatted.json` | Formatted | 23 | Full conflicts data |
| `formatted/events_formatted.json` | Formatted | 80 | Full events data |
| `formatted/ideologies_formatted.json` | Formatted | 44 | Full ideologies data |
| `formatted/liberation_struggles_formatted.json` | Formatted | 10 | Full liberation struggles |
| `formatted/cities_formatted.json` | Formatted | 437 | Full cities for globe |
| `scraped/people/all_people_comprehensive.json` | Scraped | 2000 (of 76K) | People (first 2000 for performance) |
| `scraped/books/all_books_comprehensive.json` | Scraped | 2000 (of 18K) | Books (first 2000 for performance) |
| `scraped/elections/all_elections.json` | Scraped | 2000 (of 30K) | Elections (first 2000) |
| `scraped/elections/all_parties.json` | Scraped | 2000 (of 20K) | Parties (first 2000) |
| `scraped/all_conflicts.json` | Scraped | 500 (of 21K) | Large conflicts (first 500) |
| `scraped/economic/worldbank_combined.json` | Scraped | 266 | World Bank economic data |
| `frontend/public/globe/countries-110m.json` | TopoJSON | 1 | GeoJSON borders for globe |

## API Endpoints

### Health & Status

- `GET /health` - Health check
- `GET /` - API info

### Stats

- `GET /api/v1/stats/overview` - Overview statistics

### People

- `GET /api/v1/people/people` - Paginated people list with filtering
- `GET /api/v1/people/countries/{country_id}/people` - People by country
- `GET /api/v1/people/people/{person_id}` - Single person details

### Books

- `GET /api/v1/books` - Books list (array, not paginated)
- `GET /api/v1/books/types` - Unique book types
- `GET /api/v1/books/topics` - Unique book topics
- `GET /api/v1/people/countries/{country_id}/books` - Books by country
- `GET /api/v1/people/books/{book_id}` - Single book details

### Politics

- `GET /api/v1/politics/ideologies` - All ideologies
- `GET /api/v1/politics/elections` - Elections list
- `GET /api/v1/politics/parties` - Parties list
- `GET /api/v1/politics/countries/{country_id}/elections` - Elections by country
- `GET /api/v1/politics/countries/{country_id}/parties` - Parties by country
- `GET /api/v1/politics/elections/{election_id}` - Single election details
- `GET /api/v1/politics/parties/{party_id}` - Single party details

### Geography

- `GET /api/v1/geography/countries` - Paginated countries list
- `GET /api/v1/geography/countries/{country_id}` - Country details
- `GET /api/v1/geography/countries/stats` - Country statistics
- `GET /api/v1/geography/borders/all` - All borders as GeoJSON
- `GET /api/v1/geography/borders/geojson` - Borders for specific year

### Conflicts

- `GET /api/v1/conflicts/active` - Active conflicts (with optional year filter)
- `GET /api/v1/conflicts/all` - All conflicts

### Events

- `GET /api/v1/events/events` - All events
- `GET /api/v1/events/` - Alternative events endpoint

### Globe

- `GET /api/v1/globe/cities` - Cities for globe visualization
- `GET /api/v1/globe/conflicts/active` - Active conflicts for globe
- `GET /api/v1/globe/liberation-data` - Liberation struggles

### Search

- `GET /api/v1/search/` - Cross-dataset search with filtering

### Frontlines (Stub)

- `GET /api/v1/frontlines/conflicts-with-frontlines` - Returns empty array
- `GET /api/v1/frontlines/{conflict_id}/dates` - Returns empty array
- `GET /api/v1/frontlines/{conflict_id}/geojson` - Returns empty GeoJSON
- `GET /api/v1/frontlines/{conflict_id}/timeline` - Returns empty array

### Territories (Stub)

- `GET /api/v1/territories/occupations` - Returns empty array
- `GET /api/v1/territories/resistance-movements` - Returns empty array
- `GET /api/v1/territories/palestine/nakba-villages/geojson` - Returns empty GeoJSON
- `GET /api/v1/territories/palestine/settlements/geojson` - Returns empty GeoJSON

## Response Format Examples

### Paginated Response (People)
```json
{
  "items": [
    {
      "id": "e1c67d71-...",
      "name": "Karl Marx",
      "birth_date": "1818-05-05",
      "death_date": "1883-03-14",
      "person_types": ["revolutionary", "theorist"],
      "ideology_tags": ["marxism"],
      "bio_short": "German philosopher...",
      "image_url": null,
      "primary_country_id": null
    }
  ],
  "total": 2000,
  "page": 1,
  "per_page": 50,
  "pages": 40
}
```

### Books Array Response
```json
[
  {
    "id": "ae52a39e-...",
    "title": "The Communist Manifesto",
    "publication_year": 1848,
    "publisher": "Outlook Verlag",
    "book_type": "manifesto",
    "topics": ["communism", "marxism"],
    "description": "Political pamphlet...",
    "authors": [
      {"id": "...", "name": "Karl Marx", "role": "author"}
    ]
  }
]
```

### Country Stats Response
```json
[
  {
    "id": "USA",
    "name": "United States",
    "iso_alpha3": "USA",
    "gdp": 27360000000000,
    "population": 331900000,
    "military_spending_pct": 3.73
  }
]
```

### Search Response
```json
{
  "query": "marx",
  "total": 5,
  "cached": false,
  "results": [
    {
      "id": "e1c67d71-...",
      "type": "person",
      "title": "Karl Marx",
      "subtitle": "German philosopher",
      "year": 1818,
      "score": 1.0
    }
  ]
}
```

## Key Features

### Data Loading
- Efficient startup with `DataCache` class
- Prints loading progress and final statistics
- Loads limited subsets of large datasets to prevent memory bloat
- Falls back gracefully if files are missing

### UUID Generation
- Uses deterministic `uuid.uuid5(uuid.NAMESPACE_URL, wikidata_id)` for consistency
- Ensures same ID is generated every time the server starts
- Frontend can save/share IDs reliably

### Filtering & Search
- Case-insensitive substring matching for search
- Filter by type, category, topic, country, year
- Pagination support (page, per_page parameters)
- Search across multiple data types simultaneously

### CORS Configuration
- Allows `http://localhost:5173` (frontend dev)
- Allows `http://localhost:5174` (alternate port)
- Supports credentials and all HTTP methods

### Error Handling
- Returns 404 for missing resources
- Gracefully handles missing/null fields
- Validates pagination parameters
- Detailed error messages in responses

## Performance Considerations

### Memory
- People: Limited to first 2000 (of 76K total)
- Books: Limited to first 2000 (of 18K total)
- Elections: Limited to first 2000 (of 30K total)
- Parties: Limited to first 2000 (of 20K total)
- Conflicts: Limited to first 500 (of 21K total)
- **Total memory usage**: ~200-300 MB

### Response Time
- All data loaded in memory at startup (~5 seconds)
- Subsequent requests are instant (< 10ms)
- GZip compression enabled for responses
- No database queries or network latency

### Scalability
- For production: Load data in a background task or scheduled job
- Consider implementing Redis caching for expensive operations
- Implement database backend for unlimited datasets
- Add batch/bulk endpoints for large result sets

## Startup Output

```
============================================================
TESTING DATA LOADING
============================================================
Loading LeftistMonitor data files...
  Loading formatted conflicts...
  Loading formatted events...
  Loading formatted ideologies...
  Loading formatted liberation struggles...
  Loading formatted cities...
  Loading people (first 2000)...
  Loading books (first 2000)...
  Loading elections (first 2000)...
  Loading parties (first 2000)...
  Loading large conflicts (first 500)...
  Loading WorldBank economic data...
  Loading borders GeoJSON...
✓ Loaded 23 conflicts
✓ Loaded 80 events
✓ Loaded 44 ideologies
✓ Loaded 10 liberation struggles
✓ Loaded 437 cities
✓ Loaded 2000 people
✓ Loaded 2000 books
✓ Loaded 2000 elections
✓ Loaded 2000 parties
✓ Loaded 500 large conflicts
✓ Loaded 266 countries (WorldBank)

✓ All data loaded successfully!
```

## Troubleshooting

### "ModuleNotFoundError: No module named 'fastapi'"
```bash
cd /sessions/peaceful-practical-mayer/mnt/LeftistMonitor/backend
pip install -e .
```

### "FileNotFoundError: [Errno 2] No such file or directory"
Ensure you're running the script from the correct directory or use absolute paths. The data paths are hardcoded to the expected locations.

### CORS errors in frontend
Verify that:
1. Frontend is running on `localhost:5173`
2. Backend is running on `localhost:8000`
3. Frontend's vite config proxies `/api` to `http://localhost:8000`

### Slow startup
First startup loads data from disk (~5 seconds). Subsequent requests are instant. If still slow:
1. Check disk I/O: `iostat -x 1`
2. Check memory: `free -h`
3. Reduce dataset limits in `cache.load()` method

## Code Structure

```
mock_api.py
├── Imports & Configuration (FastAPI setup, CORS, GZip)
├── Data paths configuration
├── Pydantic models (for validation & serialization)
├── Data loading utilities (load_json, generate_uuid, etc.)
├── DataCache class (in-memory data store)
│   └── load() method (loads all data on startup)
├── Route handlers (organized by domain)
│   ├── Health/Status
│   ├── Stats
│   ├── People
│   ├── Books
│   ├── Politics
│   ├── Geography
│   ├── Conflicts
│   ├── Events
│   ├── Globe
│   ├── Search
│   ├── Frontlines
│   ├── Territories
│   └── Compatibility endpoints
└── Server startup
```

## Next Steps

To upgrade from mock API to real database:

1. **Replace DataCache**: Implement database queries instead of in-memory loading
2. **Add async database calls**: Use SQLAlchemy async driver
3. **Implement caching**: Add Redis or FastAPI caching decorators
4. **Add real-time updates**: Implement WebSockets for live data
5. **Add authentication**: Implement JWT or OAuth2
6. **Add rate limiting**: Use slowapi or ratelimit middleware
7. **Add logging**: Configure structlog for production logging

## License

Part of the LeftistMonitor project.
