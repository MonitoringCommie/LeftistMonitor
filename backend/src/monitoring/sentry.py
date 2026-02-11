"""
Sentry Error Tracking Integration

Configures Sentry for error tracking, performance monitoring,
and distributed tracing.
"""

import os
from typing import Optional, Dict, Any
from functools import wraps
import logging

# Sentry SDK imports (conditional to allow running without sentry)
try:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    from sentry_sdk.integrations.redis import RedisIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    SENTRY_AVAILABLE = True
except ImportError:
    SENTRY_AVAILABLE = False
    sentry_sdk = None

logger = logging.getLogger(__name__)


def init_sentry(
    dsn: Optional[str] = None,
    environment: str = "development",
    release: Optional[str] = None,
    sample_rate: float = 1.0,
    traces_sample_rate: float = 0.1,
    profiles_sample_rate: float = 0.1,
    enable_tracing: bool = True,
    debug: bool = False
) -> bool:
    """
    Initialize Sentry SDK with recommended settings.
    
    Args:
        dsn: Sentry DSN (Data Source Name). If None, reads from SENTRY_DSN env var.
        environment: Environment name (development, staging, production)
        release: Release version string
        sample_rate: Error sampling rate (0.0 to 1.0)
        traces_sample_rate: Performance transaction sampling rate
        profiles_sample_rate: Profiling sampling rate
        enable_tracing: Enable performance tracing
        debug: Enable debug mode for SDK
        
    Returns:
        True if Sentry was initialized successfully, False otherwise
    """
    if not SENTRY_AVAILABLE:
        logger.warning("Sentry SDK not installed. Error tracking disabled.")
        return False
    
    dsn = dsn or os.getenv("SENTRY_DSN")
    if not dsn:
        logger.info("No Sentry DSN configured. Error tracking disabled.")
        return False
    
    release = release or os.getenv("SENTRY_RELEASE", "leftistmonitor@2.0.0")
    
    try:
        sentry_sdk.init(
            dsn=dsn,
            environment=environment,
            release=release,
            
            # Sampling
            sample_rate=sample_rate,
            traces_sample_rate=traces_sample_rate if enable_tracing else 0.0,
            profiles_sample_rate=profiles_sample_rate,
            
            # Integrations
            integrations=[
                FastApiIntegration(
                    transaction_style="endpoint"
                ),
                SqlalchemyIntegration(),
                RedisIntegration(),
                LoggingIntegration(
                    level=logging.INFO,
                    event_level=logging.ERROR
                ),
            ],
            
            # Data scrubbing
            send_default_pii=False,
            
            # Before send hooks
            before_send=before_send_handler,
            before_send_transaction=before_send_transaction_handler,
            
            # Debug
            debug=debug,
            
            # Additional options
            attach_stacktrace=True,
            include_local_variables=True,
            max_breadcrumbs=50,
            
            # Ignore certain errors
            ignore_errors=[
                KeyboardInterrupt,
                SystemExit,
            ],
        )
        
        # Set default tags
        sentry_sdk.set_tag("service", "leftistmonitor-api")
        
        logger.info(f"Sentry initialized for environment: {environment}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize Sentry: {e}")
        return False


def before_send_handler(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Process events before sending to Sentry.
    Used for filtering, scrubbing, or enriching events.
    """
    # Filter out specific exceptions
    if "exc_info" in hint:
        exc_type, exc_value, tb = hint["exc_info"]
        
        # Ignore 404 errors
        if hasattr(exc_value, "status_code") and exc_value.status_code == 404:
            return None
        
        # Ignore rate limit errors
        if hasattr(exc_value, "status_code") and exc_value.status_code == 429:
            return None
    
    # Scrub sensitive data
    if "request" in event:
        request_data = event["request"]
        
        # Remove sensitive headers
        if "headers" in request_data:
            sensitive_headers = ["authorization", "cookie", "x-api-key"]
            for header in sensitive_headers:
                if header in request_data["headers"]:
                    request_data["headers"][header] = "[Filtered]"
        
        # Remove sensitive body fields
        if "data" in request_data and isinstance(request_data["data"], dict):
            sensitive_fields = ["password", "token", "secret", "api_key", "credit_card"]
            for field in sensitive_fields:
                if field in request_data["data"]:
                    request_data["data"][field] = "[Filtered]"
    
    return event


def before_send_transaction_handler(
    event: Dict[str, Any],
    hint: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Process transactions before sending to Sentry.
    Used for filtering low-value transactions.
    """
    # Skip health check transactions
    transaction_name = event.get("transaction", "")
    if transaction_name in ["/health", "/healthz", "/readyz", "/metrics"]:
        return None
    
    return event


def capture_exception(error: Exception, **kwargs) -> Optional[str]:
    """
    Capture an exception and send to Sentry.
    
    Args:
        error: The exception to capture
        **kwargs: Additional context to attach
        
    Returns:
        Event ID if captured, None otherwise
    """
    if not SENTRY_AVAILABLE or not sentry_sdk.Hub.current.client:
        logger.exception(f"Error (Sentry disabled): {error}")
        return None
    
    with sentry_sdk.push_scope() as scope:
        for key, value in kwargs.items():
            scope.set_extra(key, value)
        
        return sentry_sdk.capture_exception(error)


def capture_message(message: str, level: str = "info", **kwargs) -> Optional[str]:
    """
    Capture a message and send to Sentry.
    
    Args:
        message: The message to capture
        level: Message level (debug, info, warning, error, fatal)
        **kwargs: Additional context to attach
        
    Returns:
        Event ID if captured, None otherwise
    """
    if not SENTRY_AVAILABLE or not sentry_sdk.Hub.current.client:
        logger.log(getattr(logging, level.upper(), logging.INFO), message)
        return None
    
    with sentry_sdk.push_scope() as scope:
        for key, value in kwargs.items():
            scope.set_extra(key, value)
        
        return sentry_sdk.capture_message(message, level=level)


def set_user(user_id: str, email: Optional[str] = None, username: Optional[str] = None):
    """Set user context for error tracking."""
    if SENTRY_AVAILABLE and sentry_sdk.Hub.current.client:
        sentry_sdk.set_user({
            "id": user_id,
            "email": email,
            "username": username
        })


def set_tag(key: str, value: str):
    """Set a tag on the current scope."""
    if SENTRY_AVAILABLE and sentry_sdk.Hub.current.client:
        sentry_sdk.set_tag(key, value)


def set_context(name: str, data: Dict[str, Any]):
    """Set additional context on the current scope."""
    if SENTRY_AVAILABLE and sentry_sdk.Hub.current.client:
        sentry_sdk.set_context(name, data)


def add_breadcrumb(
    message: str,
    category: str = "custom",
    level: str = "info",
    data: Optional[Dict[str, Any]] = None
):
    """Add a breadcrumb to the current scope."""
    if SENTRY_AVAILABLE and sentry_sdk.Hub.current.client:
        sentry_sdk.add_breadcrumb(
            message=message,
            category=category,
            level=level,
            data=data or {}
        )


def track_performance(operation_name: str):
    """
    Decorator to track function performance in Sentry.
    
    Usage:
        @track_performance("database.query")
        async def fetch_data():
            ...
    """
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            if not SENTRY_AVAILABLE or not sentry_sdk.Hub.current.client:
                return await func(*args, **kwargs)
            
            with sentry_sdk.start_span(op=operation_name, description=func.__name__):
                return await func(*args, **kwargs)
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            if not SENTRY_AVAILABLE or not sentry_sdk.Hub.current.client:
                return func(*args, **kwargs)
            
            with sentry_sdk.start_span(op=operation_name, description=func.__name__):
                return func(*args, **kwargs)
        
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


class SentryMiddleware:
    """
    FastAPI middleware for Sentry integration.
    Adds request context and user information to Sentry events.
    """
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        if SENTRY_AVAILABLE and sentry_sdk.Hub.current.client:
            # Add request context
            set_context("request", {
                "method": scope.get("method"),
                "path": scope.get("path"),
                "query_string": scope.get("query_string", b"").decode(),
            })
            
            # Add client info
            client = scope.get("client")
            if client:
                set_tag("client_ip", client[0])
        
        await self.app(scope, receive, send)
