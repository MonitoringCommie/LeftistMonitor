"""
Monitoring API Router

Exposes monitoring, metrics, and analytics endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from .metrics import metrics_endpoint
from .performance import get_monitor
from .analytics import get_tracker


router = APIRouter(tags=["monitoring"])


# Dependency for admin access
async def require_admin():
    """Require admin access for sensitive endpoints."""
    # In production, check actual auth
    return True


@router.get("/metrics")
async def get_metrics():
    """
    Prometheus metrics endpoint.
    
    Returns metrics in Prometheus text format for scraping.
    """
    return await metrics_endpoint()


@router.get("/performance")
async def get_performance_summary(admin: bool = Depends(require_admin)):
    """
    Get performance monitoring summary.
    
    Returns current performance metrics including request latencies,
    database query times, and slow query alerts.
    """
    monitor = get_monitor()
    return monitor.get_performance_summary()


@router.get("/performance/slow-queries")
async def get_slow_queries(
    limit: int = 20,
    admin: bool = Depends(require_admin)
):
    """Get recent slow database queries."""
    monitor = get_monitor()
    queries = monitor.get_slow_queries(limit)
    return {
        "slow_queries": [
            {
                "query": q.query[:200],
                "duration_ms": q.duration_ms,
                "table": q.table,
                "timestamp": q.timestamp.isoformat(),
                "threshold_ms": q.threshold_ms
            }
            for q in queries
        ]
    }


@router.get("/performance/slow-requests")
async def get_slow_requests(
    limit: int = 20,
    admin: bool = Depends(require_admin)
):
    """Get recent slow HTTP requests."""
    monitor = get_monitor()
    requests = monitor.get_slow_requests(limit)
    return {
        "slow_requests": [
            {
                "name": r.name,
                "duration_ms": r.duration_ms,
                "timestamp": r.timestamp.isoformat(),
                "metadata": r.metadata
            }
            for r in requests
        ]
    }


@router.get("/analytics")
async def get_analytics_summary(admin: bool = Depends(require_admin)):
    """
    Get analytics summary.
    
    Returns aggregated analytics data including page views,
    popular pages, and feature usage.
    """
    tracker = get_tracker()
    return tracker.get_analytics_summary()


@router.get("/analytics/daily")
async def get_daily_analytics(
    date: str = None,
    admin: bool = Depends(require_admin)
):
    """Get analytics for a specific day."""
    tracker = get_tracker()
    return tracker.get_daily_stats(date)


@router.get("/analytics/popular-pages")
async def get_popular_pages(
    limit: int = 20,
    admin: bool = Depends(require_admin)
):
    """Get most popular pages."""
    tracker = get_tracker()
    return {"popular_pages": tracker.get_popular_pages(limit)}


@router.get("/analytics/search-trends")
async def get_search_trends(
    limit: int = 20,
    admin: bool = Depends(require_admin)
):
    """Get popular search categories."""
    tracker = get_tracker()
    return {"search_trends": tracker.get_popular_searches(limit)}


@router.get("/analytics/feature-usage")
async def get_feature_usage(admin: bool = Depends(require_admin)):
    """Get feature usage statistics."""
    tracker = get_tracker()
    return {"feature_usage": tracker.get_feature_usage()}


@router.post("/analytics/cleanup")
async def cleanup_analytics(admin: bool = Depends(require_admin)):
    """Trigger cleanup of old analytics data."""
    tracker = get_tracker()
    tracker.cleanup_old_data()
    return {"message": "Cleanup completed"}
