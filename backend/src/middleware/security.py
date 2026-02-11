"""
Security configuration for CORS, headers, and other protections.
"""

from typing import Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


# Environment-based CORS origins
CORS_ORIGINS_DEV = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

CORS_ORIGINS_PROD = [
    "https://leftistmonitor.org",
    "https://www.leftistmonitor.org",
    "https://app.leftistmonitor.org",
]


def configure_cors(
    app: FastAPI,
    environment: str = "development",
    additional_origins: Optional[list[str]] = None,
):
    """
    Configure CORS middleware with environment-appropriate settings.
    
    Args:
        app: FastAPI application instance
        environment: 'development' or 'production'
        additional_origins: Extra origins to allow
    """
    if environment == "production":
        origins = CORS_ORIGINS_PROD.copy()
        allow_credentials = True
    else:
        origins = CORS_ORIGINS_DEV.copy()
        allow_credentials = True
    
    if additional_origins:
        origins.extend(additional_origins)
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "X-CSRF-Token",
        ],
        expose_headers=[
            "X-Total-Count",
            "X-Page",
            "X-Per-Page",
            "X-Total-Pages",
        ],
        max_age=600,  # Cache preflight for 10 minutes
    )


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    
    Implements:
    - Content-Security-Policy
    - X-Content-Type-Options
    - X-Frame-Options
    - X-XSS-Protection
    - Referrer-Policy
    - Permissions-Policy
    """
    
    def __init__(
        self,
        app,
        environment: str = "development",
        report_uri: Optional[str] = None,
    ):
        super().__init__(app)
        self.environment = environment
        self.report_uri = report_uri
    
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        
        # Content-Security-Policy
        if self.environment == "production":
            csp = self._build_csp_production()
        else:
            csp = self._build_csp_development()
        
        response.headers["Content-Security-Policy"] = csp
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS Protection (legacy, but still useful)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (formerly Feature-Policy)
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
            "magnetometer=(), microphone=(), payment=(), usb=()"
        )
        
        # HSTS in production
        if self.environment == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        return response
    
    def _build_csp_production(self) -> str:
        """Build strict CSP for production."""
        directives = [
            "default-src 'self'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",  # Required for Tailwind
            "img-src 'self' data: https: blob:",
            "font-src 'self'",
            "connect-src 'self' https://api.maptiler.com https://*.tiles.mapbox.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "worker-src 'self' blob:",
        ]
        
        if self.report_uri:
            directives.append(f"report-uri {self.report_uri}")
        
        return "; ".join(directives)
    
    def _build_csp_development(self) -> str:
        """Build permissive CSP for development."""
        directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # Vite HMR
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self'",
            "connect-src 'self' ws: wss: https://api.maptiler.com https://*.tiles.mapbox.com",
            "frame-ancestors 'none'",
        ]
        return "; ".join(directives)


def configure_security(
    app: FastAPI,
    environment: str = "development",
    csp_report_uri: Optional[str] = None,
):
    """
    Configure all security middleware for the application.
    
    Args:
        app: FastAPI application instance
        environment: 'development' or 'production'
        csp_report_uri: Optional URI for CSP violation reports
    """
    # Add security headers
    app.add_middleware(
        SecurityHeadersMiddleware,
        environment=environment,
        report_uri=csp_report_uri,
    )
    
    # Configure CORS
    configure_cors(app, environment)
