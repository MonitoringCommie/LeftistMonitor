"""
API versioning middleware and utilities.
Supports URL path versioning (e.g., /api/v1/..., /api/v2/...)
"""

from enum import Enum
from typing import Callable, Optional
from fastapi import APIRouter, Request, HTTPException
from fastapi.routing import APIRoute
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse


class APIVersion(str, Enum):
    """Supported API versions."""
    V1 = "v1"
    V2 = "v2"


# Current and minimum supported versions
CURRENT_VERSION = APIVersion.V2
MINIMUM_VERSION = APIVersion.V1
DEPRECATED_VERSIONS = {APIVersion.V1}


class VersionedAPIRoute(APIRoute):
    """Custom route class that adds version info to OpenAPI schema."""
    
    def __init__(self, *args, version: Optional[APIVersion] = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.version = version or CURRENT_VERSION


def create_versioned_router(
    version: APIVersion,
    prefix: str = "",
    **kwargs
) -> APIRouter:
    """
    Create an API router for a specific version.
    
    Usage:
        v1_router = create_versioned_router(APIVersion.V1, prefix="/users")
        v2_router = create_versioned_router(APIVersion.V2, prefix="/users")
    """
    full_prefix = f"/api/{version.value}{prefix}"
    return APIRouter(
        prefix=full_prefix,
        route_class=VersionedAPIRoute,
        **kwargs
    )


class APIVersionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle API versioning.
    
    Features:
    - Extracts version from URL path
    - Adds deprecation warnings for old versions
    - Rejects unsupported versions
    - Adds version headers to responses
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        
        # Extract version from path
        version = self._extract_version(path)
        
        # Store version in request state for access in route handlers
        request.state.api_version = version
        
        # Check if version is supported
        if version and version not in [v.value for v in APIVersion]:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Unsupported API version",
                    "message": f"Version '{version}' is not supported. Supported versions: {[v.value for v in APIVersion]}",
                    "current_version": CURRENT_VERSION.value,
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add version headers
        response.headers["X-API-Version"] = version or CURRENT_VERSION.value
        response.headers["X-API-Current-Version"] = CURRENT_VERSION.value
        
        # Add deprecation warning for old versions
        if version and version in [v.value for v in DEPRECATED_VERSIONS]:
            response.headers["X-API-Deprecated"] = "true"
            response.headers["X-API-Deprecation-Message"] = (
                f"API version {version} is deprecated. "
                f"Please migrate to {CURRENT_VERSION.value}."
            )
        
        return response
    
    def _extract_version(self, path: str) -> Optional[str]:
        """Extract API version from URL path."""
        parts = path.strip("/").split("/")
        if len(parts) >= 2 and parts[0] == "api":
            version = parts[1]
            if version.startswith("v") and version[1:].isdigit():
                return version
        return None


def get_api_version(request: Request) -> str:
    """Get the API version from the current request."""
    return getattr(request.state, "api_version", CURRENT_VERSION.value)


def require_version(minimum: APIVersion):
    """
    Decorator to require a minimum API version for an endpoint.
    
    Usage:
        @router.get("/new-feature")
        @require_version(APIVersion.V2)
        async def new_feature():
            ...
    """
    def decorator(func: Callable) -> Callable:
        async def wrapper(request: Request, *args, **kwargs):
            current = get_api_version(request)
            if current < minimum.value:
                raise HTTPException(
                    status_code=400,
                    detail=f"This endpoint requires API version {minimum.value} or higher"
                )
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator


# Version-specific response transformers
class ResponseTransformer:
    """Transform responses based on API version for backwards compatibility."""
    
    @staticmethod
    def transform_person(data: dict, version: str) -> dict:
        """Transform person data based on API version."""
        if version == "v1":
            # V1 used 'fullName' instead of 'name'
            if "name" in data:
                data["fullName"] = data["name"]
            # V1 didn't have certain fields
            data.pop("wikidata_id", None)
            data.pop("search_vector", None)
        return data
    
    @staticmethod
    def transform_event(data: dict, version: str) -> dict:
        """Transform event data based on API version."""
        if version == "v1":
            # V1 used 'date' as string instead of separate fields
            if all(k in data for k in ["year", "month", "day"]):
                data["date"] = f"{data['year']}-{data.get('month', 1):02d}-{data.get('day', 1):02d}"
        return data
    
    @staticmethod
    def transform_list(data: list, transform_fn: Callable, version: str) -> list:
        """Apply transformation to a list of items."""
        return [transform_fn(item, version) for item in data]


# Utility for deprecation notices
def add_deprecation_notice(
    response: Response,
    message: str,
    sunset_date: Optional[str] = None
) -> Response:
    """Add deprecation headers to a response."""
    response.headers["Deprecation"] = "true"
    response.headers["X-Deprecation-Notice"] = message
    if sunset_date:
        response.headers["Sunset"] = sunset_date
    return response
