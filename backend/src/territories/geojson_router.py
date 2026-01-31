"""Serve GeoJSON files directly for liberation struggle overlays."""
import json
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Response, Query

router = APIRouter()

# Data directories
BASE_DIR = Path(__file__).parent.parent.parent.parent / "data" / "scraped" / "liberation"
PALESTINE_DIR = BASE_DIR / "palestine"
WESTERN_SAHARA_DIR = BASE_DIR / "western_sahara"
KURDISTAN_DIR = BASE_DIR / "kurdistan"
KASHMIR_DIR = BASE_DIR / "kashmir"


def load_geojson(filepath: Path) -> dict:
    """Load a GeoJSON file."""
    if filepath.exists():
        with open(filepath, 'r') as f:
            return json.load(f)
    return {"type": "FeatureCollection", "features": []}


def convert_osm_to_geojson(osm_data: dict) -> dict:
    """Convert OSM Overpass JSON to GeoJSON format."""
    features = []
    elements = osm_data.get("elements", [])
    
    for el in elements:
        if el.get("type") == "node":
            features.append({
                "type": "Feature",
                "properties": el.get("tags", {}),
                "geometry": {
                    "type": "Point",
                    "coordinates": [el.get("lon", 0), el.get("lat", 0)]
                }
            })
        elif el.get("type") == "way" and el.get("geometry"):
            coords = [[g["lon"], g["lat"]] for g in el["geometry"]]
            # Check if it's a closed way (polygon)
            if len(coords) > 2 and coords[0] == coords[-1]:
                features.append({
                    "type": "Feature",
                    "properties": el.get("tags", {}),
                    "geometry": {"type": "Polygon", "coordinates": [coords]}
                })
            else:
                features.append({
                    "type": "Feature",
                    "properties": el.get("tags", {}),
                    "geometry": {"type": "LineString", "coordinates": coords}
                })
        elif el.get("type") == "relation" and el.get("members"):
            # Handle relations - simplified approach
            coords = []
            for member in el.get("members", []):
                if member.get("geometry"):
                    coords.extend([[g["lon"], g["lat"]] for g in member["geometry"]])
            if coords:
                features.append({
                    "type": "Feature",
                    "properties": el.get("tags", {}),
                    "geometry": {"type": "LineString", "coordinates": coords}
                })
    
    return {"type": "FeatureCollection", "features": features}


def load_osm_as_geojson(filepath: Path) -> dict:
    """Load OSM JSON and convert to GeoJSON."""
    if filepath.exists():
        with open(filepath, 'r') as f:
            data = json.load(f)
        # Check if already GeoJSON or OSM format
        if data.get("type") == "FeatureCollection":
            return data
        return convert_osm_to_geojson(data)
    return {"type": "FeatureCollection", "features": []}


# ==========================================
# PALESTINE ENDPOINTS
# ==========================================

@router.get("/palestine/separation-barrier/geojson")
async def get_palestine_separation_barrier(response: Response):
    """Get separation barrier/wall as GeoJSON from OCHA data."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "separation_barrier.geojson")


@router.get("/palestine/checkpoints/geojson")
async def get_palestine_checkpoints(response: Response):
    """Get checkpoints as GeoJSON from OCHA data."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "checkpoints.geojson")


@router.get("/palestine/roadblocks/geojson")
async def get_palestine_roadblocks(response: Response):
    """Get roadblocks and earthmounds as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "roadblocks_earthmounds.geojson")


@router.get("/palestine/road-gates/geojson")
async def get_palestine_road_gates(response: Response):
    """Get road gates as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "road_gates.geojson")


@router.get("/palestine/firing-zones/geojson")
async def get_palestine_firing_zones(response: Response):
    """Get Israeli firing zones (closed military areas) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "israeli_firing_zones.geojson")


@router.get("/palestine/oslo-areas/geojson")
async def get_palestine_oslo_areas(response: Response):
    """Get Oslo Agreement areas (A, B, C) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "oslo_areas_abc.geojson")


@router.get("/palestine/linear-closures/geojson")
async def get_palestine_linear_closures(response: Response):
    """Get linear road closures as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "linear_closures.geojson")


@router.get("/palestine/settlements/geojson")
async def get_palestine_settlements(response: Response):
    """Get settlements from OSM data as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "osm_settlements_places.geojson")


@router.get("/palestine/walls/geojson")
async def get_palestine_walls(response: Response):
    """Get walls and barriers from OSM as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(PALESTINE_DIR / "osm_walls_barriers.geojson")


@router.get("/palestine/file-summary")
async def get_palestine_file_summary(response: Response):
    """Get summary of available Palestine data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = PALESTINE_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}


# ==========================================
# WESTERN SAHARA ENDPOINTS
# ==========================================

@router.get("/western-sahara/wall/geojson")
async def get_western_sahara_wall(response: Response):
    """Get the Moroccan Sand Wall/Berm (2,700km) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WESTERN_SAHARA_DIR / "moroccan_wall_full.json")


@router.get("/western-sahara/berm/geojson")
async def get_western_sahara_berm(response: Response):
    """Get additional sand berm data as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WESTERN_SAHARA_DIR / "sand_berm_osm.json")


@router.get("/western-sahara/minefields/geojson")
async def get_western_sahara_minefields(response: Response):
    """Get minefield locations as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WESTERN_SAHARA_DIR / "minefields_osm.json")


@router.get("/western-sahara/settlements/geojson")
async def get_western_sahara_settlements(response: Response):
    """Get settlements as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WESTERN_SAHARA_DIR / "settlements_osm.json")


@router.get("/western-sahara/refugee-camps/geojson")
async def get_western_sahara_refugee_camps(response: Response):
    """Get Sahrawi refugee camps in Tindouf as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WESTERN_SAHARA_DIR / "sahrawi_refugee_camps.json")


@router.get("/western-sahara/boundary/geojson")
async def get_western_sahara_boundary(response: Response):
    """Get Western Sahara administrative boundaries."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_geojson(WESTERN_SAHARA_DIR / "esh_admin0.geojson")


@router.get("/western-sahara/file-summary")
async def get_western_sahara_file_summary(response: Response):
    """Get summary of available Western Sahara data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = WESTERN_SAHARA_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}


# ==========================================
# KURDISTAN ENDPOINTS
# ==========================================

@router.get("/kurdistan/destroyed-villages/geojson")
async def get_kurdistan_destroyed_villages(response: Response):
    """Get destroyed Kurdish villages as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KURDISTAN_DIR / "destroyed_villages_osm.json")


@router.get("/kurdistan/military/geojson")
async def get_kurdistan_military(response: Response):
    """Get military installations in Kurdish regions as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KURDISTAN_DIR / "military_installations_osm.json")


@router.get("/kurdistan/dams/geojson")
async def get_kurdistan_dams(response: Response):
    """Get dam projects in Kurdish areas as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KURDISTAN_DIR / "turkey_dams_osm.json")


@router.get("/kurdistan/ilisu-dam/geojson")
async def get_kurdistan_ilisu_dam(response: Response):
    """Get Ilisu Dam (flooded Hasankeyf) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KURDISTAN_DIR / "ilisu_dam_osm.json")


@router.get("/kurdistan/iraqi-kurdistan/geojson")
async def get_iraqi_kurdistan(response: Response):
    """Get Iraqi Kurdistan Region data as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KURDISTAN_DIR / "iraqi_kurdistan_osm.json")


@router.get("/kurdistan/file-summary")
async def get_kurdistan_file_summary(response: Response):
    """Get summary of available Kurdistan data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = KURDISTAN_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}


# ==========================================
# KASHMIR ENDPOINTS
# ==========================================

@router.get("/kashmir/line-of-control/geojson")
async def get_kashmir_loc(response: Response):
    """Get Line of Control as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KASHMIR_DIR / "line_of_control_osm.json")


@router.get("/kashmir/boundaries/geojson")
async def get_kashmir_boundaries(response: Response):
    """Get Kashmir administrative boundaries as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KASHMIR_DIR / "kashmir_boundaries_osm.json")


@router.get("/kashmir/checkpoints/geojson")
async def get_kashmir_checkpoints(response: Response):
    """Get military checkpoints as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KASHMIR_DIR / "checkpoints_osm.json")


@router.get("/kashmir/military/geojson")
async def get_kashmir_military(response: Response):
    """Get military installations as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KASHMIR_DIR / "military_installations_osm.json")


@router.get("/kashmir/graves/geojson")
async def get_kashmir_graves(response: Response):
    """Get cemeteries and martyrs' graveyards as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(KASHMIR_DIR / "graves_cemeteries_osm.json")


@router.get("/kashmir/file-summary")
async def get_kashmir_file_summary(response: Response):
    """Get summary of available Kashmir data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = KASHMIR_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}


# ==========================================
# TIBET ENDPOINTS
# ==========================================

TIBET_DIR = BASE_DIR / "tibet"

@router.get("/tibet/monasteries/geojson")
async def get_tibet_monasteries(response: Response):
    """Get Buddhist monasteries and temples as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(TIBET_DIR / "monasteries_temples.json")


@router.get("/tibet/military/geojson")
async def get_tibet_military(response: Response):
    """Get military installations as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(TIBET_DIR / "military_installations.json")


@router.get("/tibet/railway/geojson")
async def get_tibet_railway(response: Response):
    """Get railway infrastructure (Qinghai-Tibet Railway) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(TIBET_DIR / "railway_infrastructure.json")


@router.get("/tibet/prisons/geojson")
async def get_tibet_prisons(response: Response):
    """Get prisons and detention facilities as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(TIBET_DIR / "prisons_detention.json")


@router.get("/tibet/file-summary")
async def get_tibet_file_summary(response: Response):
    """Get summary of available Tibet data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = TIBET_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}


# ==========================================
# WEST PAPUA ENDPOINTS
# ==========================================

WEST_PAPUA_DIR = BASE_DIR / "west_papua"

@router.get("/west-papua/freeport-mine/geojson")
async def get_west_papua_freeport(response: Response):
    """Get Freeport/Grasberg mine area as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WEST_PAPUA_DIR / "freeport_mine.json")


@router.get("/west-papua/military/geojson")
async def get_west_papua_military(response: Response):
    """Get military installations as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WEST_PAPUA_DIR / "military_installations.json")


@router.get("/west-papua/settlements/geojson")
async def get_west_papua_settlements(response: Response):
    """Get settlements (including transmigration) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(WEST_PAPUA_DIR / "settlements.json")


@router.get("/west-papua/file-summary")
async def get_west_papua_file_summary(response: Response):
    """Get summary of available West Papua data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = WEST_PAPUA_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}


# ==========================================
# IRELAND ENDPOINTS
# ==========================================

IRELAND_DIR = BASE_DIR / "ireland"

@router.get("/ireland/peace-walls/geojson")
async def get_ireland_peace_walls(response: Response):
    """Get Belfast peace walls and interface barriers as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(IRELAND_DIR / "peace_walls_belfast.json")


@router.get("/ireland/military/geojson")
async def get_ireland_military(response: Response):
    """Get military installations, forts, and castles as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(IRELAND_DIR / "military_installations.json")


@router.get("/ireland/border-checkpoints/geojson")
async def get_ireland_border_checkpoints(response: Response):
    """Get border checkpoints and customs posts as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(IRELAND_DIR / "border_checkpoints.json")


@router.get("/ireland/partition-boundary/geojson")
async def get_ireland_partition_boundary(response: Response):
    """Get Northern Ireland partition boundary (1921) as GeoJSON."""
    response.headers["Cache-Control"] = "public, max-age=86400"
    return load_osm_as_geojson(IRELAND_DIR / "partition_boundary.json")


@router.get("/ireland/file-summary")
async def get_ireland_file_summary(response: Response):
    """Get summary of available Ireland data files."""
    response.headers["Cache-Control"] = "public, max-age=3600"
    index_file = IRELAND_DIR / "_index.json"
    if index_file.exists():
        with open(index_file, 'r') as f:
            return json.load(f)
    return {"error": "Index file not found"}
