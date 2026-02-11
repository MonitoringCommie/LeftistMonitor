"""
Discussion/Comments Models

Models for threaded discussions and comments on
events, people, contributions, and other entities.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class EntityType(str, Enum):
    """Types of entities that can have discussions."""
    EVENT = "event"
    PERSON = "person"
    LOCATION = "location"
    BOOK = "book"
    CONTRIBUTION = "contribution"
    DOCUMENT = "document"
    GENERAL = "general"  # For forum-style discussions


class CommentStatus(str, Enum):
    """Status of a comment."""
    ACTIVE = "active"
    EDITED = "edited"
    DELETED = "deleted"
    HIDDEN = "hidden"  # Hidden by moderator
    FLAGGED = "flagged"


class ThreadStatus(str, Enum):
    """Status of a discussion thread."""
    OPEN = "open"
    CLOSED = "closed"
    LOCKED = "locked"
    ARCHIVED = "archived"


class UserSummary(BaseModel):
    """Minimal user info for display."""
    id: UUID
    username: str
    avatar_url: Optional[str] = None
    reputation: int = 0
    role: str = "member"


class CommentCreate(BaseModel):
    """Request model for creating a comment."""
    content: str = Field(..., min_length=1, max_length=10000)
    parent_id: Optional[UUID] = None  # For replies


class CommentUpdate(BaseModel):
    """Request model for updating a comment."""
    content: str = Field(..., min_length=1, max_length=10000)


class CommentResponse(BaseModel):
    """Response model for a comment."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    thread_id: UUID
    content: str
    status: CommentStatus
    
    # Author info
    author: UserSummary
    created_at: datetime
    updated_at: datetime
    
    # Threading
    parent_id: Optional[UUID] = None
    depth: int = 0
    replies_count: int = 0
    
    # Engagement
    upvotes: int = 0
    downvotes: int = 0
    user_vote: Optional[int] = None  # Current user's vote (-1, 0, 1)
    
    # Edit history
    is_edited: bool = False
    edit_count: int = 0


class ThreadCreate(BaseModel):
    """Request model for creating a discussion thread."""
    entity_type: EntityType
    entity_id: Optional[UUID] = None  # None for general discussions
    title: str = Field(..., min_length=5, max_length=300)
    initial_comment: str = Field(..., min_length=10, max_length=10000)
    tags: List[str] = Field(default_factory=list, max_length=10)


class ThreadResponse(BaseModel):
    """Response model for a discussion thread."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    entity_type: EntityType
    entity_id: Optional[UUID]
    title: str
    status: ThreadStatus
    tags: List[str]
    
    # Author info
    author: UserSummary
    created_at: datetime
    updated_at: datetime
    last_activity_at: datetime
    
    # Stats
    comments_count: int = 0
    participants_count: int = 0
    views_count: int = 0
    
    # Preview
    first_comment: Optional[CommentResponse] = None
    latest_comments: List[CommentResponse] = Field(default_factory=list)


class ThreadListItem(BaseModel):
    """Simplified thread for list views."""
    id: UUID
    entity_type: EntityType
    title: str
    status: ThreadStatus
    author: UserSummary
    created_at: datetime
    last_activity_at: datetime
    comments_count: int
    participants_count: int


class ThreadFilter(BaseModel):
    """Filter parameters for listing threads."""
    entity_type: Optional[EntityType] = None
    entity_id: Optional[UUID] = None
    status: Optional[ThreadStatus] = None
    tags: Optional[List[str]] = None
    author_id: Optional[UUID] = None
    search: Optional[str] = None


class CommentVote(BaseModel):
    """Request model for voting on a comment."""
    vote: int = Field(..., ge=-1, le=1)


class FlagReport(BaseModel):
    """Request model for flagging content."""
    reason: str = Field(..., min_length=10, max_length=1000)
    category: str = Field(..., pattern="^(spam|abuse|misinformation|off_topic|other)$")


class DiscussionStats(BaseModel):
    """Statistics about discussions."""
    total_threads: int
    total_comments: int
    active_threads_today: int
    new_comments_today: int
    top_contributors: List[UserSummary]
    popular_tags: List[dict]
