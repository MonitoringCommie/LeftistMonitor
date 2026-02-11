"""
Structured logging configuration using structlog.
Provides JSON-formatted logs for production and human-readable logs for development.
"""

import logging
import sys
from typing import Any, Optional
import structlog
from structlog.types import Processor


def setup_logging(
    level: str = "INFO",
    json_format: bool = False,
    log_file: Optional[str] = None,
) -> None:
    """
    Configure structured logging for the application.
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        json_format: If True, output JSON logs (for production)
        log_file: Optional file path to write logs to
    """
    
    # Shared processors for both dev and prod
    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
    ]
    
    if json_format:
        # Production: JSON output
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]
    else:
        # Development: Colored, human-readable output
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    
    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, level.upper())
        ),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Also configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, level.upper()),
    )
    
    # Add file handler if specified
    if log_file:
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(getattr(logging, level.upper()))
        logging.getLogger().addHandler(file_handler)


def get_logger(name: Optional[str] = None) -> structlog.BoundLogger:
    """
    Get a structured logger instance.
    
    Args:
        name: Optional logger name (e.g., module name)
    
    Returns:
        Configured structlog logger
    """
    logger = structlog.get_logger()
    if name:
        logger = logger.bind(logger_name=name)
    return logger


# Request logging utilities
class RequestLogger:
    """Utility class for logging HTTP requests."""
    
    def __init__(self):
        self.logger = get_logger("http")
    
    def log_request(
        self,
        method: str,
        path: str,
        client_ip: Optional[str] = None,
        user_id: Optional[int] = None,
        **extra: Any,
    ) -> None:
        """Log an incoming HTTP request."""
        self.logger.info(
            "request_received",
            method=method,
            path=path,
            client_ip=client_ip,
            user_id=user_id,
            **extra,
        )
    
    def log_response(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        **extra: Any,
    ) -> None:
        """Log an HTTP response."""
        log_level = "info" if status_code < 400 else "warning" if status_code < 500 else "error"
        getattr(self.logger, log_level)(
            "request_completed",
            method=method,
            path=path,
            status_code=status_code,
            duration_ms=round(duration_ms, 2),
            **extra,
        )
    
    def log_error(
        self,
        method: str,
        path: str,
        error: str,
        error_type: str,
        **extra: Any,
    ) -> None:
        """Log an HTTP error."""
        self.logger.error(
            "request_error",
            method=method,
            path=path,
            error=error,
            error_type=error_type,
            **extra,
        )


# Database logging utilities
class DatabaseLogger:
    """Utility class for logging database operations."""
    
    def __init__(self):
        self.logger = get_logger("database")
    
    def log_query(
        self,
        query_type: str,
        table: str,
        duration_ms: float,
        rows_affected: Optional[int] = None,
        **extra: Any,
    ) -> None:
        """Log a database query."""
        self.logger.debug(
            "db_query",
            query_type=query_type,
            table=table,
            duration_ms=round(duration_ms, 2),
            rows_affected=rows_affected,
            **extra,
        )
    
    def log_connection(self, event: str, pool_size: Optional[int] = None, **extra: Any) -> None:
        """Log database connection events."""
        self.logger.info(
            "db_connection",
            event=event,
            pool_size=pool_size,
            **extra,
        )
    
    def log_migration(self, revision: str, direction: str, **extra: Any) -> None:
        """Log database migration events."""
        self.logger.info(
            "db_migration",
            revision=revision,
            direction=direction,
            **extra,
        )


# Security logging utilities
class SecurityLogger:
    """Utility class for logging security events."""
    
    def __init__(self):
        self.logger = get_logger("security")
    
    def log_auth_attempt(
        self,
        email: str,
        success: bool,
        method: str = "password",
        client_ip: Optional[str] = None,
        **extra: Any,
    ) -> None:
        """Log an authentication attempt."""
        level = "info" if success else "warning"
        getattr(self.logger, level)(
            "auth_attempt",
            email=email,
            success=success,
            method=method,
            client_ip=client_ip,
            **extra,
        )
    
    def log_auth_failure(
        self,
        email: str,
        reason: str,
        client_ip: Optional[str] = None,
        **extra: Any,
    ) -> None:
        """Log an authentication failure."""
        self.logger.warning(
            "auth_failure",
            email=email,
            reason=reason,
            client_ip=client_ip,
            **extra,
        )
    
    def log_rate_limit(
        self,
        identifier: str,
        endpoint: str,
        **extra: Any,
    ) -> None:
        """Log a rate limit hit."""
        self.logger.warning(
            "rate_limit_exceeded",
            identifier=identifier,
            endpoint=endpoint,
            **extra,
        )
    
    def log_suspicious_activity(
        self,
        activity_type: str,
        details: str,
        client_ip: Optional[str] = None,
        user_id: Optional[int] = None,
        **extra: Any,
    ) -> None:
        """Log suspicious activity."""
        self.logger.warning(
            "suspicious_activity",
            activity_type=activity_type,
            details=details,
            client_ip=client_ip,
            user_id=user_id,
            **extra,
        )
    
    def log_permission_denied(
        self,
        user_id: int,
        resource: str,
        action: str,
        **extra: Any,
    ) -> None:
        """Log a permission denial."""
        self.logger.warning(
            "permission_denied",
            user_id=user_id,
            resource=resource,
            action=action,
            **extra,
        )


# Application event logging
class AppLogger:
    """Utility class for logging application events."""
    
    def __init__(self):
        self.logger = get_logger("app")
    
    def log_startup(self, version: str, environment: str, **extra: Any) -> None:
        """Log application startup."""
        self.logger.info(
            "app_startup",
            version=version,
            environment=environment,
            **extra,
        )
    
    def log_shutdown(self, reason: str = "normal", **extra: Any) -> None:
        """Log application shutdown."""
        self.logger.info(
            "app_shutdown",
            reason=reason,
            **extra,
        )
    
    def log_cache_event(
        self,
        event: str,
        key: Optional[str] = None,
        hit: Optional[bool] = None,
        **extra: Any,
    ) -> None:
        """Log cache events."""
        self.logger.debug(
            "cache_event",
            event=event,
            key=key,
            hit=hit,
            **extra,
        )
    
    def log_external_api(
        self,
        service: str,
        endpoint: str,
        status_code: int,
        duration_ms: float,
        **extra: Any,
    ) -> None:
        """Log external API calls."""
        level = "info" if status_code < 400 else "warning"
        getattr(self.logger, level)(
            "external_api_call",
            service=service,
            endpoint=endpoint,
            status_code=status_code,
            duration_ms=round(duration_ms, 2),
            **extra,
        )


# Singleton instances for easy access
request_logger = RequestLogger()
db_logger = DatabaseLogger()
security_logger = SecurityLogger()
app_logger = AppLogger()
