"""
Prometheus Metrics Middleware

Middleware for automatically collecting HTTP request metrics.
"""

import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.routing import Match

from .metrics import (
    HTTP_REQUESTS_TOTAL,
    HTTP_REQUEST_DURATION_SECONDS,
    HTTP_REQUESTS_IN_PROGRESS,
    HTTP_REQUEST_SIZE_BYTES,
    HTTP_RESPONSE_SIZE_BYTES,
    ERRORS_TOTAL,
    get_path_template
)


class PrometheusMiddleware(BaseHTTPMiddleware):
    """
    Middleware that collects Prometheus metrics for all HTTP requests.
    
    Tracks:
    - Request count by method, endpoint, status code
    - Request duration
    - Requests in progress
    - Request/response sizes
    - Errors
    """
    
    def __init__(self, app, excluded_paths: list = None):
        super().__init__(app)
        self.excluded_paths = excluded_paths or ['/metrics', '/health', '/healthz']
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip metrics collection for excluded paths
        if request.url.path in self.excluded_paths:
            return await call_next(request)
        
        method = request.method
        path_template = get_path_template(request)
        
        # Track request size
        content_length = request.headers.get('content-length')
        if content_length:
            HTTP_REQUEST_SIZE_BYTES.labels(
                method=method,
                endpoint=path_template
            ).observe(int(content_length))
        
        # Track requests in progress
        HTTP_REQUESTS_IN_PROGRESS.labels(
            method=method,
            endpoint=path_template
        ).inc()
        
        # Time the request
        start_time = time.perf_counter()
        status_code = 500
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            
            # Track response size
            response_size = response.headers.get('content-length')
            if response_size:
                HTTP_RESPONSE_SIZE_BYTES.labels(
                    method=method,
                    endpoint=path_template
                ).observe(int(response_size))
            
            return response
            
        except Exception as e:
            # Track error
            ERRORS_TOTAL.labels(
                error_type=type(e).__name__,
                endpoint=path_template
            ).inc()
            raise
            
        finally:
            # Record duration
            duration = time.perf_counter() - start_time
            
            HTTP_REQUEST_DURATION_SECONDS.labels(
                method=method,
                endpoint=path_template
            ).observe(duration)
            
            # Increment request counter
            HTTP_REQUESTS_TOTAL.labels(
                method=method,
                endpoint=path_template,
                status_code=status_code
            ).inc()
            
            # Decrement in-progress counter
            HTTP_REQUESTS_IN_PROGRESS.labels(
                method=method,
                endpoint=path_template
            ).dec()
