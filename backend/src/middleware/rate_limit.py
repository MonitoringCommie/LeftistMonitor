"""
Rate limiting middleware for API protection.
Uses Redis for distributed rate limiting across multiple instances.
"""

import time
from typing import Optional, Callable
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import hashlib

from src.cache import get_redis


class RateLimitExceeded(HTTPException):
    def __init__(self, retry_after: int):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Retry after {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )


class RateLimiter:
    """
    Token bucket rate limiter using Redis.
    
    Allows burst traffic while maintaining average rate limits.
    """
    
    def __init__(
        self,
        requests_per_minute: int = 60,
        burst_size: int = 10,
        key_prefix: str = "ratelimit",
    ):
        self.requests_per_minute = requests_per_minute
        self.burst_size = burst_size
        self.key_prefix = key_prefix
        self.refill_rate = requests_per_minute / 60.0  # tokens per second
    
    def _get_key(self, identifier: str) -> str:
        """Generate Redis key for rate limit tracking."""
        return f"{self.key_prefix}:{identifier}"
    
    async def is_allowed(self, identifier: str) -> tuple[bool, int]:
        """
        Check if request is allowed under rate limit.
        
        Returns:
            tuple: (is_allowed, retry_after_seconds)
        """
        key = self._get_key(identifier)
        now = time.time()
        
        try:
            redis_client = await get_redis()
            # Use Redis pipeline for atomic operations
            pipe = redis_client.pipeline()
            
            # Get current bucket state
            pipe.hgetall(key)
            result = await pipe.execute()
            bucket_data = result[0] if result else {}
            
            if bucket_data:
                tokens = float(bucket_data.get(b"tokens", self.burst_size))
                last_update = float(bucket_data.get(b"last_update", now))
            else:
                tokens = self.burst_size
                last_update = now
            
            # Refill tokens based on time elapsed
            elapsed = now - last_update
            tokens = min(self.burst_size, tokens + elapsed * self.refill_rate)
            
            if tokens >= 1:
                # Allow request, consume one token
                tokens -= 1
                
                pipe = redis_client.pipeline()  # reuse the local client
                pipe.hset(key, mapping={"tokens": tokens, "last_update": now})
                pipe.expire(key, 120)  # Expire after 2 minutes of inactivity
                await pipe.execute()
                
                return True, 0
            else:
                # Rate limited - calculate retry time
                retry_after = int((1 - tokens) / self.refill_rate)
                return False, max(1, retry_after)
                
        except Exception:
            # On Redis error, allow the request
            return True, 0
    
    async def check(self, identifier: str) -> None:
        """Check rate limit and raise exception if exceeded."""
        allowed, retry_after = await self.is_allowed(identifier)
        if not allowed:
            raise RateLimitExceeded(retry_after)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting.
    
    Rate limits are applied per-IP for anonymous users and per-user for authenticated users.
    """
    
    def __init__(
        self,
        app,
        requests_per_minute: int = 60,
        burst_size: int = 10,
        exempt_paths: Optional[list[str]] = None,
        get_identifier: Optional[Callable[[Request], str]] = None,
    ):
        super().__init__(app)
        self.limiter = RateLimiter(
            requests_per_minute=requests_per_minute,
            burst_size=burst_size,
        )
        self.exempt_paths = exempt_paths or [
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
        ]
        self.get_identifier = get_identifier or self._default_identifier
    
    def _default_identifier(self, request: Request) -> str:
        """Get client identifier from request."""
        # Check for authenticated user first
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}"
        
        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host if request.client else "unknown"
        
        # Hash the IP for privacy
        return f"ip:{hashlib.sha256(ip.encode()).hexdigest()[:16]}"
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip rate limiting for exempt paths
        if any(request.url.path.startswith(path) for path in self.exempt_paths):
            return await call_next(request)
        
        identifier = self.get_identifier(request)
        
        try:
            await self.limiter.check(identifier)
        except RateLimitExceeded as e:
            return Response(
                content=e.detail,
                status_code=e.status_code,
                headers=e.headers,
            )
        
        response = await call_next(request)
        return response


# Endpoint-specific rate limiters
auth_limiter = RateLimiter(
    requests_per_minute=10,  # Stricter limit for auth endpoints
    burst_size=5,
    key_prefix="ratelimit:auth",
)

search_limiter = RateLimiter(
    requests_per_minute=30,  # Moderate limit for search
    burst_size=10,
    key_prefix="ratelimit:search",
)

api_limiter = RateLimiter(
    requests_per_minute=120,  # Higher limit for general API
    burst_size=20,
    key_prefix="ratelimit:api",
)


# Dependency for route-level rate limiting
async def rate_limit_auth(request: Request):
    """Rate limit dependency for auth endpoints."""
    identifier = request.client.host if request.client else "unknown"
    await auth_limiter.check(f"auth:{identifier}")


async def rate_limit_search(request: Request):
    """Rate limit dependency for search endpoints."""
    identifier = request.client.host if request.client else "unknown"
    await search_limiter.check(f"search:{identifier}")
