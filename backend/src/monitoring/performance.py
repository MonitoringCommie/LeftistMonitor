"""
Performance Monitoring Module

Provides detailed performance monitoring including:
- Database query timing
- External API call timing
- Memory usage tracking
- Slow query detection
- Performance alerts
"""

import time
import asyncio
import functools
import psutil
import logging
from typing import Callable, Optional, Dict, Any, List
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import deque
from contextlib import contextmanager, asynccontextmanager

from .metrics import (
    DB_QUERY_DURATION_SECONDS,
    DB_QUERIES_TOTAL,
    track_db_query
)

logger = logging.getLogger(__name__)


@dataclass
class PerformanceMetric:
    """A single performance measurement."""
    name: str
    duration_ms: float
    timestamp: datetime
    metadata: Dict[str, Any] = field(default_factory=dict)
    is_slow: bool = False


@dataclass
class SlowQueryAlert:
    """Alert for slow database queries."""
    query: str
    duration_ms: float
    timestamp: datetime
    table: Optional[str] = None
    threshold_ms: float = 100.0


class PerformanceMonitor:
    """
    Central performance monitoring system.
    
    Tracks performance metrics, detects anomalies, and provides
    real-time performance insights.
    """
    
    def __init__(
        self,
        slow_query_threshold_ms: float = 100.0,
        slow_request_threshold_ms: float = 1000.0,
        metrics_window_size: int = 1000,
        alert_callback: Optional[Callable] = None
    ):
        self.slow_query_threshold_ms = slow_query_threshold_ms
        self.slow_request_threshold_ms = slow_request_threshold_ms
        self.metrics_window_size = metrics_window_size
        self.alert_callback = alert_callback
        
        # Rolling windows for metrics
        self._request_times: deque = deque(maxlen=metrics_window_size)
        self._query_times: deque = deque(maxlen=metrics_window_size)
        self._slow_queries: deque = deque(maxlen=100)
        self._slow_requests: deque = deque(maxlen=100)
        
        # System metrics
        self._last_cpu_check = 0.0
        self._last_memory_check = 0.0
    
    def record_request(
        self,
        endpoint: str,
        method: str,
        duration_ms: float,
        status_code: int
    ):
        """Record an HTTP request performance metric."""
        metric = PerformanceMetric(
            name=f"{method} {endpoint}",
            duration_ms=duration_ms,
            timestamp=datetime.utcnow(),
            metadata={
                "endpoint": endpoint,
                "method": method,
                "status_code": status_code
            },
            is_slow=duration_ms > self.slow_request_threshold_ms
        )
        
        self._request_times.append(metric)
        
        if metric.is_slow:
            self._slow_requests.append(metric)
            self._trigger_alert("slow_request", metric)
    
    def record_query(
        self,
        query_type: str,
        table: str,
        duration_ms: float,
        query_preview: Optional[str] = None
    ):
        """Record a database query performance metric."""
        metric = PerformanceMetric(
            name=f"{query_type} on {table}",
            duration_ms=duration_ms,
            timestamp=datetime.utcnow(),
            metadata={
                "query_type": query_type,
                "table": table,
                "query_preview": query_preview[:100] if query_preview else None
            },
            is_slow=duration_ms > self.slow_query_threshold_ms
        )
        
        self._query_times.append(metric)
        
        if metric.is_slow:
            alert = SlowQueryAlert(
                query=query_preview or f"{query_type} on {table}",
                duration_ms=duration_ms,
                timestamp=datetime.utcnow(),
                table=table,
                threshold_ms=self.slow_query_threshold_ms
            )
            self._slow_queries.append(alert)
            self._trigger_alert("slow_query", alert)
        
        # Also record in Prometheus
        track_db_query(query_type, table, duration_ms / 1000)
    
    def _trigger_alert(self, alert_type: str, data: Any):
        """Trigger an alert callback if configured."""
        if self.alert_callback:
            try:
                self.alert_callback(alert_type, data)
            except Exception as e:
                logger.error(f"Alert callback failed: {e}")
        
        # Log slow operations
        if alert_type == "slow_query":
            logger.warning(
                f"Slow query detected: {data.query[:50]}... "
                f"took {data.duration_ms:.2f}ms (threshold: {data.threshold_ms}ms)"
            )
        elif alert_type == "slow_request":
            logger.warning(
                f"Slow request: {data.name} "
                f"took {data.duration_ms:.2f}ms"
            )
    
    def get_request_stats(self) -> Dict[str, float]:
        """Get request performance statistics."""
        if not self._request_times:
            return {"count": 0}
        
        times = [m.duration_ms for m in self._request_times]
        sorted_times = sorted(times)
        
        return {
            "count": len(times),
            "avg_ms": sum(times) / len(times),
            "min_ms": min(times),
            "max_ms": max(times),
            "p50_ms": sorted_times[len(sorted_times) // 2],
            "p95_ms": sorted_times[int(len(sorted_times) * 0.95)],
            "p99_ms": sorted_times[int(len(sorted_times) * 0.99)],
            "slow_count": len(self._slow_requests)
        }
    
    def get_query_stats(self) -> Dict[str, float]:
        """Get database query performance statistics."""
        if not self._query_times:
            return {"count": 0}
        
        times = [m.duration_ms for m in self._query_times]
        sorted_times = sorted(times)
        
        return {
            "count": len(times),
            "avg_ms": sum(times) / len(times),
            "min_ms": min(times),
            "max_ms": max(times),
            "p50_ms": sorted_times[len(sorted_times) // 2],
            "p95_ms": sorted_times[int(len(sorted_times) * 0.95)],
            "p99_ms": sorted_times[int(len(sorted_times) * 0.99)],
            "slow_count": len(self._slow_queries)
        }
    
    def get_slow_queries(self, limit: int = 10) -> List[SlowQueryAlert]:
        """Get recent slow queries."""
        return list(self._slow_queries)[-limit:]
    
    def get_slow_requests(self, limit: int = 10) -> List[PerformanceMetric]:
        """Get recent slow requests."""
        return list(self._slow_requests)[-limit:]
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get current system resource metrics."""
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used_gb": memory.used / (1024 ** 3),
                "memory_available_gb": memory.available / (1024 ** 3),
                "disk_percent": disk.percent,
                "disk_used_gb": disk.used / (1024 ** 3),
                "disk_free_gb": disk.free / (1024 ** 3)
            }
        except Exception as e:
            logger.error(f"Failed to get system metrics: {e}")
            return {}
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get a comprehensive performance summary."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "requests": self.get_request_stats(),
            "queries": self.get_query_stats(),
            "system": self.get_system_metrics(),
            "recent_slow_queries": [
                {
                    "query": sq.query[:100],
                    "duration_ms": sq.duration_ms,
                    "table": sq.table,
                    "timestamp": sq.timestamp.isoformat()
                }
                for sq in self.get_slow_queries(5)
            ]
        }


# Global performance monitor instance
_monitor: Optional[PerformanceMonitor] = None


def get_monitor() -> PerformanceMonitor:
    """Get or create the global performance monitor."""
    global _monitor
    if _monitor is None:
        _monitor = PerformanceMonitor()
    return _monitor


def init_monitor(**kwargs) -> PerformanceMonitor:
    """Initialize the global performance monitor with custom settings."""
    global _monitor
    _monitor = PerformanceMonitor(**kwargs)
    return _monitor


# =============================================================================
# Decorators and Context Managers
# =============================================================================

@contextmanager
def timed_operation(name: str, category: str = "operation"):
    """Context manager to time an operation."""
    start = time.perf_counter()
    try:
        yield
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.debug(f"{category}/{name} completed in {duration_ms:.2f}ms")


@asynccontextmanager
async def async_timed_operation(name: str, category: str = "operation"):
    """Async context manager to time an operation."""
    start = time.perf_counter()
    try:
        yield
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.debug(f"{category}/{name} completed in {duration_ms:.2f}ms")


def timed(name: Optional[str] = None, category: str = "function"):
    """Decorator to time function execution."""
    def decorator(func: Callable):
        op_name = name or func.__name__
        
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return await func(*args, **kwargs)
            finally:
                duration_ms = (time.perf_counter() - start) * 1000
                logger.debug(f"{category}/{op_name} completed in {duration_ms:.2f}ms")
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                duration_ms = (time.perf_counter() - start) * 1000
                logger.debug(f"{category}/{op_name} completed in {duration_ms:.2f}ms")
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


def track_db_performance(query_type: str, table: str):
    """Decorator to track database query performance."""
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return await func(*args, **kwargs)
            finally:
                duration_ms = (time.perf_counter() - start) * 1000
                get_monitor().record_query(query_type, table, duration_ms)
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                duration_ms = (time.perf_counter() - start) * 1000
                get_monitor().record_query(query_type, table, duration_ms)
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator
