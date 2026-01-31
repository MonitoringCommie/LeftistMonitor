"""FastAPI application entry point."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import get_settings
from .geography.router import router as geography_router
from .politics.router import router as politics_router
from .people.router import router as people_router
from .events.router import router as events_router
from .policies.router import router as policies_router
from .conflicts.router import router as conflicts_router
from .conflicts.frontlines_router import router as frontlines_router
from .core.search import router as search_router

settings = get_settings()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title=settings.project_name,
    description="Interactive historical world map with political data",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    """Health check endpoint."""
    return {"status": "healthy"}


# Include routers
app.include_router(
    geography_router,
    prefix=f"{settings.api_v1_prefix}/geography",
    tags=["geography"],
)

app.include_router(
    politics_router,
    prefix=f"{settings.api_v1_prefix}/politics",
    tags=["politics"],
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
    search_router,
    prefix=f"{settings.api_v1_prefix}/search",
    tags=["search"],
)

app.include_router(
    frontlines_router,
    prefix=f"{settings.api_v1_prefix}/frontlines",
    tags=["frontlines"],
)

from .core.citations import router as citations_router

app.include_router(
    citations_router,
    prefix=f"{settings.api_v1_prefix}/citations",
    tags=["citations"],
)

from .events.adjacent import router as adjacent_router

app.include_router(
    adjacent_router,
    prefix=f"{settings.api_v1_prefix}/history",
    tags=["history"],
)

from .core.export import router as export_router

app.include_router(
    export_router,
    prefix=f"{settings.api_v1_prefix}/export",
    tags=["export"],
)

from .politics.comparison import router as comparison_router

app.include_router(
    comparison_router,
    prefix=f"{settings.api_v1_prefix}/comparison",
    tags=["comparison"],
)

from .core.network import router as network_router

app.include_router(
    network_router,
    prefix=f"{settings.api_v1_prefix}/network",
    tags=["network"],
)

from .labor.router import router as labor_router

app.include_router(
    labor_router,
    prefix=f"{settings.api_v1_prefix}/labor",
    tags=["labor"],
)

from .core.search_advanced import router as search_advanced_router

app.include_router(
    search_advanced_router,
    prefix=f"{settings.api_v1_prefix}/search",
    tags=["search"],
)

from .research.router import router as research_router

app.include_router(
    research_router,
    prefix=f"{settings.api_v1_prefix}/research",
    tags=["research"],
)

from .media.router import router as media_router

app.include_router(
    media_router,
    prefix=f"{settings.api_v1_prefix}/media",
    tags=["media"],
)

from .territories.router import router as territories_router

app.include_router(
    territories_router,
    prefix=f"{settings.api_v1_prefix}/territories",
    tags=["territories"],
)

from .books.router import router as books_router

app.include_router(
    books_router,
    prefix=f"{settings.api_v1_prefix}/books",
    tags=["books"],
)

from .auth.router import router as auth_router

app.include_router(
    auth_router,
    prefix=f"{settings.api_v1_prefix}",
    tags=["authentication"],
)
