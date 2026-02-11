"""
User Analytics Module

Privacy-respecting analytics for understanding user behavior
and improving the platform. Does not track PII.
"""

import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
import logging

from .metrics import (
    PAGE_VIEWS_TOTAL,
    SEARCHES_TOTAL,
    ACTIVE_USERS,
    track_search
)

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Types of analytics events."""
    PAGE_VIEW = "page_view"
    SEARCH = "search"
    EXPORT = "export"
    CONTRIBUTION = "contribution"
    MAP_INTERACTION = "map_interaction"
    FILTER_CHANGE = "filter_change"
    TIMELINE_PLAY = "timeline_play"
    DOWNLOAD = "download"
    SHARE = "share"
    LOGIN = "login"
    SIGNUP = "signup"


@dataclass
class AnalyticsEvent:
    """A single analytics event."""
    event_type: EventType
    timestamp: datetime
    session_id: str
    page: Optional[str] = None
    properties: Dict[str, Any] = field(default_factory=dict)
    user_type: str = "anonymous"  # anonymous, authenticated, contributor, moderator


@dataclass
class SessionInfo:
    """Information about a user session."""
    session_id: str
    started_at: datetime
    last_activity: datetime
    page_views: int = 0
    searches: int = 0
    events: List[str] = field(default_factory=list)
    user_type: str = "anonymous"
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    country: Optional[str] = None


class AnalyticsTracker:
    """
    Privacy-respecting analytics tracker.
    
    Features:
    - No PII collection
    - Session-based tracking with hashed IDs
    - Aggregated metrics only
    - Configurable retention
    """
    
    def __init__(
        self,
        session_timeout_minutes: int = 30,
        retention_days: int = 90,
        anonymize_ip: bool = True
    ):
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
        self.retention_days = retention_days
        self.anonymize_ip = anonymize_ip
        
        # In-memory storage (in production, use Redis/database)
        self._sessions: Dict[str, SessionInfo] = {}
        self._events: List[AnalyticsEvent] = []
        
        # Aggregated stats
        self._hourly_page_views: Dict[str, int] = defaultdict(int)
        self._daily_users: Dict[str, set] = defaultdict(set)
        self._popular_pages: Dict[str, int] = defaultdict(int)
        self._search_terms: Dict[str, int] = defaultdict(int)
        self._feature_usage: Dict[str, int] = defaultdict(int)
    
    def _hash_identifier(self, identifier: str) -> str:
        """Create a non-reversible hash of an identifier."""
        # Add salt to prevent rainbow table attacks
        salt = "leftistmonitor_analytics_2024"
        return hashlib.sha256(f"{salt}:{identifier}".encode()).hexdigest()[:16]
    
    def _get_or_create_session(
        self,
        session_id: str,
        user_type: str = "anonymous",
        referrer: Optional[str] = None,
        user_agent: Optional[str] = None,
        country: Optional[str] = None
    ) -> SessionInfo:
        """Get existing session or create a new one."""
        hashed_id = self._hash_identifier(session_id)
        now = datetime.utcnow()
        
        if hashed_id in self._sessions:
            session = self._sessions[hashed_id]
            # Check if session has expired
            if now - session.last_activity > self.session_timeout:
                # Create new session
                session = SessionInfo(
                    session_id=hashed_id,
                    started_at=now,
                    last_activity=now,
                    user_type=user_type,
                    referrer=referrer,
                    user_agent=user_agent,
                    country=country
                )
                self._sessions[hashed_id] = session
            else:
                session.last_activity = now
        else:
            session = SessionInfo(
                session_id=hashed_id,
                started_at=now,
                last_activity=now,
                user_type=user_type,
                referrer=referrer,
                user_agent=user_agent,
                country=country
            )
            self._sessions[hashed_id] = session
        
        return session
    
    def track_page_view(
        self,
        page: str,
        session_id: str,
        user_type: str = "anonymous",
        referrer: Optional[str] = None,
        **properties
    ):
        """Track a page view event."""
        session = self._get_or_create_session(session_id, user_type, referrer)
        session.page_views += 1
        
        event = AnalyticsEvent(
            event_type=EventType.PAGE_VIEW,
            timestamp=datetime.utcnow(),
            session_id=session.session_id,
            page=page,
            properties=properties,
            user_type=user_type
        )
        
        self._events.append(event)
        
        # Update aggregates
        hour_key = datetime.utcnow().strftime("%Y-%m-%d-%H")
        day_key = datetime.utcnow().strftime("%Y-%m-%d")
        
        self._hourly_page_views[hour_key] += 1
        self._daily_users[day_key].add(session.session_id)
        self._popular_pages[page] += 1
        
        # Prometheus metric
        PAGE_VIEWS_TOTAL.labels(page=page).inc()
    
    def track_search(
        self,
        query: str,
        search_type: str,
        session_id: str,
        results_count: int = 0,
        **properties
    ):
        """Track a search event."""
        session = self._get_or_create_session(session_id)
        session.searches += 1
        
        # Anonymize search query (keep only first word for category)
        category = query.split()[0].lower() if query else "empty"
        
        event = AnalyticsEvent(
            event_type=EventType.SEARCH,
            timestamp=datetime.utcnow(),
            session_id=session.session_id,
            properties={
                "search_type": search_type,
                "results_count": results_count,
                "category": category,
                **properties
            }
        )
        
        self._events.append(event)
        self._search_terms[category] += 1
        
        # Prometheus metric
        track_search(search_type)
    
    def track_event(
        self,
        event_type: EventType,
        session_id: str,
        page: Optional[str] = None,
        **properties
    ):
        """Track a generic event."""
        session = self._get_or_create_session(session_id)
        session.events.append(event_type.value)
        
        event = AnalyticsEvent(
            event_type=event_type,
            timestamp=datetime.utcnow(),
            session_id=session.session_id,
            page=page,
            properties=properties
        )
        
        self._events.append(event)
        self._feature_usage[event_type.value] += 1
    
    def track_map_interaction(
        self,
        interaction_type: str,
        session_id: str,
        region: Optional[str] = None,
        zoom_level: Optional[int] = None,
        **properties
    ):
        """Track map interaction event."""
        self.track_event(
            EventType.MAP_INTERACTION,
            session_id,
            properties={
                "interaction_type": interaction_type,
                "region": region,
                "zoom_level": zoom_level,
                **properties
            }
        )
    
    def get_active_users(self) -> int:
        """Get count of currently active users."""
        now = datetime.utcnow()
        active_count = sum(
            1 for session in self._sessions.values()
            if now - session.last_activity < self.session_timeout
        )
        
        # Update Prometheus gauge
        ACTIVE_USERS.labels(user_type="total").set(active_count)
        
        return active_count
    
    def get_daily_stats(self, date: Optional[str] = None) -> Dict[str, Any]:
        """Get statistics for a specific day."""
        day_key = date or datetime.utcnow().strftime("%Y-%m-%d")
        
        # Count page views for the day
        page_views = sum(
            count for key, count in self._hourly_page_views.items()
            if key.startswith(day_key)
        )
        
        return {
            "date": day_key,
            "unique_visitors": len(self._daily_users.get(day_key, set())),
            "page_views": page_views,
            "active_users": self.get_active_users()
        }
    
    def get_popular_pages(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most popular pages."""
        sorted_pages = sorted(
            self._popular_pages.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        return [
            {"page": page, "views": views}
            for page, views in sorted_pages
        ]
    
    def get_popular_searches(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most common search categories."""
        sorted_terms = sorted(
            self._search_terms.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        return [
            {"category": term, "count": count}
            for term, count in sorted_terms
        ]
    
    def get_feature_usage(self) -> Dict[str, int]:
        """Get feature usage counts."""
        return dict(self._feature_usage)
    
    def get_analytics_summary(self) -> Dict[str, Any]:
        """Get comprehensive analytics summary."""
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "daily": self.get_daily_stats(),
            "active_sessions": len([
                s for s in self._sessions.values()
                if datetime.utcnow() - s.last_activity < self.session_timeout
            ]),
            "popular_pages": self.get_popular_pages(5),
            "popular_searches": self.get_popular_searches(5),
            "feature_usage": self.get_feature_usage(),
            "total_events": len(self._events)
        }
    
    def cleanup_old_data(self):
        """Remove data older than retention period."""
        cutoff = datetime.utcnow() - timedelta(days=self.retention_days)
        
        # Remove old events
        self._events = [
            e for e in self._events
            if e.timestamp > cutoff
        ]
        
        # Remove old sessions
        self._sessions = {
            k: v for k, v in self._sessions.items()
            if v.last_activity > cutoff
        }
        
        logger.info(f"Cleaned up analytics data older than {cutoff}")


# Global analytics tracker instance
_tracker: Optional[AnalyticsTracker] = None


def get_tracker() -> AnalyticsTracker:
    """Get or create the global analytics tracker."""
    global _tracker
    if _tracker is None:
        _tracker = AnalyticsTracker()
    return _tracker


def init_tracker(**kwargs) -> AnalyticsTracker:
    """Initialize the global analytics tracker with custom settings."""
    global _tracker
    _tracker = AnalyticsTracker(**kwargs)
    return _tracker
