"""
User Contributions API Router

Endpoints for submitting, reviewing, and managing
community contributions to the database.
"""

from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse

from .models import (
    ContributionType, ContributionStatus,
    ContributionCreate, ContributionResponse, ContributionUpdate,
    ReviewAction, ContributionVote, ContributionFilter, ContributionStats
)
from .service import ContributionService


router = APIRouter(prefix="/contributions", tags=["contributions"])


# Dependency placeholder - in production, use actual auth
async def get_current_user():
    """Get authenticated user from JWT token."""
    from uuid import uuid4
    return {"id": uuid4(), "role": "contributor"}


async def get_moderator():
    """Require moderator role."""
    user = await get_current_user()
    if user.get("role") not in ["moderator", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Moderator access required"
        )
    return user


async def get_contribution_service():
    """Get contribution service instance."""
    return ContributionService(db_session=None, redis_client=None)


@router.post("", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
async def create_contribution(
    contribution: ContributionCreate,
    user: dict = Depends(get_current_user),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    Submit a new contribution for review.
    
    Contributions must include at least one source for verification.
    Supported types: event, person, location, document, correction, translation.
    """
    try:
        result = await service.create_contribution(
            user_id=user["id"],
            contribution=contribution
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=List[ContributionResponse])
async def list_contributions(
    contribution_type: Optional[ContributionType] = None,
    status: Optional[ContributionStatus] = None,
    language: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    List contributions with optional filters.
    
    Accessible to all authenticated users for transparency.
    """
    filters = ContributionFilter(
        contribution_type=contribution_type,
        status=status,
        language=language,
        search=search
    )
    
    contributions, total = await service.list_contributions(
        filters=filters,
        page=page,
        page_size=page_size
    )
    
    return JSONResponse(
        content={
            "items": [c.model_dump(mode="json") for c in contributions],
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size if total > 0 else 0
        }
    )


@router.get("/mine", response_model=List[ContributionResponse])
async def get_my_contributions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user: dict = Depends(get_current_user),
    service: ContributionService = Depends(get_contribution_service)
):
    """Get contributions submitted by the current user."""
    contributions, total = await service.get_user_contributions(
        user_id=user["id"],
        page=page,
        page_size=page_size
    )
    
    return JSONResponse(
        content={
            "items": [c.model_dump(mode="json") for c in contributions],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    )


@router.get("/stats", response_model=ContributionStats)
async def get_contribution_stats(
    service: ContributionService = Depends(get_contribution_service)
):
    """Get statistics about contributions."""
    return await service.get_stats()


@router.get("/pending", response_model=List[ContributionResponse])
async def get_pending_contributions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    moderator: dict = Depends(get_moderator),
    service: ContributionService = Depends(get_contribution_service)
):
    """Get contributions awaiting review (moderators only)."""
    contributions, total = await service.get_pending_reviews(
        page=page,
        page_size=page_size
    )
    
    return JSONResponse(
        content={
            "items": [c.model_dump(mode="json") for c in contributions],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    )


@router.get("/{contribution_id}", response_model=ContributionResponse)
async def get_contribution(
    contribution_id: UUID,
    service: ContributionService = Depends(get_contribution_service)
):
    """Get a single contribution by ID."""
    contribution = await service.get_contribution(contribution_id)
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found"
        )
    return contribution


@router.put("/{contribution_id}", response_model=ContributionResponse)
async def update_contribution(
    contribution_id: UUID,
    update: ContributionUpdate,
    user: dict = Depends(get_current_user),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    Update a contribution.
    
    Can only update your own contributions that are pending or need revision.
    """
    try:
        result = await service.update_contribution(
            contribution_id=contribution_id,
            user_id=user["id"],
            update=update
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )


@router.delete("/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contribution(
    contribution_id: UUID,
    user: dict = Depends(get_current_user),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    Delete a contribution.
    
    Can only delete your own pending contributions.
    """
    contribution = await service.get_contribution(contribution_id)
    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found"
        )
    
    if contribution.submitted_by != user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only delete your own contributions"
        )
    
    if contribution.status != ContributionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete pending contributions"
        )
    
    # In production, mark as deleted or remove
    return None


@router.post("/{contribution_id}/review", response_model=ContributionResponse)
async def review_contribution(
    contribution_id: UUID,
    action: ReviewAction,
    moderator: dict = Depends(get_moderator),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    Apply a review action to a contribution (moderators only).
    
    Valid actions depend on current status:
    - pending: under_review, approved, rejected
    - under_review: needs_revision, approved, rejected
    - needs_revision: under_review, rejected
    - approved: merged
    """
    try:
        result = await service.review_contribution(
            contribution_id=contribution_id,
            reviewer_id=moderator["id"],
            action=action
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{contribution_id}/merge", response_model=dict)
async def merge_contribution(
    contribution_id: UUID,
    moderator: dict = Depends(get_moderator),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    Merge an approved contribution into the main database (moderators only).
    """
    try:
        success = await service.merge_contribution(
            contribution_id=contribution_id,
            reviewer_id=moderator["id"]
        )
        return {"success": success, "message": "Contribution merged successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{contribution_id}/vote", response_model=dict)
async def vote_on_contribution(
    contribution_id: UUID,
    vote: ContributionVote,
    user: dict = Depends(get_current_user),
    service: ContributionService = Depends(get_contribution_service)
):
    """
    Vote on a contribution to help prioritize reviews.
    
    Vote values: -1 (downvote), 0 (remove vote), 1 (upvote)
    """
    upvotes, downvotes = await service.vote_contribution(
        contribution_id=contribution_id,
        user_id=user["id"],
        vote=vote.vote
    )
    return {"upvotes": upvotes, "downvotes": downvotes}


# Contribution type templates
@router.get("/templates/{contribution_type}")
async def get_contribution_template(contribution_type: ContributionType):
    """
    Get a template for a contribution type.
    
    Returns the expected fields and their descriptions.
    """
    templates = {
        ContributionType.EVENT: {
            "title": "Event title (required, 5-500 chars)",
            "description": "Detailed description (required, 20-10000 chars)",
            "date_start": "Start date in ISO format (required)",
            "date_end": "End date in ISO format (optional)",
            "location_name": "Location name (required)",
            "latitude": "Latitude coordinate (-90 to 90)",
            "longitude": "Longitude coordinate (-180 to 180)",
            "country_code": "ISO 3166-1 alpha-3 country code",
            "categories": "List of category tags",
            "related_people": "List of related person names",
            "death_toll": "Number of deaths (if applicable)",
            "injuries": "Number of injuries (if applicable)",
            "participants": "Estimated number of participants"
        },
        ContributionType.PERSON: {
            "name": "Full name (required, 2-200 chars)",
            "birth_date": "Birth date in ISO format",
            "death_date": "Death date in ISO format",
            "birth_place": "Place of birth",
            "nationality": "Nationality",
            "occupation": "List of occupations",
            "organizations": "List of organizations/movements",
            "biography": "Biography text (required, 50-20000 chars)",
            "achievements": "List of notable achievements",
            "related_events": "List of related historical events"
        },
        ContributionType.LOCATION: {
            "name": "Location name (required, 2-300 chars)",
            "description": "Description (required, 20-10000 chars)",
            "latitude": "Latitude coordinate (required, -90 to 90)",
            "longitude": "Longitude coordinate (required, -180 to 180)",
            "country_code": "ISO 3166-1 alpha-3 country code (required)",
            "location_type": "Type (memorial, massacre_site, prison, etc.)",
            "date_established": "Date established",
            "date_destroyed": "Date destroyed (if applicable)",
            "current_status": "Current status of the location"
        },
        ContributionType.DOCUMENT: {
            "title": "Document title (required, 5-500 chars)",
            "description": "Description (required, 20-10000 chars)",
            "document_type": "Type (manifesto, letter, pamphlet, treaty, etc.)",
            "author": "Author name",
            "date_created": "Date of creation",
            "language": "Language code (default: en)",
            "full_text": "Full text content",
            "transcription": "Transcription of handwritten/scanned documents",
            "related_events": "List of related events",
            "related_people": "List of related people"
        },
        ContributionType.CORRECTION: {
            "entity_type": "Type of entity to correct (event, person, etc.)",
            "entity_id": "ID of the entity to correct",
            "field_name": "Name of the field to correct",
            "current_value": "Current incorrect value",
            "proposed_value": "Proposed correct value",
            "reason": "Reason for correction (required, 10-2000 chars)"
        },
        ContributionType.TRANSLATION: {
            "entity_type": "Type of entity to translate",
            "entity_id": "ID of the entity",
            "target_language": "Target language code (e.g., es, fr, ar)",
            "field_name": "Field to translate",
            "translated_text": "Translated text (required, 1-50000 chars)"
        }
    }
    
    template = templates.get(contribution_type)
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unknown contribution type"
        )
    
    return {
        "type": contribution_type,
        "fields": template,
        "sources_required": True,
        "source_types": [
            "academic", "news", "primary", "archive",
            "oral_history", "government", "ngo", "other"
        ]
    }
