"""
Monitoring Module

Provides comprehensive monitoring, metrics, and analytics for the application.
"""

from .metrics import (
    metrics_endpoint,
    track_request_metrics,
    track_db_query,
    track_cache_access,
    track_auth_attempt,
    track_contribution,
    track_search,
    track_export,
    track_error,
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    DB_QUERIES_TOTAL,
    ACTIVE_USERS
)

from .middleware import PrometheusMiddleware

from .health import router as health_router

from .sentry import (
    init_sentry,
    capture_exception,
    capture_message,
    set_user,
    set_tag,
    set_context,
    add_breadcrumb,
    track_performance,
    SentryMiddleware
)

from .performance import (
    PerformanceMonitor,
    get_monitor,
    init_monitor,
    timed,
    timed_operation,
    async_timed_operation,
    track_db_performance
)

from .analytics import (
    AnalyticsTracker,
    EventType,
    get_tracker,
    init_tracker
)

__all__ = [
    # Metrics
    "metrics_endpoint",
    "track_request_metrics",
    "track_db_query",
    "track_cache_access",
    "track_auth_attempt",
    "track_contribution",
    "track_search",
    "track_export",
    "track_error",
    
    # Middleware
    "PrometheusMiddleware",
    "SentryMiddleware",
    
    # Health
    "health_router",
    
    # Sentry
    "init_sentry",
    "capture_exception",
    "capture_message",
    "set_user",
    "set_tag",
    "set_context",
    "add_breadcrumb",
    "track_performance",
    
    # Performance
    "PerformanceMonitor",
    "get_monitor",
    "init_monitor",
    "timed",
    "timed_operation",
    "async_timed_operation",
    "track_db_performance",
    
    # Analytics
    "AnalyticsTracker",
    "EventType",
    "get_tracker",
    "init_tracker"
]
