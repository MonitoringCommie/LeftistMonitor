"""
Lightweight mock API server for LeftistMonitor.
Serves all data from existing JSON files without needing PostgreSQL/Redis.
Run with: python3 mock_api.py
"""

import json
import math
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

# ---------- paths ----------
BASE = Path(__file__).resolve().parent.parent
DATA_FMT = BASE / "data" / "formatted"
DATA_GEN = BASE / "data" / "generated"
DATA_SCR = BASE / "data" / "scraped"
GLOBE_DIR = BASE / "frontend" / "public" / "globe"

# ---------- helpers ----------
def _uid(s) -> str:
    if s is None:
        s = "unknown"
    return str(uuid.uuid5(uuid.NAMESPACE_URL, str(s)))

def _load(p: Path):
    with open(p) as f:
        return json.load(f)

def _safe_int(v, default=None):
    if v is None:
        return default
    try:
        return int(v)
    except (ValueError, TypeError):
        return default

def _safe_float(v, default=None):
    if v is None:
        return default
    try:
        return float(v)
    except (ValueError, TypeError):
        return default

# ---------- load data ----------
print("Loading data...")

# Formatted data (curated, smaller)
conflicts_fmt = _load(DATA_FMT / "conflicts_formatted.json")
events_fmt = _load(DATA_FMT / "events_formatted.json")
ideologies_fmt = _load(DATA_FMT / "ideologies_formatted.json")
liberation_fmt = _load(DATA_FMT / "liberation_struggles_formatted.json")
cities_fmt = _load(DATA_FMT / "cities_formatted.json")

# Scraped data (large – limit for memory)
MAX_PEOPLE = 3000
MAX_BOOKS = 3000
MAX_ELECTIONS = 3000
MAX_PARTIES = 3000
MAX_CONFLICTS_SCR = 1000
MAX_EVENTS_SCR = 3000

_raw_people = _load(DATA_SCR / "people" / "all_people_comprehensive.json")[:MAX_PEOPLE]
_raw_books = _load(DATA_SCR / "books" / "all_books_comprehensive.json")[:MAX_BOOKS]
_raw_elections = _load(DATA_SCR / "elections" / "all_elections.json")[:MAX_ELECTIONS]
_raw_parties = _load(DATA_SCR / "elections" / "all_parties.json")[:MAX_PARTIES]
_raw_conflicts_scr = _load(DATA_SCR / "all_conflicts.json")[:MAX_CONFLICTS_SCR]
_raw_events_scr = _load(DATA_SCR / "events" / "all_events.json")[:MAX_EVENTS_SCR]

# Worldbank economic data
_raw_worldbank = _load(DATA_SCR / "economic" / "worldbank_combined.json")

# World Monitor live events (GDELT)
_live_events_path = BASE / "data" / "world_monitor_live_events.json"
_raw_live_events = []
if _live_events_path.exists():
    _live_data = _load(_live_events_path)
    _raw_live_events = _live_data.get("markers", [])

# Borders (TopoJSON)
borders_topo = _load(GLOBE_DIR / "countries-110m.json")

print(f"  Conflicts: {len(conflicts_fmt)} formatted, {len(_raw_conflicts_scr)} scraped")
print(f"  Live events: {len(_raw_live_events)} from world-monitor.com")
print(f"  Events:    {len(events_fmt)} formatted, {len(_raw_events_scr)} scraped")
print(f"  Ideologies: {len(ideologies_fmt)}")
print(f"  Liberation: {len(liberation_fmt)}")
print(f"  Cities:     {len(cities_fmt)}")
print(f"  People:     {len(_raw_people)}")
print(f"  Books:      {len(_raw_books)}")
print(f"  Elections:  {len(_raw_elections)}")
print(f"  Parties:    {len(_raw_parties)}")
print(f"  Worldbank:  {len(_raw_worldbank)} entries")

# ---------- transform data ----------

# People -> API format
people_data = []
for p in _raw_people:
    wid = p.get("wikidata_id") or p.get("name", "")
    cats = p.get("categories") or []
    if isinstance(cats, str):
        cats = [cats]
    cat = p.get("category", "")
    person_types = cats if cats else ([cat] if cat else [])
    position = p.get("position", "")
    ideology_tags = [position] if position else []
    people_data.append({
        "id": _uid(wid),
        "name": p.get("name", "Unknown"),
        "birth_date": p.get("birth_date"),
        "death_date": p.get("death_date"),
        "person_types": person_types,
        "ideology_tags": ideology_tags,
        "bio_short": p.get("description", ""),
        "image_url": None,
        "primary_country_id": None,
        "country": p.get("country", ""),
    })

# Books -> API format
books_data = []
book_types_set = set()
book_topics_set = set()
for b in _raw_books:
    wid = b.get("wikidata_id") or b.get("title", "")
    btype = b.get("category", "book")
    subj = b.get("subject", "")
    topics = [subj] if subj else []
    if btype:
        book_types_set.add(btype)
    for t in topics:
        if t:
            book_topics_set.add(t)
    pub_year = None
    py_raw = b.get("publication_year")
    if py_raw:
        try:
            pub_year = int(str(py_raw)[:4])
        except (ValueError, TypeError):
            pass
    author_name = b.get("author", "Unknown")
    books_data.append({
        "id": _uid(wid),
        "title": b.get("title", "Untitled"),
        "publication_year": pub_year,
        "publisher": b.get("publisher"),
        "book_type": btype,
        "topics": topics,
        "description": b.get("description", ""),
        "significance": None,
        "progressive_analysis": None,
        "marxists_archive_url": None,
        "gutenberg_url": None,
        "wikipedia_url": None,
        "cover_image_url": None,
        "authors": [{"id": _uid(author_name), "name": author_name, "role": "author"}],
    })

# Elections -> API format
elections_data = []
for e in _raw_elections:
    wid = e.get("wikidata_id") or e.get("name", "")
    elections_data.append({
        "id": _uid(wid),
        "name": e.get("name", ""),
        "country": e.get("country", ""),
        "country_id": _uid(e.get("country", "")),
        "date": e.get("date", ""),
        "election_type": e.get("election_type", "general"),
        "winner": e.get("winner"),
        "turnout": None,
    })

# Parties -> API format
parties_data = []
for pt in _raw_parties:
    wid = pt.get("wikidata_id") or pt.get("name", "")
    founded = None
    f_raw = pt.get("founded")
    if f_raw:
        try:
            founded = int(str(f_raw)[:4])
        except (ValueError, TypeError):
            pass
    parties_data.append({
        "id": _uid(wid),
        "name": pt.get("name", ""),
        "country": pt.get("country", ""),
        "ideology": pt.get("ideology", ""),
        "founded": founded,
        "description": pt.get("description", ""),
    })

# Worldbank -> country stats & country list
country_stats = []
countries_list = []
for wb in _raw_worldbank:
    code = wb.get("country_code", "")
    name = wb.get("country_name", "")
    data = wb.get("data", {})
    if not name or len(code) != 3:
        continue
    gdp = None
    pop = None
    mil = None
    for year in sorted(data.keys(), reverse=True):
        yd = data[year]
        if gdp is None and yd.get("gdp_current_usd"):
            gdp = yd["gdp_current_usd"]
        if pop is None and yd.get("population"):
            pop = yd["population"]
        if mil is None and yd.get("military_spending_gdp_pct"):
            mil = yd["military_spending_gdp_pct"]
        if gdp and pop and mil:
            break
    country_stats.append({
        "id": _uid(code),
        "name": name,
        "iso_alpha3": code,
        "gdp": gdp,
        "population": _safe_int(pop),
        "military_spending_pct": _safe_float(mil),
    })
    countries_list.append({
        "id": _uid(code),
        "name_en": name,
        "name_native": None,
        "iso_alpha2": None,
        "iso_alpha3": code,
        "entity_type": "sovereign_state",
        "valid_from": "1900-01-01",
        "valid_to": None,
        "wikidata_id": None,
    })

countries_list.sort(key=lambda c: c["name_en"])
country_stats.sort(key=lambda c: c["name"])

# Conflicts (scraped) -> API format
conflicts_scr = []
for c in _raw_conflicts_scr:
    wid = c.get("wikidata_id") or c.get("name", "")
    conflicts_scr.append({
        "id": _uid(wid),
        "name": c.get("name", ""),
        "start_date": c.get("start_date"),
        "end_date": c.get("end_date"),
        "conflict_type": c.get("conflict_type", "armed_conflict"),
        "intensity": "major",
        "location": c.get("location", ""),
        "description": c.get("description", ""),
        "casualties": c.get("casualties"),
        "countries": [],
    })

# Events (scraped) -> API format
events_scr = []
for ev in _raw_events_scr:
    wid = ev.get("wikidata_id") or ev.get("title", "")
    cats = ev.get("categories") or []
    if isinstance(cats, str):
        cats = [cats]
    events_scr.append({
        "id": _uid(wid),
        "title": ev.get("title", ""),
        "start_date": ev.get("start_date"),
        "end_date": ev.get("end_date"),
        "category": cats[0] if cats else "political",
        "event_type": cats[1] if len(cats) > 1 else "event",
        "location_name": ev.get("location", ev.get("country", "")),
        "location": None,
        "importance": 5,
        "description": ev.get("description", ""),
        "tags": cats,
        "country": ev.get("country", ""),
    })

# Globe data transforms
globe_cities = []
for c in cities_fmt:
    loc = c.get("location", {})
    coords = loc.get("coordinates", [0, 0]) if isinstance(loc, dict) else [0, 0]
    globe_cities.append({
        "id": c.get("id", _uid(c.get("name", ""))),
        "name": c.get("name", ""),
        "country": c.get("country", ""),
        "lat": coords[1] if len(coords) > 1 else 0,
        "lng": coords[0] if len(coords) > 0 else 0,
        "population": c.get("population"),
        "importance": c.get("importance", 5),
        "tags": c.get("tags", []),
    })

globe_conflicts = []
for c in conflicts_fmt:
    cities = c.get("cities", [])
    lat = cities[0]["lat"] if cities else 0
    lng = cities[0]["lng"] if cities else 0
    globe_conflicts.append({
        "id": c.get("id", ""),
        "name": c.get("name", ""),
        "start_date": c.get("start_date"),
        "end_date": c.get("end_date"),
        "conflict_type": c.get("conflict_type", "armed_conflict"),
        "intensity": c.get("intensity", "major"),
        "casualties_low": c.get("casualties_low"),
        "casualties_high": c.get("casualties_high"),
        "lat": lat,
        "lng": lng,
        "cities": cities,
    })

# Search index
_search_items = []
for p in people_data:
    _search_items.append({"id": p["id"], "type": "person", "title": p["name"], "subtitle": (p.get("bio_short") or "")[:80], "year": _safe_int(str(p.get("birth_date", "") or "")[:4]), "name_lower": (p["name"] or "").lower()})
for b in books_data:
    _search_items.append({"id": b["id"], "type": "book", "title": b["title"], "subtitle": (b.get("authors", [{}])[0].get("name", "")), "year": b.get("publication_year"), "name_lower": (b["title"] or "").lower()})
for c in conflicts_fmt:
    _search_items.append({"id": c["id"], "type": "conflict", "title": c["name"], "subtitle": c.get("conflict_type", ""), "year": _safe_int(str(c.get("start_date", "") or "")[:4]), "name_lower": (c["name"] or "").lower()})
for ev in events_fmt:
    _search_items.append({"id": ev["id"], "type": "event", "title": ev["title"], "subtitle": ev.get("location_name", ""), "year": _safe_int(str(ev.get("start_date", "") or "")[:4]), "name_lower": (ev["title"] or "").lower()})

print(f"  Search index: {len(_search_items)} items")
print("Data loaded.\n")

# ================================================================
# FastAPI app
# ================================================================
app = FastAPI(title="Leftist Monitor API", version="1.0.0-mock")
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- root & health ----------
@app.get("/")
def root():
    return {"name": "Leftist Monitor API", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok", "mode": "mock", "data_loaded": True}

# ---------- stats ----------
@app.get("/api/v1/stats/overview")
def stats_overview():
    return {
        "countries": len(countries_list),
        "books": len(books_data),
        "people": len(people_data),
        "events": len(events_fmt) + len(events_scr),
        "conflicts": len(conflicts_fmt) + len(conflicts_scr),
        "elections": len(elections_data),
    }

# ---------- people ----------
@app.get("/api/v1/people/people")
def list_people(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    person_type: Optional[str] = None,
    search: Optional[str] = None,
):
    filtered = people_data
    if search:
        q = search.lower()
        filtered = [p for p in filtered if q in (p["name"] or "").lower() or q in (p["bio_short"] or "").lower()]
    if person_type:
        pt = person_type.lower()
        filtered = [p for p in filtered if any(pt in (t or "").lower() for t in p.get("person_types", []))]
    total = len(filtered)
    pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    items = filtered[start : start + per_page]
    return {"items": items, "total": total, "page": page, "per_page": per_page, "pages": pages}

@app.get("/api/v1/people/{person_id}")
def get_person(person_id: str):
    for p in people_data:
        if p["id"] == person_id:
            return p
    return {"error": "Not found"}

# ---------- books ----------
@app.get("/api/v1/books")
def list_books(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    book_type: Optional[str] = None,
    topic: Optional[str] = None,
    search: Optional[str] = None,
):
    filtered = books_data
    if search:
        q = search.lower()
        filtered = [b for b in filtered if q in (b["title"] or "").lower() or q in (b["description"] or "").lower()]
    if book_type:
        bt = book_type.lower()
        filtered = [b for b in filtered if (b.get("book_type") or "").lower() == bt]
    if topic:
        tp = topic.lower()
        filtered = [b for b in filtered if any(tp in (t or "").lower() for t in b.get("topics", []))]
    return filtered[skip : skip + limit]

@app.get("/api/v1/books/types")
def book_types():
    return {"types": sorted(book_types_set)}

@app.get("/api/v1/books/topics")
def book_topics():
    return {"topics": sorted(book_topics_set)}

@app.get("/api/v1/books/{book_id}")
def get_book(book_id: str):
    for b in books_data:
        if b["id"] == book_id:
            return b
    return {"error": "Not found"}

# ---------- politics ----------
@app.get("/api/v1/politics/elections")
def list_elections(limit: int = Query(100, ge=1, le=1000)):
    return elections_data[:limit]

@app.get("/api/v1/politics/parties")
def list_parties(limit: int = Query(100, ge=1, le=1000), search: Optional[str] = None):
    filtered = parties_data
    if search:
        q = search.lower()
        filtered = [p for p in filtered if q in (p["name"] or "").lower()]
    return filtered[:limit]

@app.get("/api/v1/politics/ideologies")
def list_ideologies():
    return ideologies_fmt

@app.get("/api/v1/politics/countries/{country_id}/parties")
def country_parties(country_id: str, page: int = 1, per_page: int = 50):
    country_name = None
    for c in countries_list:
        if c["id"] == country_id:
            country_name = c["name_en"]
            break
    if not country_name:
        return {"items": [], "total": 0, "page": 1, "per_page": per_page, "pages": 0}
    cn = country_name.lower()
    filtered = [p for p in parties_data if cn in (p.get("country") or "").lower()]
    total = len(filtered)
    pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    return {"items": filtered[start:start+per_page], "total": total, "page": page, "per_page": per_page, "pages": pages}

@app.get("/api/v1/politics/countries/{country_id}/elections")
def country_elections(country_id: str, page: int = 1, per_page: int = 50):
    country_name = None
    for c in countries_list:
        if c["id"] == country_id:
            country_name = c["name_en"]
            break
    if not country_name:
        return {"items": [], "total": 0, "page": 1, "per_page": per_page, "pages": 0}
    cn = country_name.lower()
    filtered = [e for e in elections_data if cn in (e.get("country") or "").lower()]
    total = len(filtered)
    pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    return {"items": filtered[start:start+per_page], "total": total, "page": page, "per_page": per_page, "pages": pages}

# ---------- geography ----------
@app.get("/api/v1/geography/countries/stats")
def country_stats_endpoint():
    return country_stats

@app.get("/api/v1/geography/countries")
def list_countries(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    year: Optional[int] = None,
):
    filtered = countries_list
    if search:
        q = search.lower()
        filtered = [c for c in filtered if q in (c["name_en"] or "").lower()]
    total = len(filtered)
    pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    return {"items": filtered[start:start+per_page], "total": total, "page": page, "per_page": per_page, "pages": pages}

@app.get("/api/v1/geography/countries/{country_id}")
def get_country(country_id: str):
    for c in countries_list:
        if c["id"] == country_id:
            return c
    return {"error": "Not found"}

@app.get("/api/v1/geography/countries/{country_id}/borders")
def country_borders(country_id: str, year: Optional[int] = None):
    return {"type": "FeatureCollection", "features": []}

@app.get("/api/v1/geography/borders/all")
def all_borders():
    return borders_topo

@app.get("/api/v1/geography/borders/geojson")
def borders_geojson(year: Optional[int] = None):
    return {"type": "FeatureCollection", "features": []}

@app.get("/api/v1/geography/relationships")
def country_relationships(year: Optional[int] = None, relationship_type: Optional[str] = None):
    return []

# ---------- conflicts ----------
@app.get("/api/v1/conflicts/active")
def active_conflicts(year: Optional[int] = None):
    if year is None:
        return conflicts_fmt
    results = []
    for c in conflicts_fmt:
        sd = c.get("start_date", "")
        ed = c.get("end_date", "")
        sy = _safe_int(str(sd)[:4], 0)
        ey = _safe_int(str(ed)[:4], 9999) if ed else 9999
        if sy <= year <= ey:
            results.append(c)
    return results

@app.get("/api/v1/conflicts/all")
def all_conflicts():
    return conflicts_fmt + conflicts_scr[:200]

@app.get("/api/v1/conflicts/{conflict_id}")
def get_conflict(conflict_id: str):
    for c in conflicts_fmt:
        if c["id"] == conflict_id:
            return c
    for c in conflicts_scr:
        if c["id"] == conflict_id:
            return c
    return {"error": "Not found"}

@app.get("/api/v1/conflicts/{conflict_id}/coordinates")
def conflict_coordinates(conflict_id: str):
    for c in conflicts_fmt:
        if c["id"] == conflict_id:
            return c.get("cities", [])
    return []

# ---------- events ----------
@app.get("/api/v1/events")
@app.get("/api/v1/events/events")
def list_events(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    search: Optional[str] = None,
    category: Optional[str] = None,
):
    combined = list(events_fmt) + list(events_scr)
    if search:
        q = search.lower()
        combined = [e for e in combined if q in (e.get("title", "") or "").lower() or q in (e.get("description", "") or "").lower()]
    if category:
        cat = category.lower()
        combined = [e for e in combined if cat in (e.get("category", "") or "").lower()]
    total = len(combined)
    pages = max(1, math.ceil(total / per_page))
    start = (page - 1) * per_page
    return {"items": combined[start:start+per_page], "total": total, "page": page, "per_page": per_page, "pages": pages}

@app.get("/api/v1/events/{event_id}")
def get_event(event_id: str):
    for ev in events_fmt:
        if ev.get("id") == event_id:
            return ev
    for ev in events_scr:
        if ev.get("id") == event_id:
            return ev
    return {"error": "Not found"}

@app.get("/api/v1/events/global/year/{year}")
def events_by_year(year: int):
    results = []
    for ev in events_fmt:
        sd = str(ev.get("start_date", "") or "")[:4]
        if _safe_int(sd) == year:
            results.append(ev)
    return results

@app.get("/api/v1/events/countries/{country_id}/timeline")
def country_timeline(country_id: str):
    return {"events": [], "elections": [], "conflicts": []}

# ---------- globe ----------
@app.get("/api/v1/globe/cities")
def globe_cities_endpoint():
    return globe_cities

@app.get("/api/v1/globe/conflicts/active")
def globe_active_conflicts(year: Optional[int] = None):
    return globe_conflicts

@app.get("/api/v1/globe/events/year")
def globe_events_year(year: Optional[int] = None):
    return events_fmt[:20]

@app.get("/api/v1/globe/heatmap")
def globe_heatmap():
    points = []
    for c in globe_conflicts:
        if c.get("lat") and c.get("lng"):
            points.append({"lat": c["lat"], "lng": c["lng"], "intensity": 0.8, "type": "conflict"})
    return points

@app.get("/api/v1/globe/liberation-data")
def globe_liberation():
    return liberation_fmt

# ---------- live events (world-monitor.com / GDELT) ----------
@app.get("/api/v1/live/events")
def live_events(
    event_type: Optional[str] = None,
    severity: Optional[int] = None,
    country: Optional[str] = None,
    limit: int = Query(200, ge=1, le=1000),
):
    filtered = _raw_live_events
    if event_type:
        filtered = [e for e in filtered if e.get("type") == event_type]
    if severity is not None:
        filtered = [e for e in filtered if e.get("severity") == severity]
    if country:
        c = country.lower()
        filtered = [e for e in filtered if c in (e.get("country") or "").lower()]
    return {
        "markers": filtered[:limit],
        "count": len(filtered),
        "total": len(_raw_live_events),
        "source": "world-monitor.com / GDELT",
    }

@app.get("/api/v1/live/stats")
def live_stats():
    from collections import Counter
    types = Counter(e.get("type") for e in _raw_live_events)
    severities = Counter(e.get("severity") for e in _raw_live_events)
    countries = Counter(e.get("country") for e in _raw_live_events)
    return {
        "total_events": len(_raw_live_events),
        "by_type": dict(types),
        "by_severity": dict(severities),
        "top_countries": dict(countries.most_common(20)),
    }

# ---------- search ----------
@app.get("/api/v1/search")
@app.get("/api/v1/search/")
def search_endpoint(
    q: str = Query("", min_length=0),
    types: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
):
    if not q:
        return {"query": q, "total": 0, "cached": False, "results": []}
    query = q.lower()
    type_filter = set(types.split(",")) if types else None
    results = []
    for item in _search_items:
        if type_filter and item["type"] not in type_filter:
            continue
        nl = item["name_lower"]
        if query in nl:
            score = 1.0 if nl.startswith(query) else 0.7 if query == nl else 0.5
            results.append({
                "id": item["id"],
                "type": item["type"],
                "title": item["title"],
                "subtitle": item.get("subtitle", ""),
                "year": item.get("year"),
                "score": score,
            })
    results.sort(key=lambda r: -r["score"])
    results = results[:limit]
    return {"query": q, "total": len(results), "cached": False, "results": results}

@app.get("/api/v1/search/suggest")
def search_suggest(q: str = Query("")):
    if not q or len(q) < 2:
        return []
    query = q.lower()
    suggestions = []
    for item in _search_items:
        if query in item["name_lower"]:
            suggestions.append({"text": item["title"], "type": item["type"]})
            if len(suggestions) >= 10:
                break
    return suggestions

# ---------- frontlines ----------
@app.get("/api/v1/frontlines/conflicts-with-frontlines")
def frontlines_conflicts():
    results = []
    for c in conflicts_fmt:
        if c.get("cities"):
            results.append({
                "id": c["id"],
                "name": c["name"],
                "start_date": c.get("start_date"),
                "end_date": c.get("end_date"),
                "conflict_type": c.get("conflict_type", ""),
                "first_frontline_date": c.get("start_date"),
                "last_frontline_date": c.get("end_date"),
                "frontline_dates_count": 1,
            })
    return results

@app.get("/api/v1/frontlines/{conflict_id}/dates")
def frontlines_dates(conflict_id: str):
    for c in conflicts_fmt:
        if c["id"] == conflict_id:
            return [{"date": c.get("start_date", "2024-01-01"), "sides": ["Side A", "Side B"]}]
    return []

@app.get("/api/v1/frontlines/{conflict_id}/geojson")
def frontlines_geojson(conflict_id: str, target_date: Optional[str] = None):
    return {"type": "FeatureCollection", "features": []}

@app.get("/api/v1/frontlines/{conflict_id}/timeline")
def frontlines_timeline(conflict_id: str):
    for c in conflicts_fmt:
        if c["id"] == conflict_id:
            return {
                "conflict": {"id": c["id"], "name": c["name"], "start_date": c.get("start_date"), "end_date": c.get("end_date")},
                "timeline": [],
            }
    return {"conflict": None, "timeline": []}

# ---------- territories / liberation ----------
@app.get("/api/v1/territories/occupations")
def territories_occupations():
    results = []
    for lib in liberation_fmt:
        results.append({
            "id": lib["id"],
            "name": lib["name"],
            "start_year": lib.get("start_year"),
            "status": lib.get("status", "ongoing"),
            "description": lib.get("description", ""),
        })
    return results

@app.get("/api/v1/territories/resistance-movements")
def territories_resistance():
    results = []
    for lib in liberation_fmt:
        for org in lib.get("organizations", []):
            if isinstance(org, str):
                results.append({"id": _uid(org), "name": org, "struggle": lib["name"]})
            elif isinstance(org, dict):
                results.append({"id": _uid(org.get("name", "")), "name": org.get("name", ""), "struggle": lib["name"]})
    return results

@app.get("/api/v1/territories/liberation/combined")
def liberation_combined(region: Optional[str] = None):
    if region:
        r = region.lower()
        return [l for l in liberation_fmt if r in (l.get("slug", "") or "").lower() or r in (l.get("name", "") or "").lower()]
    return liberation_fmt

@app.get("/api/v1/territories/palestine/{path:path}")
@app.get("/api/v1/territories/ireland/{path:path}")
@app.get("/api/v1/territories/kashmir/{path:path}")
@app.get("/api/v1/territories/tibet/{path:path}")
@app.get("/api/v1/territories/kurdistan/{path:path}")
@app.get("/api/v1/territories/western-sahara/{path:path}")
@app.get("/api/v1/territories/west-papua/{path:path}")
def territory_geojson(path: str = ""):
    if "summary" in path:
        return {"total_events": 0, "regions": [], "description": "Data loading..."}
    return {"type": "FeatureCollection", "features": []}

# ---------- labor ----------
@app.get("/api/v1/labor/organizations")
def labor_organizations(country: Optional[str] = None):
    return []

@app.get("/api/v1/labor/strikes")
def labor_strikes():
    return []

@app.get("/api/v1/labor/statistics")
def labor_stats():
    return {"organizations_by_type": {}, "strikes_by_outcome": {}, "strikes_by_year": {}}

# ---------- media ----------
@app.get("/api/v1/media")
def list_media():
    return []

@app.get("/api/v1/media/documentaries/recommended")
def recommended_docs():
    return []

# ---------- research ----------
@app.get("/api/v1/research/pathways")
def research_pathways():
    return []

@app.get("/api/v1/research/collections")
def research_collections():
    return []

# ---------- auth (stub) ----------
@app.post("/api/v1/auth/login")
def auth_login():
    return {"error": "Auth not available in mock mode"}

@app.post("/api/v1/auth/register")
def auth_register():
    return {"error": "Auth not available in mock mode"}

@app.get("/api/v1/auth/me")
def auth_me():
    return {"error": "Not authenticated"}

# ---------- admin (stub) ----------
@app.get("/api/v1/admin/stats")
def admin_stats():
    return {
        "total_books": len(books_data),
        "total_people": len(people_data),
        "total_events": len(events_fmt) + len(events_scr),
        "total_conflicts": len(conflicts_fmt) + len(conflicts_scr),
        "total_users": 0,
    }

# ---------- economic ----------
@app.get("/api/v1/geography/countries/{country_id}/economic/gdp")
def country_gdp(country_id: str):
    for c in countries_list:
        if c["id"] == country_id:
            code = c.get("iso_alpha3", "")
            for wb in _raw_worldbank:
                if wb.get("country_code") == code:
                    data = wb.get("data", {})
                    result = []
                    for year in sorted(data.keys()):
                        yd = data[year]
                        if yd.get("gdp_current_usd"):
                            result.append({"year": int(year), "gdp": yd["gdp_current_usd"], "growth_rate": yd.get("gdp_growth")})
                    return result
    return []

@app.get("/api/v1/geography/countries/{country_id}/economic/overview")
def country_economic_overview(country_id: str):
    for c in countries_list:
        if c["id"] == country_id:
            code = c.get("iso_alpha3", "")
            for wb in _raw_worldbank:
                if wb.get("country_code") == code:
                    data = wb.get("data", {})
                    for year in sorted(data.keys(), reverse=True):
                        yd = data[year]
                        if yd.get("gdp_current_usd"):
                            return {
                                "year": int(year),
                                "gdp": yd.get("gdp_current_usd"),
                                "gdp_per_capita": yd.get("gdp_per_capita"),
                                "gdp_growth": yd.get("gdp_growth"),
                                "inflation": yd.get("inflation"),
                                "unemployment": yd.get("unemployment"),
                                "population": yd.get("population"),
                            }
    return {}

@app.get("/api/v1/geography/countries/{country_id}/demographics/population")
def country_population(country_id: str):
    for c in countries_list:
        if c["id"] == country_id:
            code = c.get("iso_alpha3", "")
            for wb in _raw_worldbank:
                if wb.get("country_code") == code:
                    data = wb.get("data", {})
                    result = []
                    for year in sorted(data.keys()):
                        yd = data[year]
                        if yd.get("population"):
                            result.append({"year": int(year), "population": int(yd["population"])})
                    return result
    return []

@app.get("/api/v1/geography/countries/{country_id}/economic/military")
def country_military(country_id: str):
    for c in countries_list:
        if c["id"] == country_id:
            code = c.get("iso_alpha3", "")
            for wb in _raw_worldbank:
                if wb.get("country_code") == code:
                    data = wb.get("data", {})
                    result = []
                    for year in sorted(data.keys()):
                        yd = data[year]
                        if yd.get("military_spending_gdp_pct"):
                            result.append({"year": int(year), "military_spending_pct": yd["military_spending_gdp_pct"]})
                    return result
    return []

@app.get("/api/v1/geography/countries/{country_id}/economic/budget")
def country_budget(country_id: str):
    for c in countries_list:
        if c["id"] == country_id:
            code = c.get("iso_alpha3", "")
            for wb in _raw_worldbank:
                if wb.get("country_code") == code:
                    data = wb.get("data", {})
                    for year in sorted(data.keys(), reverse=True):
                        yd = data[year]
                        return {
                            "year": int(year),
                            "health_pct": yd.get("health_spending_gdp_pct"),
                            "education_pct": yd.get("education_spending_gdp_pct"),
                            "military_pct": yd.get("military_spending_gdp_pct"),
                        }
    return {}


# ================================================================
if __name__ == "__main__":
    import uvicorn
    print("\n  Starting Leftist Monitor Mock API on http://localhost:8000")
    print("   Serving data from JSON files (no database required)\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
