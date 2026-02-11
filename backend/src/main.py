"""FastAPI application entry point."""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .cache import get_redis, close_redis, get_cache_stats
from .middleware.rate_limit import RateLimitMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    # Startup
    logger.info("Application startup started")
    try:
        redis_client = await get_redis()
        await redis_client.ping()
        logger.info("Redis connected successfully")
    except Exception as e:
        logger.warning(f"Redis connection failed (caching disabled): {e}")

    logger.info("Application startup complete")
    yield

    # Shutdown
    logger.info("Application shutdown started")
    await close_redis()
    logger.info("Redis connection closed")
    logger.info("Application shutdown complete")


app = FastAPI(
    title=settings.project_name,
    description="Interactive historical world map with political data",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add GZip compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add custom Redis-based rate limit middleware
app.add_middleware(RateLimitMiddleware, requests_per_minute=200)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests and responses."""
    logger.info(f"[{request.method}] {request.url.path}")
    response = await call_next(request)
    logger.info(f"[{request.method}] {request.url.path} - {response.status_code}")
    return response


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.project_name,
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with cache status."""
    cache_stats = await get_cache_stats()
    return {
        "status": "healthy",
        "cache": cache_stats,
    }


# Import all routers
from .geography.router import router as geography_router
from .geography.economic_router import router as economic_router
from .geography.globe_router import router as globe_router
from .politics.router import router as politics_router
from .politics.comparison import router as comparison_router
from .people.router import router as people_router
from .events.router import router as events_router
from .events.adjacent import router as adjacent_router
from .policies.router import router as policies_router
from .conflicts.router import router as conflicts_router
from .conflicts.frontlines_router import router as frontlines_router
from .core.search import router as search_router
from .core.search_advanced import router as search_advanced_router
from .core.citations import router as citations_router
from .core.export import router as export_router
from .core.network import router as network_router
from .labor.router import router as labor_router
from .research.router import router as research_router
from .media.router import router as media_router
from .territories.router import router as territories_router
from .territories.geojson_router import router as geojson_router
from .books.router import router as books_router
from .auth.router import router as auth_router
from .admin.router import router as admin_router
from .stats.router import router as stats_router

# Register all routers
app.include_router(
    geography_router,
    prefix=f"{settings.api_v1_prefix}/geography",
    tags=["geography"],
)

app.include_router(
    economic_router,
    prefix=f"{settings.api_v1_prefix}/geography",
    tags=["economic"],
)

app.include_router(
    globe_router,
    prefix=f"{settings.api_v1_prefix}/globe",
    tags=["globe"],
)

app.include_router(
    politics_router,
    prefix=f"{settings.api_v1_prefix}/politics",
    tags=["politics"],
)

app.include_router(
    comparison_router,
    prefix=f"{settings.api_v1_prefix}/comparison",
    tags=["comparison"],
)

app.include_router(
    people_router,
    prefix=f"{settings.api_v1_prefix}/people",
    tags=["people"],
)

app.include_router(
    events_router,
    prefix=f"{settings.api_v1_prefix}/events",
    tags=["events"],
)

app.include_router(
    adjacent_router,
    prefix=f"{settings.api_v1_prefix}/history",
    tags=["history"],
)

app.include_router(
    policies_router,
    prefix=f"{settings.api_v1_prefix}/policies",
    tags=["policies"],
)

app.include_router(
    conflicts_router,
    prefix=f"{settings.api_v1_prefix}/conflicts",
    tags=["conflicts"],
)

app.include_router(
    frontlines_router,
    prefix=f"{settings.api_v1_prefix}/frontlines",
    tags=["frontlines"],
)

app.include_router(
    search_router,
    prefix=f"{settings.api_v1_prefix}/search",
    tags=["search"],
)

app.include_router(
    search_advanced_router,
    prefix=f"{settings.api_v1_prefix}/search",
    tags=["search"],
)

app.include_router(
    citations_router,
    prefix=f"{settings.api_v1_prefix}/citations",
    tags=["citations"],
)

app.include_router(
    export_router,
    prefix=f"{settings.api_v1_prefix}/export",
    tags=["export"],
)

app.include_router(
    network_router,
    prefix=f"{settings.api_v1_prefix}/network",
    tags=["network"],
)

app.include_router(
    labor_router,
    prefix=f"{settings.api_v1_prefix}/labor",
    tags=["labor"],
)

app.include_router(
    research_router,
    prefix=f"{settings.api_v1_prefix}/research",
    tags=["research"],
)

app.include_router(
    media_router,
    prefix=f"{settings.api_v1_prefix}/media",
    tags=["media"],
)

app.include_router(
    territories_router,
    prefix=f"{settings.api_v1_prefix}/territories",
    tags=["territories"],
)

app.include_router(
    geojson_router,
    prefix=f"{settings.api_v1_prefix}/territories",
    tags=["territories-geojson"],
)

app.include_router(
    books_router,
    prefix=f"{settings.api_v1_prefix}/books",
    tags=["books"],
)

app.include_router(
    auth_router,
    prefix=f"{settings.api_v1_prefix}",
    tags=["authentication"],
)

app.include_router(
    admin_router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["admin"],
)

app.include_router(
    stats_router,
    prefix=f"{settings.api_v1_prefix}/stats",
    tags=["stats"],
)
