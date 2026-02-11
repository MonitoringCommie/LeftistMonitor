"""Redis caching layer for performance optimization."""
import json
import hashlib
from typing import Optional, Any, Callable, TypeVar, Union
from functools import wraps
from datetime import timedelta
import redis.asyncio as redis
from fastapi import Request

from .config import get_settings

settings = get_settings()

# Redis connection pool
_redis_pool: Optional[redis.ConnectionPool] = None
_redis_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    """Get Redis client instance (lazy initialization)."""
    global _redis_pool, _redis_client

    if _redis_client is None:
        _redis_pool = redis.ConnectionPool.from_url(
            settings.redis_url,
            decode_responses=True,
            max_connections=50,
        )
        _redis_client = redis.Redis(connection_pool=_redis_pool)

    return _redis_client


async def close_redis():
    """Close Redis connection pool."""
    global _redis_pool, _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
    if _redis_pool:
        await _redis_pool.disconnect()
        _redis_pool = None


# Cache key prefixes for different data types
class CachePrefix:
    """Cache key prefixes for organization."""
    COUNTRIES = "countries"
    COUNTRY = "country"
    BORDERS = "borders"
    PEOPLE = "people"
    PERSON = "person"
    EVENTS = "events"
    BOOKS = "books"
    CONFLICTS = "conflicts"
    ELECTIONS = "elections"
    STATS = "stats"
    SEARCH = "search"
    ECONOMIC = "economic"
    GEOJSON = "geojson"
    TOKEN_BLACKLIST = "token:blacklist"


# Default TTLs for different cache types
class CacheTTL:
    """Default TTL values in seconds."""
    SHORT = 60 * 5          # 5 minutes
    MEDIUM = 60 * 30        # 30 minutes
    LONG = 60 * 60          # 1 hour
    VERY_LONG = 60 * 60 * 6 # 6 hours
    DAY = 60 * 60 * 24      # 24 hours

    # Specific TTLs
    STATS = SHORT           # Stats change frequently
    COUNTRIES = LONG        # Countries rarely change
    ECONOMIC = DAY          # Economic data rarely changes
    GEOJSON = VERY_LONG     # GeoJSON rarely changes
    SEARCH = MEDIUM         # Search results
    TOKEN = 60 * 60 * 24 * 7  # 7 days for token blacklist


def make_cache_key(*args, prefix: str = "", **kwargs) -> str:
    """Generate a consistent cache key from arguments.

    Args:
        *args: Positional arguments to include in key
        prefix: Optional prefix for the key
        **kwargs: Keyword arguments to include in key

    Returns:
        A deterministic cache key string
    """
    # Combine args and kwargs into a hashable structure
    key_parts = [prefix] if prefix else []

    for arg in args:
        if arg is not None:
            key_parts.append(str(arg))

    # Sort kwargs for deterministic ordering
    for k, v in sorted(kwargs.items()):
        if v is not None:
            key_parts.append(f"{k}={v}")

    key_string = ":".join(key_parts)

    # If key is too long, hash it
    if len(key_string) > 200:
        hash_suffix = hashlib.md5(key_string.encode()).hexdigest()[:16]
        key_string = f"{prefix}:hash:{hash_suffix}"

    return key_string


async def cache_get(key: str) -> Optional[Any]:
    """Get value from cache.

    Args:
        key: Cache key

    Returns:
        Cached value (deserialized from JSON) or None
    """
    try:
        client = await get_redis()
        value = await client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception:
        # Cache failures should not break the application
        return None


async def cache_set(
    key: str,
    value: Any,
    ttl: int = CacheTTL.MEDIUM,
) -> bool:
    """Set value in cache.

    Args:
        key: Cache key
        value: Value to cache (will be JSON serialized)
        ttl: Time-to-live in seconds

    Returns:
        True if successful
    """
    try:
        client = await get_redis()
        serialized = json.dumps(value, default=str)
        await client.setex(key, ttl, serialized)
        return True
    except Exception:
        return False


async def cache_delete(key: str) -> bool:
    """Delete a key from cache.

    Args:
        key: Cache key to delete

    Returns:
        True if key was deleted
    """
    try:
        client = await get_redis()
        result = await client.delete(key)
        return result > 0
    except Exception:
        return False


async def cache_delete_pattern(pattern: str) -> int:
    """Delete all keys matching a pattern.

    Args:
        pattern: Glob-style pattern (e.g., "countries:*")

    Returns:
        Number of keys deleted
    """
    try:
        client = await get_redis()
        keys = []
        async for key in client.scan_iter(match=pattern, count=100):
            keys.append(key)

        if keys:
            return await client.delete(*keys)
        return 0
    except Exception:
        return 0


async def invalidate_entity_cache(entity_type: str, entity_id: Optional[str] = None):
    """Invalidate cache for an entity type.

    Args:
        entity_type: Type of entity (e.g., "countries", "people")
        entity_id: Optional specific entity ID
    """
    if entity_id:
        # Delete specific entity and related patterns
        await cache_delete(f"{entity_type}:{entity_id}")
        await cache_delete_pattern(f"{entity_type}:{entity_id}:*")
    else:
        # Delete all cache for this entity type
        await cache_delete_pattern(f"{entity_type}:*")

    # Also invalidate stats cache since counts may have changed
    await cache_delete_pattern(f"{CachePrefix.STATS}:*")


# Token blacklist functions (for logout/token revocation)
async def blacklist_token(jti: str, ttl: int = CacheTTL.TOKEN) -> bool:
    """Add a token to the blacklist.

    Args:
        jti: JWT token ID
        ttl: How long to keep in blacklist

    Returns:
        True if successful
    """
    key = f"{CachePrefix.TOKEN_BLACKLIST}:{jti}"
    return await cache_set(key, {"blacklisted": True}, ttl)


async def is_token_blacklisted(jti: str) -> bool:
    """Check if a token is blacklisted.

    Args:
        jti: JWT token ID

    Returns:
        True if token is blacklisted
    """
    key = f"{CachePrefix.TOKEN_BLACKLIST}:{jti}"
    result = await cache_get(key)
    return result is not None


# Decorator for caching function results
T = TypeVar('T')


def cached(
    prefix: str,
    ttl: int = CacheTTL.MEDIUM,
    key_builder: Optional[Callable[..., str]] = None,
):
    """Decorator to cache function results.

    Args:
        prefix: Cache key prefix
        ttl: Time-to-live in seconds
        key_builder: Optional custom function to build cache key

    Example:
        @cached(prefix="countries", ttl=CacheTTL.LONG)
        async def get_countries(year: int):
            ...
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Filter out non-cacheable args (like db sessions)
                cacheable_kwargs = {
                    k: v for k, v in kwargs.items()
                    if not k.startswith('_') and k not in ('db', 'session', 'request')
                }
                cache_key = make_cache_key(prefix=prefix, **cacheable_kwargs)

            # Try to get from cache
            cached_result = await cache_get(cache_key)
            if cached_result is not None:
                return cached_result

            # Call function and cache result
            result = await func(*args, **kwargs)

            # Cache the result
            await cache_set(cache_key, result, ttl)

            return result

        return wrapper
    return decorator


# Utility function to get cache stats
async def get_cache_stats() -> dict:
    """Get cache statistics.

    Returns:
        Dictionary with cache statistics
    """
    try:
        client = await get_redis()
        info = await client.info("stats")
        memory = await client.info("memory")

        return {
            "hits": info.get("keyspace_hits", 0),
            "misses": info.get("keyspace_misses", 0),
            "used_memory": memory.get("used_memory_human", "unknown"),
            "connected": True,
        }
    except Exception as e:
        return {
            "connected": False,
            "error": str(e),
        }
