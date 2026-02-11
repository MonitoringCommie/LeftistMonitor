"""
Discussion/Comments API Router

Endpoints for threaded discussions and comments.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from .models import (
    EntityType, ThreadStatus, CommentStatus,
    CommentCreate, CommentUpdate, CommentResponse, CommentVote,
    ThreadCreate, ThreadResponse, ThreadListItem, ThreadFilter,
    FlagReport, DiscussionStats, UserSummary
)


router = APIRouter(prefix="/discussions", tags=["discussions"])


# Dependency placeholders
async def get_current_user():
    from uuid import uuid4
    return {"id": uuid4(), "username": "testuser", "role": "member", "reputation": 100}


async def get_moderator():
    user = await get_current_user()
    if user.get("role") not in ["moderator", "admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Moderator access required")
    return user


# Thread endpoints
@router.post("/threads", response_model=ThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    thread: ThreadCreate,
    user: dict = Depends(get_current_user)
):
    """Create a new discussion thread."""
    from uuid import uuid4
    from datetime import datetime
    
    now = datetime.utcnow()
    thread_id = uuid4()
    
    return ThreadResponse(
        id=thread_id,
        entity_type=thread.entity_type,
        entity_id=thread.entity_id,
        title=thread.title,
        status=ThreadStatus.OPEN,
        tags=thread.tags,
        author=UserSummary(
            id=user["id"],
            username=user["username"],
            reputation=user.get("reputation", 0),
            role=user.get("role", "member")
        ),
        created_at=now,
        updated_at=now,
        last_activity_at=now,
        comments_count=1,
        participants_count=1,
        views_count=0
    )


@router.get("/threads", response_model=List[ThreadListItem])
async def list_threads(
    entity_type: Optional[EntityType] = None,
    entity_id: Optional[UUID] = None,
    status: Optional[ThreadStatus] = None,
    tags: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query("recent", pattern="^(recent|popular|active)$")
):
    """List discussion threads with filtering."""
    # Mock response
    return []


@router.get("/threads/{thread_id}", response_model=ThreadResponse)
async def get_thread(thread_id: UUID):
    """Get a single thread with its comments."""
    raise HTTPException(status_code=404, detail="Thread not found")


@router.patch("/threads/{thread_id}/status")
async def update_thread_status(
    thread_id: UUID,
    new_status: ThreadStatus,
    moderator: dict = Depends(get_moderator)
):
    """Update thread status (moderators only)."""
    return {"id": thread_id, "status": new_status}


# Comment endpoints
@router.post("/threads/{thread_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    thread_id: UUID,
    comment: CommentCreate,
    user: dict = Depends(get_current_user)
):
    """Add a comment to a thread."""
    from uuid import uuid4
    from datetime import datetime
    
    now = datetime.utcnow()
    
    return CommentResponse(
        id=uuid4(),
        thread_id=thread_id,
        content=comment.content,
        status=CommentStatus.ACTIVE,
        author=UserSummary(
            id=user["id"],
            username=user["username"],
            reputation=user.get("reputation", 0),
            role=user.get("role", "member")
        ),
        created_at=now,
        updated_at=now,
        parent_id=comment.parent_id,
        depth=0 if not comment.parent_id else 1
    )


@router.get("/threads/{thread_id}/comments", response_model=List[CommentResponse])
async def list_comments(
    thread_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    sort: str = Query("oldest", pattern="^(oldest|newest|top)$")
):
    """List comments in a thread."""
    return []


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: UUID,
    update: CommentUpdate,
    user: dict = Depends(get_current_user)
):
    """Update a comment (author only)."""
    raise HTTPException(status_code=404, detail="Comment not found")


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: UUID,
    user: dict = Depends(get_current_user)
):
    """Delete a comment (author or moderator)."""
    return None


@router.post("/comments/{comment_id}/vote")
async def vote_comment(
    comment_id: UUID,
    vote: CommentVote,
    user: dict = Depends(get_current_user)
):
    """Vote on a comment."""
    return {"comment_id": comment_id, "upvotes": 0, "downvotes": 0}


@router.post("/comments/{comment_id}/flag", status_code=status.HTTP_201_CREATED)
async def flag_comment(
    comment_id: UUID,
    report: FlagReport,
    user: dict = Depends(get_current_user)
):
    """Flag a comment for moderation."""
    return {"message": "Report submitted", "comment_id": comment_id}


# Entity discussions shortcut
@router.get("/entity/{entity_type}/{entity_id}/threads", response_model=List[ThreadListItem])
async def get_entity_threads(
    entity_type: EntityType,
    entity_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """Get all discussion threads for a specific entity."""
    return []


# Stats
@router.get("/stats", response_model=DiscussionStats)
async def get_discussion_stats():
    """Get discussion statistics."""
    return DiscussionStats(
        total_threads=0,
        total_comments=0,
        active_threads_today=0,
        new_comments_today=0,
        top_contributors=[],
        popular_tags=[]
    )
