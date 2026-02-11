"""
Request/response logging middleware.
"""

import time
from typing import Callable
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from src.core.logging import request_logger, get_logger

logger = get_logger("middleware")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests and responses.
    """
    
    def __init__(
        self,
        app,
        exclude_paths: list[str] | None = None,
        log_request_body: bool = False,
        log_response_body: bool = False,
    ):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/metrics", "/docs", "/openapi.json"]
        self.log_request_body = log_request_body
        self.log_response_body = log_response_body
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip logging for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)
        
        # Extract request info
        method = request.method
        path = request.url.path
        query = str(request.query_params) if request.query_params else None
        client_ip = self._get_client_ip(request)
        user_id = getattr(request.state, "user_id", None)
        
        # Log incoming request
        request_logger.log_request(
            method=method,
            path=path,
            client_ip=client_ip,
            user_id=user_id,
            query_params=query,
        )
        
        # Process request and measure duration
        start_time = time.perf_counter()
        
        try:
            response = await call_next(request)
        except Exception as e:
            # Log error
            duration_ms = (time.perf_counter() - start_time) * 1000
            request_logger.log_error(
                method=method,
                path=path,
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=duration_ms,
            )
            raise
        
        # Calculate duration
        duration_ms = (time.perf_counter() - start_time) * 1000
        
        # Log response
        request_logger.log_response(
            method=method,
            path=path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            content_length=response.headers.get("content-length"),
        )
        
        # Add timing header
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, considering proxies."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
