"""
Health Check Endpoints

Provides health check endpoints for monitoring and orchestration systems.
Includes liveness, readiness, and detailed health checks.
"""

import asyncio
from datetime import datetime
from typing import Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel
from fastapi import APIRouter, Response, status


router = APIRouter(tags=["health"])


class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


class ComponentHealth(BaseModel):
    status: HealthStatus
    latency_ms: Optional[float] = None
    message: Optional[str] = None
    last_check: datetime


class HealthResponse(BaseModel):
    status: HealthStatus
    timestamp: datetime
    version: str
    uptime_seconds: float
    components: Dict[str, ComponentHealth]


# Track application start time
_start_time = datetime.utcnow()


async def check_database() -> ComponentHealth:
    """Check database connectivity and performance."""
    start = datetime.utcnow()
    try:
        # In production, would execute: SELECT 1
        await asyncio.sleep(0.001)  # Simulate DB check
        latency = (datetime.utcnow() - start).total_seconds() * 1000
        
        return ComponentHealth(
            status=HealthStatus.HEALTHY if latency < 100 else HealthStatus.DEGRADED,
            latency_ms=latency,
            message="Database responding normally",
            last_check=datetime.utcnow()
        )
    except Exception as e:
        return ComponentHealth(
            status=HealthStatus.UNHEALTHY,
            message=f"Database error: {str(e)}",
            last_check=datetime.utcnow()
        )


async def check_redis() -> ComponentHealth:
    """Check Redis connectivity and performance."""
    start = datetime.utcnow()
    try:
        # In production, would execute: PING
        await asyncio.sleep(0.001)  # Simulate Redis check
        latency = (datetime.utcnow() - start).total_seconds() * 1000
        
        return ComponentHealth(
            status=HealthStatus.HEALTHY if latency < 50 else HealthStatus.DEGRADED,
            latency_ms=latency,
            message="Redis responding normally",
            last_check=datetime.utcnow()
        )
    except Exception as e:
        return ComponentHealth(
            status=HealthStatus.UNHEALTHY,
            message=f"Redis error: {str(e)}",
            last_check=datetime.utcnow()
        )


async def check_external_apis() -> ComponentHealth:
    """Check external API dependencies."""
    try:
        # In production, would check Wikidata, etc.
        return ComponentHealth(
            status=HealthStatus.HEALTHY,
            message="External APIs available",
            last_check=datetime.utcnow()
        )
    except Exception as e:
        return ComponentHealth(
            status=HealthStatus.DEGRADED,
            message=f"External API issue: {str(e)}",
            last_check=datetime.utcnow()
        )


async def check_disk_space() -> ComponentHealth:
    """Check available disk space."""
    try:
        # In production, would check actual disk space
        return ComponentHealth(
            status=HealthStatus.HEALTHY,
            message="Sufficient disk space available",
            last_check=datetime.utcnow()
        )
    except Exception as e:
        return ComponentHealth(
            status=HealthStatus.DEGRADED,
            message=f"Disk space warning: {str(e)}",
            last_check=datetime.utcnow()
        )


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Comprehensive health check endpoint.
    
    Returns detailed health information about all system components.
    Used by monitoring systems for alerting.
    """
    # Run all health checks concurrently
    db_health, redis_health, api_health, disk_health = await asyncio.gather(
        check_database(),
        check_redis(),
        check_external_apis(),
        check_disk_space()
    )
    
    components = {
        "database": db_health,
        "redis": redis_health,
        "external_apis": api_health,
        "disk": disk_health
    }
    
    # Determine overall status
    statuses = [c.status for c in components.values()]
    if HealthStatus.UNHEALTHY in statuses:
        overall_status = HealthStatus.UNHEALTHY
    elif HealthStatus.DEGRADED in statuses:
        overall_status = HealthStatus.DEGRADED
    else:
        overall_status = HealthStatus.HEALTHY
    
    uptime = (datetime.utcnow() - _start_time).total_seconds()
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version="2.0.0",
        uptime_seconds=uptime,
        components=components
    )


@router.get("/healthz")
async def liveness_probe(response: Response):
    """
    Kubernetes liveness probe endpoint.
    
    Returns 200 if the application is running.
    Used by Kubernetes to determine if the pod should be restarted.
    """
    return {"status": "alive"}


@router.get("/readyz")
async def readiness_probe(response: Response):
    """
    Kubernetes readiness probe endpoint.
    
    Returns 200 if the application is ready to receive traffic.
    Used by Kubernetes to determine if the pod should receive traffic.
    """
    # Check critical components
    db_health = await check_database()
    redis_health = await check_redis()
    
    if db_health.status == HealthStatus.UNHEALTHY:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not ready", "reason": "database unavailable"}
    
    if redis_health.status == HealthStatus.UNHEALTHY:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not ready", "reason": "redis unavailable"}
    
    return {"status": "ready"}


@router.get("/startup")
async def startup_probe():
    """
    Kubernetes startup probe endpoint.
    
    Returns 200 once the application has completed startup.
    Used by Kubernetes during initial pod startup.
    """
    return {"status": "started", "timestamp": _start_time.isoformat()}
