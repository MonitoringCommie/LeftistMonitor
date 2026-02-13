"""Conflicts API routes."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import date

from ..database import get_db
from ..core.pagination import PaginatedResponse
from ..core.exceptions import NotFoundError
from pydantic import BaseModel

router = APIRouter()


class ConflictParticipantItem(BaseModel):
    country_id: Optional[str] = None
    name: str
    side: str
    
    class Config:
        from_attributes = True


class ConflictMapItem(BaseModel):
    id: str
    name: str
    start_date: Optional[str]
    end_date: Optional[str]
    conflict_type: Optional[str]
    intensity: Optional[str]
    countries: list[ConflictParticipantItem]
    lat: Optional[float] = None  # Average latitude of conflict zone
    lng: Optional[float] = None  # Average longitude of conflict zone

    class Config:
        from_attributes = True


def _build_conflict_response(conflict, country_names: dict) -> ConflictMapItem:
    """Build a ConflictMapItem from a Conflict with pre-loaded participants."""
    from ..geography.cities import WORLD_CITIES

    countries = []
    country_list = []
    for p in conflict.participants:
        country_name = country_names.get(p.country_id) if p.country_id else None
        countries.append(ConflictParticipantItem(
            country_id=str(p.country_id) if p.country_id else None,
            name=country_name or p.actor_name or "Unknown",
            side=p.side,
        ))
        if country_name:
            country_list.append(country_name)

    # Get coordinates from participating countries' cities
    lat = None
    lng = None
    coords = []
    for city in WORLD_CITIES:
        if city["country"] in country_list:
            coords.append((city["lat"], city["lng"]))

    if coords:
        lat = sum(c[0] for c in coords) / len(coords)
        lng = sum(c[1] for c in coords) / len(coords)

    # Fallback: extract location from conflict name when no participant data
    if lat is None and conflict.name:
        lat, lng = _geocode_conflict_name(conflict.name, WORLD_CITIES)

    return ConflictMapItem(
        id=str(conflict.id),
        name=conflict.name,
        start_date=conflict.start_date.isoformat() if conflict.start_date else None,
        end_date=conflict.end_date.isoformat() if conflict.end_date else None,
        conflict_type=conflict.conflict_type,
        intensity=conflict.intensity,
        countries=countries,
        lat=lat,
        lng=lng,
    )


# Pre-built lookup caches (populated once on first call)
_country_lookup: dict | None = None
_city_lookup: dict | None = None


def _geocode_conflict_name(name: str, world_cities: list) -> tuple:
    """Extract lat/lng from conflict name by matching country/city names.

    Returns (lat, lng) or (None, None).
    """
    global _country_lookup, _city_lookup

    if _country_lookup is None:
        # Build country name -> capital coords lookup (use capital cities only for countries)
        _country_lookup = {}
        for city in world_cities:
            country = city["country"]
            if country not in _country_lookup or city.get("type") == "capital":
                _country_lookup[country] = (city["lat"], city["lng"])

        # Build city name -> coords lookup
        _city_lookup = {}
        for city in world_cities:
            _city_lookup[city["name"]] = (city["lat"], city["lng"])

        # Supplementary conflict-area locations not in WORLD_CITIES
        _city_lookup.update({
            # Gaza/Palestine
            "Gaza": (31.50, 34.47), "Rafah": (31.30, 34.25), "Khan Yunis": (31.35, 34.30),
            "Nuseirat": (31.45, 34.40), "Jabalia": (31.53, 34.48), "Al-Mawasi": (31.32, 34.28),
            "Beit Hanoun": (31.54, 34.53), "Deir al-Balah": (31.42, 34.35),
            # Ukraine
            "Kharkiv": (50.00, 36.23), "Sevastopol": (44.60, 33.52), "Odesa": (46.48, 30.73),
            "Zaporizhzhia": (47.84, 35.14), "Chernihiv": (51.49, 31.29), "Mariupol": (47.10, 37.54),
            "Kherson": (46.64, 32.62), "Donetsk": (48.00, 37.80), "Luhansk": (48.57, 39.31),
            "Bakhmut": (48.60, 38.00), "Toretsk": (48.39, 37.85), "Belgorod": (50.60, 36.59),
            "Crimea": (44.95, 34.10), "Donbas": (48.30, 38.00), "Avdiivka": (48.14, 37.74),
            # Syria
            "Aleppo": (36.20, 37.17), "Idlib": (35.93, 36.63), "Homs": (34.73, 36.72),
            "Raqqa": (35.95, 39.01), "Deir ez-Zor": (35.34, 40.14), "Daraa": (32.63, 36.10),
            # Yemen
            "Aden": (12.79, 45.04), "Taiz": (13.58, 44.02), "Marib": (15.46, 45.33),
            "Hodeidah": (14.80, 42.95), "Sanaa": (15.37, 44.19),
            # Sudan
            "Khartoum": (15.60, 32.53), "Darfur": (13.50, 24.00), "Sennar": (13.55, 33.63),
            # Myanmar
            "Mandalay": (21.97, 96.08), "Rakhine": (20.15, 92.90),
            # Ethiopia
            "Tigray": (13.50, 39.47), "Mekelle": (13.50, 39.47),
            # Libya
            "Benghazi": (32.12, 20.07), "Misrata": (32.38, 15.09), "Sirte": (31.21, 16.59),
            # Iraq
            "Mosul": (36.34, 43.14), "Kirkuk": (35.47, 44.39), "Fallujah": (33.35, 43.78),
            "Basra": (30.51, 47.81), "Erbil": (36.19, 44.01), "Tikrit": (34.61, 43.68),
            # Afghanistan
            "Kandahar": (31.63, 65.71), "Helmand": (31.60, 64.36), "Jalalabad": (34.43, 70.45),
            "Kunduz": (36.73, 68.86), "Herat": (34.34, 62.20), "Mazar-i-Sharif": (36.71, 67.11),
            # Somalia
            "Mogadishu": (2.05, 45.32),
            # Nigeria
            "Maiduguri": (11.85, 13.16), "Borno": (11.50, 13.50),
            # DRC
            "Goma": (-1.68, 29.22), "Bukavu": (-2.51, 28.86),
            # Mali
            "Timbuktu": (16.77, -3.01), "Bamako": (12.65, -8.00),
        })

    name_lower = name.lower()

    # Try exact city match first (more specific = better location)
    best_city = None
    best_city_len = 0
    for city_name, coord in _city_lookup.items():
        if city_name.lower() in name_lower and len(city_name) > best_city_len:
            best_city = coord
            best_city_len = len(city_name)

    if best_city:
        return best_city

    # Try country match (longest match wins for specificity)
    best_country = None
    best_country_len = 0
    for country_name, coord in _country_lookup.items():
        if country_name.lower() in name_lower and len(country_name) > best_country_len:
            best_country = coord
            best_country_len = len(country_name)

    if best_country:
        return best_country

    # Common demonyms/adjectives -> country mapping
    demonym_map = {
        "afghan": "Afghanistan", "albanian": "Albania", "algerian": "Algeria",
        "american": "United States", "angolan": "Angola", "argentine": "Argentina",
        "armenian": "Armenia", "australian": "Australia", "azerbaijani": "Azerbaijan",
        "bahraini": "Bahrain", "bangladeshi": "Bangladesh", "belarusian": "Belarus",
        "beninese": "Benin", "bolivian": "Bolivia", "bosnian": "Bosnia and Herzegovina",
        "brazilian": "Brazil", "british": "United Kingdom", "burmese": "Myanmar",
        "burundian": "Burundi", "cambodian": "Cambodia", "cameroonian": "Cameroon",
        "canadian": "Canada", "central african": "Central African Republic",
        "chadian": "Chad", "chechen": "Russia", "chilean": "Chile",
        "chinese": "China", "colombian": "Colombia", "congolese": "Democratic Republic of the Congo",
        "cuban": "Cuba", "cypriot": "Cyprus", "czech": "Czech Republic",
        "ecuadorian": "Ecuador", "egyptian": "Egypt", "eritrean": "Eritrea",
        "ethiopian": "Ethiopia", "filipino": "Philippines", "french": "France",
        "georgian": "Georgia", "german": "Germany", "ghanaian": "Ghana",
        "greek": "Greece", "guatemalan": "Guatemala", "guinea": "Guinea",
        "haitian": "Haiti", "honduran": "Honduras", "hungarian": "Hungary",
        "indian": "India", "indonesian": "Indonesia", "iranian": "Iran",
        "iraqi": "Iraq", "irish": "Ireland", "israeli": "Israel",
        "italian": "Italy", "ivorian": "Ivory Coast", "jamaican": "Jamaica",
        "japanese": "Japan", "jordanian": "Jordan", "kazakh": "Kazakhstan",
        "kenyan": "Kenya", "korean": "South Korea", "kosovan": "Kosovo",
        "kurdish": "Iraq", "kuwaiti": "Kuwait", "kyrgyz": "Kyrgyzstan",
        "lebanese": "Lebanon", "liberian": "Liberia", "libyan": "Libya",
        "malian": "Mali", "mexican": "Mexico", "moldovan": "Moldova",
        "mongolian": "Mongolia", "moroccan": "Morocco", "mozambican": "Mozambique",
        "namibian": "Namibia", "nepalese": "Nepal", "nicaraguan": "Nicaragua",
        "nigerian": "Nigeria", "nigerien": "Niger", "north korean": "North Korea",
        "norwegian": "Norway", "pakistani": "Pakistan", "palestinian": "Palestine",
        "panamanian": "Panama", "paraguayan": "Paraguay", "peruvian": "Peru",
        "polish": "Poland", "portuguese": "Portugal", "qatari": "Qatar",
        "romanian": "Romania", "russian": "Russia", "rwandan": "Rwanda",
        "salvadoran": "El Salvador", "saudi": "Saudi Arabia", "senegalese": "Senegal",
        "serbian": "Serbia", "sierra leonean": "Sierra Leone", "somali": "Somalia",
        "south african": "South Africa", "south korean": "South Korea",
        "south sudanese": "South Sudan", "spanish": "Spain", "sri lankan": "Sri Lanka",
        "sudanese": "Sudan", "swedish": "Sweden", "swiss": "Switzerland",
        "syrian": "Syria", "tajik": "Tajikistan", "tanzanian": "Tanzania",
        "thai": "Thailand", "togolese": "Togo", "tunisian": "Tunisia",
        "turkish": "Turkey", "turkmen": "Turkmenistan", "ugandan": "Uganda",
        "ukrainian": "Ukraine", "emirati": "United Arab Emirates",
        "uruguayan": "Uruguay", "uzbek": "Uzbekistan", "venezuelan": "Venezuela",
        "vietnamese": "Vietnam", "yemeni": "Yemen", "zambian": "Zambia",
        "zimbabwean": "Zimbabwe",
    }

    for demonym, country_name in demonym_map.items():
        if demonym in name_lower:
            coord = _country_lookup.get(country_name)
            if coord:
                return coord

    # Last resort: common conflict-region keywords → approximate coordinates
    region_keywords = {
        "russo-ukrainian": (48.50, 37.00), "donbas": (48.30, 38.00),
        "gaza": (31.50, 34.47), "west bank": (31.95, 35.20),
        "sahel": (14.50, -1.50), "boko haram": (11.85, 13.16),
        "al-shabaab": (2.05, 45.32), "isis": (35.00, 40.00),
        "isil": (35.00, 40.00), "daesh": (35.00, 40.00),
        "hezbollah": (33.89, 35.50), "houthi": (15.37, 44.19),
        "wagner": (13.50, 2.00), "janjaweed": (13.50, 24.00),
        "rsf": (15.60, 32.53), "rapid support": (15.60, 32.53),
        "taliban": (34.53, 69.17), "al-qaeda": (34.53, 69.17),
        "farc": (4.00, -74.00), "eln": (7.00, -73.00),
        "npa": (14.60, 121.00), "rohingya": (20.15, 92.90),
    }

    for keyword, coord in region_keywords.items():
        if keyword in name_lower:
            return coord

    return (None, None)


async def _get_country_names(db: AsyncSession, country_ids: set) -> dict:
    """Batch fetch country names for a set of country IDs."""
    if not country_ids:
        return {}
    
    from ..geography.models import Country
    
    result = await db.execute(
        select(Country.id, Country.name_en)
        .where(Country.id.in_(country_ids))
    )
    return {row.id: row.name_en for row in result.all()}


@router.get("/active", response_model=list[ConflictMapItem])
async def get_active_conflicts(
    year: Optional[int] = Query(None, ge=1800, le=2100),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Get conflicts active in a given year for map display.

    Only returns conflicts that have a start_date and are active in the target year.
    For a conflict to be "active" in a year:
    - It must have a start_date that is <= July 1st of that year
    - Its end_date must be >= July 1st of that year, OR be NULL (ongoing/unknown end)

    Conflicts without start_date are excluded from this endpoint.
    """
    from ..events.models import Conflict

    query = select(Conflict).options(selectinload(Conflict.participants))

    if year:
        target_date = date(year, 7, 1)
        query = query.where(
            and_(
                Conflict.start_date.isnot(None),
                Conflict.start_date <= target_date,
                or_(
                    Conflict.end_date.is_(None),
                    Conflict.end_date >= target_date,
                ),
            )
        )
    else:
        query = query.where(Conflict.start_date.isnot(None))

    result = await db.execute(
        query.order_by(Conflict.start_date.desc()).limit(limit)
    )
    conflicts = result.scalars().all()
    
    # Batch fetch all country names
    all_country_ids = set()
    for conflict in conflicts:
        for p in conflict.participants:
            if p.country_id:
                all_country_ids.add(p.country_id)
    
    country_names = await _get_country_names(db, all_country_ids)
    
    return [_build_conflict_response(c, country_names) for c in conflicts]


@router.get("/all", response_model=list[ConflictMapItem])
async def get_all_conflicts(
    search: Optional[str] = Query(None),
    conflict_type: Optional[str] = Query(None),
    year: Optional[int] = Query(None, ge=1800, le=2100),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get all conflicts for search/listing with filters."""
    from ..events.models import Conflict

    query = select(Conflict).options(selectinload(Conflict.participants))
    query = query.where(Conflict.start_date.isnot(None))

    if search:
        query = query.where(Conflict.name.ilike(f"%{search}%"))
    if conflict_type:
        query = query.where(Conflict.conflict_type == conflict_type)
    if year:
        target_date = date(year, 7, 1)
        query = query.where(
            and_(
                Conflict.start_date <= target_date,
                or_(
                    Conflict.end_date.is_(None),
                    Conflict.end_date >= target_date,
                ),
            )
        )

    result = await db.execute(
        query.order_by(Conflict.start_date.desc()).offset(offset).limit(limit)
    )
    conflicts = result.scalars().all()

    # Batch fetch all country names
    all_country_ids = set()
    for conflict in conflicts:
        for p in conflict.participants:
            if p.country_id:
                all_country_ids.add(p.country_id)

    country_names = await _get_country_names(db, all_country_ids)

    return [_build_conflict_response(c, country_names) for c in conflicts]


@router.get("/types")
async def get_conflict_types(
    db: AsyncSession = Depends(get_db),
):
    """Get distinct conflict types."""
    from ..events.models import Conflict

    result = await db.execute(
        select(Conflict.conflict_type, func.count(Conflict.id).label('count'))
        .group_by(Conflict.conflict_type)
        .order_by(func.count(Conflict.id).desc())
    )
    return [{"type": row.conflict_type, "count": row.count} for row in result.all()]


@router.get("/{conflict_id}/coordinates", response_model=dict)
async def get_conflict_coordinates(
    conflict_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get city-level coordinates for a specific conflict.

    Returns all cities involved in the conflict with their coordinates.
    """
    from ..events.models import Conflict
    from ..geography.cities import WORLD_CITIES

    result = await db.execute(
        select(Conflict)
        .options(selectinload(Conflict.participants))
        .where(Conflict.id == conflict_id)
    )
    conflict = result.scalars().first()

    if not conflict:
        raise NotFoundError(f"Conflict {conflict_id} not found")

    # Get all country names from participants
    all_country_ids = set()
    for p in conflict.participants:
        if p.country_id:
            all_country_ids.add(p.country_id)

    country_names = await _get_country_names(db, all_country_ids)

    # Get cities for participating countries
    cities = []
    country_list = [country_names.get(cid) for cid in all_country_ids]
    country_list = [c for c in country_list if c]

    for city in WORLD_CITIES:
        if city["country"] in country_list:
            cities.append({
                "name": city["name"],
                "country": city["country"],
                "lat": city["lat"],
                "lng": city["lng"],
                "importance": city["importance"],
                "type": city["type"],
            })

    # Compute average coordinate
    lat = None
    lng = None
    if cities:
        lat = sum(c["lat"] for c in cities) / len(cities)
        lng = sum(c["lng"] for c in cities) / len(cities)

    return {
        "conflict_id": str(conflict.id),
        "conflict_name": conflict.name,
        "center_lat": lat,
        "center_lng": lng,
        "cities": cities,
        "city_count": len(cities),
    }
