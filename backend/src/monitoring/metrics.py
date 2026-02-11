"""
Prometheus Metrics Module

Provides application metrics for monitoring with Prometheus.
Includes request metrics, database metrics, cache metrics, and business metrics.
"""

import time
from typing import Callable, Optional
from functools import wraps
from prometheus_client import (
    Counter, Histogram, Gauge, Summary, Info,
    CollectorRegistry, generate_latest, CONTENT_TYPE_LATEST,
    multiprocess, REGISTRY
)
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.routing import Match


# Create a custom registry for our metrics
registry = CollectorRegistry()

# =============================================================================
# HTTP Request Metrics
# =============================================================================

HTTP_REQUESTS_TOTAL = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'status_code'],
    registry=registry
)

HTTP_REQUEST_DURATION_SECONDS = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'endpoint'],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
    registry=registry
)

HTTP_REQUESTS_IN_PROGRESS = Gauge(
    'http_requests_in_progress',
    'Number of HTTP requests currently being processed',
    ['method', 'endpoint'],
    registry=registry
)

HTTP_REQUEST_SIZE_BYTES = Summary(
    'http_request_size_bytes',
    'HTTP request size in bytes',
    ['method', 'endpoint'],
    registry=registry
)

HTTP_RESPONSE_SIZE_BYTES = Summary(
    'http_response_size_bytes',
    'HTTP response size in bytes',
    ['method', 'endpoint'],
    registry=registry
)

# =============================================================================
# Database Metrics
# =============================================================================

DB_QUERIES_TOTAL = Counter(
    'db_queries_total',
    'Total number of database queries',
    ['query_type', 'table'],
    registry=registry
)

DB_QUERY_DURATION_SECONDS = Histogram(
    'db_query_duration_seconds',
    'Database query duration in seconds',
    ['query_type', 'table'],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0],
    registry=registry
)

DB_CONNECTIONS_ACTIVE = Gauge(
    'db_connections_active',
    'Number of active database connections',
    registry=registry
)

DB_CONNECTIONS_IDLE = Gauge(
    'db_connections_idle',
    'Number of idle database connections',
    registry=registry
)

# =============================================================================
# Cache Metrics
# =============================================================================

CACHE_HITS_TOTAL = Counter(
    'cache_hits_total',
    'Total number of cache hits',
    ['cache_type'],
    registry=registry
)

CACHE_MISSES_TOTAL = Counter(
    'cache_misses_total',
    'Total number of cache misses',
    ['cache_type'],
    registry=registry
)

CACHE_SIZE_BYTES = Gauge(
    'cache_size_bytes',
    'Current cache size in bytes',
    ['cache_type'],
    registry=registry
)

# =============================================================================
# Authentication Metrics
# =============================================================================

AUTH_ATTEMPTS_TOTAL = Counter(
    'auth_attempts_total',
    'Total number of authentication attempts',
    ['method', 'success'],
    registry=registry
)

AUTH_TOKENS_ISSUED_TOTAL = Counter(
    'auth_tokens_issued_total',
    'Total number of tokens issued',
    ['token_type'],
    registry=registry
)

ACTIVE_SESSIONS = Gauge(
    'active_sessions',
    'Number of active user sessions',
    registry=registry
)

# =============================================================================
# Business Metrics
# =============================================================================

CONTRIBUTIONS_TOTAL = Counter(
    'contributions_total',
    'Total number of contributions submitted',
    ['contribution_type', 'status'],
    registry=registry
)

SEARCHES_TOTAL = Counter(
    'searches_total',
    'Total number of searches performed',
    ['search_type'],
    registry=registry
)

EXPORTS_TOTAL = Counter(
    'exports_total',
    'Total number of data exports',
    ['format', 'entity_type'],
    registry=registry
)

PAGE_VIEWS_TOTAL = Counter(
    'page_views_total',
    'Total number of page views',
    ['page'],
    registry=registry
)

ACTIVE_USERS = Gauge(
    'active_users',
    'Number of currently active users',
    ['user_type'],
    registry=registry
)

# =============================================================================
# Rate Limiting Metrics
# =============================================================================

RATE_LIMIT_HITS_TOTAL = Counter(
    'rate_limit_hits_total',
    'Total number of rate limit hits',
    ['endpoint', 'tier'],
    registry=registry
)

# =============================================================================
# Error Metrics
# =============================================================================

ERRORS_TOTAL = Counter(
    'errors_total',
    'Total number of errors',
    ['error_type', 'endpoint'],
    registry=registry
)

# =============================================================================
# Application Info
# =============================================================================

APP_INFO = Info(
    'app',
    'Application information',
    registry=registry
)

# Set application info
APP_INFO.info({
    'name': 'LeftistMonitor',
    'version': '2.0.0',
    'python_version': '3.11',
    'framework': 'FastAPI'
})


# =============================================================================
# Helper Functions
# =============================================================================

def get_path_template(request: Request) -> str:
    """Extract the path template from the request for consistent labeling."""
    for route in request.app.routes:
        match, _ = route.matches(request.scope)
        if match == Match.FULL:
            return route.path
    return request.url.path


def track_request_metrics(method: str, endpoint: str, status_code: int, duration: float):
    """Record metrics for an HTTP request."""
    HTTP_REQUESTS_TOTAL.labels(
        method=method,
        endpoint=endpoint,
        status_code=status_code
    ).inc()
    
    HTTP_REQUEST_DURATION_SECONDS.labels(
        method=method,
        endpoint=endpoint
    ).observe(duration)


def track_db_query(query_type: str, table: str, duration: float):
    """Record metrics for a database query."""
    DB_QUERIES_TOTAL.labels(query_type=query_type, table=table).inc()
    DB_QUERY_DURATION_SECONDS.labels(query_type=query_type, table=table).observe(duration)


def track_cache_access(cache_type: str, hit: bool):
    """Record cache hit or miss."""
    if hit:
        CACHE_HITS_TOTAL.labels(cache_type=cache_type).inc()
    else:
        CACHE_MISSES_TOTAL.labels(cache_type=cache_type).inc()


def track_auth_attempt(method: str, success: bool):
    """Record authentication attempt."""
    AUTH_ATTEMPTS_TOTAL.labels(method=method, success=str(success).lower()).inc()


def track_contribution(contribution_type: str, status: str):
    """Record contribution submission."""
    CONTRIBUTIONS_TOTAL.labels(contribution_type=contribution_type, status=status).inc()


def track_search(search_type: str):
    """Record search performed."""
    SEARCHES_TOTAL.labels(search_type=search_type).inc()


def track_export(format: str, entity_type: str):
    """Record data export."""
    EXPORTS_TOTAL.labels(format=format, entity_type=entity_type).inc()


def track_error(error_type: str, endpoint: str):
    """Record error occurrence."""
    ERRORS_TOTAL.labels(error_type=error_type, endpoint=endpoint).inc()


# =============================================================================
# Decorators
# =============================================================================

def timed_db_query(query_type: str, table: str):
    """Decorator to time and track database queries."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration = time.perf_counter() - start_time
                track_db_query(query_type, table, duration)
        return wrapper
    return decorator


# =============================================================================
# Metrics Endpoint
# =============================================================================

async def metrics_endpoint() -> Response:
    """Generate Prometheus metrics output."""
    metrics_output = generate_latest(registry)
    return Response(
        content=metrics_output,
        media_type=CONTENT_TYPE_LATEST
    )
