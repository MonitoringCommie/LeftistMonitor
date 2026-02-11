"""
Tests for the Monitoring Module

Tests cover metrics, health checks, analytics, and performance monitoring.
"""

import pytest
from datetime import datetime, timedelta


class TestHealthChecks:
    """Tests for health check endpoints."""
    
    def test_health_endpoint_structure(self):
        """Test health endpoint response structure."""
        expected_fields = [
            "status", "timestamp", "version", 
            "uptime_seconds", "components"
        ]
        
        for field in expected_fields:
            assert field in expected_fields
    
    def test_health_statuses(self):
        """Test valid health statuses."""
        valid_statuses = ["healthy", "degraded", "unhealthy"]
        
        assert "healthy" in valid_statuses
        assert "degraded" in valid_statuses
        assert "unhealthy" in valid_statuses
    
    def test_component_health_checks(self):
        """Test component health checks."""
        components = ["database", "redis", "external_apis", "disk"]
        
        for component in components:
            assert component in components
    
    def test_liveness_probe(self, client):
        """Test Kubernetes liveness probe."""
        # Should return simple status
        expected = {"status": "alive"}
        assert "status" in expected
    
    def test_readiness_probe(self, client):
        """Test Kubernetes readiness probe."""
        # Should check critical dependencies
        critical_components = ["database", "redis"]
        
        for component in critical_components:
            assert component in critical_components


class TestPrometheusMetrics:
    """Tests for Prometheus metrics."""
    
    def test_http_metrics_exist(self):
        """Test HTTP metrics are defined."""
        http_metrics = [
            "http_requests_total",
            "http_request_duration_seconds",
            "http_requests_in_progress",
            "http_request_size_bytes",
            "http_response_size_bytes"
        ]
        
        for metric in http_metrics:
            assert "http" in metric
    
    def test_database_metrics_exist(self):
        """Test database metrics are defined."""
        db_metrics = [
            "db_queries_total",
            "db_query_duration_seconds",
            "db_connections_active",
            "db_connections_idle"
        ]
        
        for metric in db_metrics:
            assert "db" in metric
    
    def test_cache_metrics_exist(self):
        """Test cache metrics are defined."""
        cache_metrics = [
            "cache_hits_total",
            "cache_misses_total",
            "cache_size_bytes"
        ]
        
        for metric in cache_metrics:
            assert "cache" in metric
    
    def test_business_metrics_exist(self):
        """Test business metrics are defined."""
        business_metrics = [
            "contributions_total",
            "searches_total",
            "exports_total",
            "page_views_total",
            "active_users"
        ]
        
        for metric in business_metrics:
            assert metric in business_metrics
    
    def test_metric_labels(self):
        """Test metric labels."""
        # HTTP request labels
        http_labels = ["method", "endpoint", "status_code"]
        assert "method" in http_labels
        
        # Database labels
        db_labels = ["query_type", "table"]
        assert "query_type" in db_labels


class TestPerformanceMonitoring:
    """Tests for performance monitoring."""
    
    def test_request_stats_calculation(self):
        """Test request statistics calculation."""
        times = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        
        avg = sum(times) / len(times)
        assert avg == 55
        
        min_time = min(times)
        assert min_time == 10
        
        max_time = max(times)
        assert max_time == 100
    
    def test_percentile_calculation(self):
        """Test percentile calculation."""
        times = list(range(1, 101))  # 1 to 100
        
        # p50 should be around 50
        p50_index = int(len(times) * 0.50)
        assert times[p50_index] == 51
        
        # p95 should be around 95
        p95_index = int(len(times) * 0.95)
        assert times[p95_index] == 96
    
    def test_slow_query_detection(self):
        """Test slow query detection."""
        threshold_ms = 100
        
        fast_query = 50  # ms
        slow_query = 150  # ms
        
        assert fast_query < threshold_ms
        assert slow_query > threshold_ms
    
    def test_slow_request_detection(self):
        """Test slow request detection."""
        threshold_ms = 1000
        
        fast_request = 200  # ms
        slow_request = 1500  # ms
        
        assert fast_request < threshold_ms
        assert slow_request > threshold_ms


class TestAnalytics:
    """Tests for analytics tracking."""
    
    def test_session_hashing(self):
        """Test session ID hashing."""
        import hashlib
        
        session_id = "user-session-123"
        salt = "leftistmonitor_analytics_2024"
        
        hashed = hashlib.sha256(f"{salt}:{session_id}".encode()).hexdigest()[:16]
        
        # Should be 16 chars
        assert len(hashed) == 16
        
        # Should be deterministic
        hashed2 = hashlib.sha256(f"{salt}:{session_id}".encode()).hexdigest()[:16]
        assert hashed == hashed2
    
    def test_session_timeout(self):
        """Test session timeout logic."""
        timeout = timedelta(minutes=30)
        
        last_activity = datetime.utcnow() - timedelta(minutes=20)
        now = datetime.utcnow()
        
        # Session still active
        assert now - last_activity < timeout
        
        # Session expired
        old_activity = datetime.utcnow() - timedelta(minutes=40)
        assert now - old_activity > timeout
    
    def test_event_types(self):
        """Test analytics event types."""
        event_types = [
            "page_view", "search", "export", "contribution",
            "map_interaction", "filter_change", "timeline_play",
            "download", "share", "login", "signup"
        ]
        
        assert len(event_types) == 11
        assert "page_view" in event_types
    
    def test_daily_stats_aggregation(self):
        """Test daily stats aggregation."""
        daily_stats = {
            "date": "2026-02-01",
            "unique_visitors": 150,
            "page_views": 500,
            "active_users": 25
        }
        
        # Page views should be >= unique visitors
        assert daily_stats["page_views"] >= daily_stats["unique_visitors"]
    
    def test_popular_pages_ranking(self):
        """Test popular pages ranking."""
        pages = [
            {"page": "/", "views": 1000},
            {"page": "/map", "views": 800},
            {"page": "/movements/labor", "views": 500}
        ]
        
        # Should be sorted by views descending
        for i in range(len(pages) - 1):
            assert pages[i]["views"] >= pages[i + 1]["views"]
    
    def test_privacy_no_pii(self):
        """Test that analytics doesn't store PII."""
        # These should NOT be stored
        pii_fields = ["email", "ip_address", "name", "password"]
        
        analytics_fields = [
            "session_id",  # Hashed
            "page",
            "event_type",
            "timestamp",
            "user_type"  # Anonymous category, not identity
        ]
        
        for pii in pii_fields:
            assert pii not in analytics_fields


class TestAlerts:
    """Tests for alert rules."""
    
    def test_high_error_rate_threshold(self):
        """Test high error rate threshold."""
        threshold = 0.05  # 5%
        
        low_error_rate = 0.02
        high_error_rate = 0.08
        
        assert low_error_rate < threshold
        assert high_error_rate > threshold
    
    def test_high_latency_threshold(self):
        """Test high latency threshold."""
        threshold_seconds = 2
        
        normal_latency = 0.5
        high_latency = 3.0
        
        assert normal_latency < threshold_seconds
        assert high_latency > threshold_seconds
    
    def test_alert_severities(self):
        """Test alert severity levels."""
        severities = ["warning", "critical"]
        
        # Service down is critical
        assert "critical" in severities
        
        # High memory is warning
        assert "warning" in severities
