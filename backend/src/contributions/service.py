"""
User Contributions Service

Business logic for handling community contributions,
including validation, status management, and merging.
"""

from datetime import datetime
from typing import Optional, List, Tuple
from uuid import UUID, uuid4
import json

from .models import (
    ContributionType, ContributionStatus, Source,
    ContributionCreate, ContributionResponse, ContributionUpdate,
    ReviewAction, ContributionFilter, ContributionStats,
    EventContribution, PersonContribution, LocationContribution,
    DocumentContribution, CorrectionContribution, TranslationContribution
)


class ContributionService:
    """Service for managing user contributions."""
    
    def __init__(self, db_session, redis_client=None):
        self.db = db_session
        self.redis = redis_client
        
    def _validate_contribution_data(
        self,
        contribution_type: ContributionType,
        data: dict
    ) -> Tuple[bool, Optional[str]]:
        """Validate contribution data based on type."""
        try:
            if contribution_type == ContributionType.EVENT:
                EventContribution(**data)
            elif contribution_type == ContributionType.PERSON:
                PersonContribution(**data)
            elif contribution_type == ContributionType.LOCATION:
                LocationContribution(**data)
            elif contribution_type == ContributionType.DOCUMENT:
                DocumentContribution(**data)
            elif contribution_type == ContributionType.CORRECTION:
                CorrectionContribution(**data)
            elif contribution_type == ContributionType.TRANSLATION:
                TranslationContribution(**data)
            return True, None
        except Exception as e:
            return False, str(e)
    
    async def create_contribution(
        self,
        user_id: UUID,
        contribution: ContributionCreate
    ) -> ContributionResponse:
        """Create a new contribution submission."""
        # Validate data structure
        valid, error = self._validate_contribution_data(
            contribution.contribution_type,
            contribution.data
        )
        if not valid:
            raise ValueError(f"Invalid contribution data: {error}")
        
        # Create contribution record
        contribution_id = uuid4()
        now = datetime.utcnow()
        
        # In production, this would insert into database
        # For now, return mock response
        return ContributionResponse(
            id=contribution_id,
            contribution_type=contribution.contribution_type,
            status=ContributionStatus.PENDING,
            data=contribution.data,
            sources=contribution.sources,
            notes=contribution.notes,
            language=contribution.language,
            submitted_by=user_id,
            submitted_at=now,
            updated_at=now,
            upvotes=0,
            downvotes=0
        )
    
    async def get_contribution(
        self,
        contribution_id: UUID
    ) -> Optional[ContributionResponse]:
        """Get a single contribution by ID."""
        # In production, fetch from database
        return None
    
    async def list_contributions(
        self,
        filters: ContributionFilter,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ContributionResponse], int]:
        """List contributions with filtering and pagination."""
        # In production, query database with filters
        return [], 0
    
    async def update_contribution(
        self,
        contribution_id: UUID,
        user_id: UUID,
        update: ContributionUpdate
    ) -> ContributionResponse:
        """Update an existing contribution (only by owner, only if pending)."""
        contribution = await self.get_contribution(contribution_id)
        if not contribution:
            raise ValueError("Contribution not found")
        
        if contribution.submitted_by != user_id:
            raise PermissionError("Can only update your own contributions")
        
        if contribution.status not in [
            ContributionStatus.PENDING,
            ContributionStatus.NEEDS_REVISION
        ]:
            raise ValueError("Can only update pending or revision-needed contributions")
        
        # Apply updates
        if update.data:
            valid, error = self._validate_contribution_data(
                contribution.contribution_type,
                update.data
            )
            if not valid:
                raise ValueError(f"Invalid contribution data: {error}")
            contribution.data = update.data
        
        if update.sources:
            contribution.sources = update.sources
        
        if update.notes is not None:
            contribution.notes = update.notes
        
        contribution.updated_at = datetime.utcnow()
        contribution.status = ContributionStatus.PENDING
        
        return contribution
    
    async def review_contribution(
        self,
        contribution_id: UUID,
        reviewer_id: UUID,
        action: ReviewAction
    ) -> ContributionResponse:
        """Apply a review action to a contribution."""
        contribution = await self.get_contribution(contribution_id)
        if not contribution:
            raise ValueError("Contribution not found")
        
        # Validate status transition
        valid_transitions = {
            ContributionStatus.PENDING: [
                ContributionStatus.UNDER_REVIEW,
                ContributionStatus.APPROVED,
                ContributionStatus.REJECTED
            ],
            ContributionStatus.UNDER_REVIEW: [
                ContributionStatus.NEEDS_REVISION,
                ContributionStatus.APPROVED,
                ContributionStatus.REJECTED
            ],
            ContributionStatus.NEEDS_REVISION: [
                ContributionStatus.UNDER_REVIEW,
                ContributionStatus.REJECTED
            ],
            ContributionStatus.APPROVED: [
                ContributionStatus.MERGED
            ]
        }
        
        if action.action not in valid_transitions.get(contribution.status, []):
            raise ValueError(
                f"Cannot transition from {contribution.status} to {action.action}"
            )
        
        if action.action == ContributionStatus.REJECTED and not action.rejection_reason:
            raise ValueError("Rejection reason required")
        
        contribution.status = action.action
        contribution.reviewer_id = reviewer_id
        contribution.reviewed_at = datetime.utcnow()
        contribution.review_notes = action.notes
        contribution.rejection_reason = action.rejection_reason
        contribution.updated_at = datetime.utcnow()
        
        return contribution
    
    async def vote_contribution(
        self,
        contribution_id: UUID,
        user_id: UUID,
        vote: int
    ) -> Tuple[int, int]:
        """Vote on a contribution. Returns (upvotes, downvotes)."""
        # In production, handle vote storage and prevent duplicate votes
        return 0, 0
    
    async def get_user_contributions(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ContributionResponse], int]:
        """Get contributions submitted by a specific user."""
        filters = ContributionFilter(submitted_by=user_id)
        return await self.list_contributions(filters, page, page_size)
    
    async def get_pending_reviews(
        self,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[ContributionResponse], int]:
        """Get contributions awaiting review."""
        filters = ContributionFilter(status=ContributionStatus.PENDING)
        return await self.list_contributions(filters, page, page_size)
    
    async def get_stats(self) -> ContributionStats:
        """Get contribution statistics."""
        # In production, aggregate from database
        return ContributionStats(
            total=0,
            pending=0,
            under_review=0,
            approved=0,
            rejected=0,
            merged=0,
            by_type={},
            top_contributors=[]
        )
    
    async def merge_contribution(
        self,
        contribution_id: UUID,
        reviewer_id: UUID
    ) -> bool:
        """Merge an approved contribution into the main database."""
        contribution = await self.get_contribution(contribution_id)
        if not contribution:
            raise ValueError("Contribution not found")
        
        if contribution.status != ContributionStatus.APPROVED:
            raise ValueError("Can only merge approved contributions")
        
        # Route to appropriate merge handler based on type
        merge_handlers = {
            ContributionType.EVENT: self._merge_event,
            ContributionType.PERSON: self._merge_person,
            ContributionType.LOCATION: self._merge_location,
            ContributionType.DOCUMENT: self._merge_document,
            ContributionType.CORRECTION: self._merge_correction,
            ContributionType.TRANSLATION: self._merge_translation,
        }
        
        handler = merge_handlers.get(contribution.contribution_type)
        if handler:
            await handler(contribution)
        
        # Update status to merged
        await self.review_contribution(
            contribution_id,
            reviewer_id,
            ReviewAction(action=ContributionStatus.MERGED)
        )
        
        return True
    
    async def _merge_event(self, contribution: ContributionResponse):
        """Merge an event contribution into the events table."""
        # Implementation would insert into events table
        pass
    
    async def _merge_person(self, contribution: ContributionResponse):
        """Merge a person contribution into the people table."""
        pass
    
    async def _merge_location(self, contribution: ContributionResponse):
        """Merge a location contribution into the locations table."""
        pass
    
    async def _merge_document(self, contribution: ContributionResponse):
        """Merge a document contribution into the documents table."""
        pass
    
    async def _merge_correction(self, contribution: ContributionResponse):
        """Apply a correction to an existing record."""
        pass
    
    async def _merge_translation(self, contribution: ContributionResponse):
        """Apply a translation to an existing record."""
        pass
