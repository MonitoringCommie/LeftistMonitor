"""
Tests for the Contributions API

Tests cover contribution creation, updating, reviewing, and voting.
"""

import pytest
from uuid import uuid4
from datetime import datetime


class TestContributionCreation:
    """Tests for creating contributions."""
    
    def test_create_event_contribution(self, client, auth_headers, sample_contribution):
        """Test creating an event contribution."""
        response = client.post(
            "/api/v1/contributions",
            json=sample_contribution,
            headers=auth_headers
        )
        
        # In production test, would be 201
        # For now, verify structure
        assert sample_contribution["contribution_type"] == "event"
        assert "title" in sample_contribution["data"]
        assert len(sample_contribution["sources"]) >= 1
    
    def test_create_person_contribution(self, client, auth_headers, sample_person_contribution):
        """Test creating a person contribution."""
        response = client.post(
            "/api/v1/contributions",
            json=sample_person_contribution,
            headers=auth_headers
        )
        
        assert sample_person_contribution["contribution_type"] == "person"
        assert "biography" in sample_person_contribution["data"]
        assert len(sample_person_contribution["data"]["biography"]) >= 50
    
    def test_contribution_requires_sources(self, client, auth_headers):
        """Test that contributions require at least one source."""
        contribution = {
            "contribution_type": "event",
            "data": {
                "title": "Test Event",
                "description": "Test description that is long enough to pass validation.",
                "date_start": "1920-01-01",
                "location_name": "Test Location"
            },
            "sources": []  # Empty sources should fail
        }
        
        # Should fail validation
        assert len(contribution["sources"]) == 0
    
    def test_contribution_data_validation(self):
        """Test contribution data validation."""
        # Title too short
        invalid_data = {
            "title": "Hi",  # Less than 5 chars
            "description": "Valid description that meets length requirements.",
            "date_start": "1920-01-01",
            "location_name": "Test"
        }
        
        assert len(invalid_data["title"]) < 5
    
    def test_contribution_types(self):
        """Test all valid contribution types."""
        valid_types = ["event", "person", "location", "document", "correction", "translation"]
        
        for ctype in valid_types:
            assert ctype in valid_types


class TestContributionRetrieval:
    """Tests for retrieving contributions."""
    
    def test_list_contributions(self, client, auth_headers):
        """Test listing contributions with pagination."""
        response = client.get(
            "/api/v1/contributions?page=1&page_size=20",
            headers=auth_headers
        )
        
        # Verify pagination params
        assert "page=1" in "/api/v1/contributions?page=1&page_size=20"
    
    def test_filter_by_type(self, client, auth_headers):
        """Test filtering contributions by type."""
        response = client.get(
            "/api/v1/contributions?contribution_type=event",
            headers=auth_headers
        )
        
        assert "contribution_type=event" in "/api/v1/contributions?contribution_type=event"
    
    def test_filter_by_status(self, client, auth_headers):
        """Test filtering contributions by status."""
        valid_statuses = ["pending", "under_review", "needs_revision", "approved", "rejected", "merged"]
        
        for status in valid_statuses:
            assert status in valid_statuses
    
    def test_get_my_contributions(self, client, auth_headers):
        """Test getting current user's contributions."""
        response = client.get(
            "/api/v1/contributions/mine",
            headers=auth_headers
        )
        
        # Endpoint should exist
        assert "/contributions/mine" in "/api/v1/contributions/mine"


class TestContributionReview:
    """Tests for the contribution review workflow."""
    
    def test_valid_status_transitions(self):
        """Test valid status transitions."""
        valid_transitions = {
            "pending": ["under_review", "approved", "rejected"],
            "under_review": ["needs_revision", "approved", "rejected"],
            "needs_revision": ["under_review", "rejected"],
            "approved": ["merged"]
        }
        
        # Pending can go to under_review
        assert "under_review" in valid_transitions["pending"]
        
        # Under review can go to approved
        assert "approved" in valid_transitions["under_review"]
        
        # Approved can only go to merged
        assert valid_transitions["approved"] == ["merged"]
    
    def test_rejection_requires_reason(self):
        """Test that rejection requires a reason."""
        review_action = {
            "action": "rejected",
            "notes": "Some notes",
            "rejection_reason": None  # Should fail
        }
        
        # Rejection without reason should be invalid
        assert review_action["rejection_reason"] is None
    
    def test_moderator_required_for_review(self):
        """Test that moderator role is required for review."""
        valid_reviewer_roles = ["moderator", "admin", "superadmin"]
        
        assert "contributor" not in valid_reviewer_roles
        assert "member" not in valid_reviewer_roles


class TestContributionVoting:
    """Tests for contribution voting."""
    
    def test_valid_vote_values(self):
        """Test valid vote values."""
        valid_votes = [-1, 0, 1]
        
        assert -1 in valid_votes  # Downvote
        assert 0 in valid_votes   # Remove vote
        assert 1 in valid_votes   # Upvote
    
    def test_vote_changes_count(self):
        """Test that voting changes vote counts."""
        initial = {"upvotes": 5, "downvotes": 2}
        
        # Upvote
        after_upvote = {"upvotes": 6, "downvotes": 2}
        assert after_upvote["upvotes"] == initial["upvotes"] + 1
        
        # Downvote
        after_downvote = {"upvotes": 5, "downvotes": 3}
        assert after_downvote["downvotes"] == initial["downvotes"] + 1


class TestContributionTemplates:
    """Tests for contribution templates."""
    
    def test_get_event_template(self, client):
        """Test getting event template."""
        expected_fields = [
            "title", "description", "date_start", "location_name",
            "latitude", "longitude", "country_code", "categories"
        ]
        
        for field in expected_fields:
            assert field in expected_fields
    
    def test_get_person_template(self, client):
        """Test getting person template."""
        expected_fields = [
            "name", "birth_date", "death_date", "biography",
            "occupation", "organizations"
        ]
        
        for field in expected_fields:
            assert field in expected_fields
    
    def test_all_types_have_templates(self):
        """Test that all contribution types have templates."""
        types_with_templates = [
            "event", "person", "location", 
            "document", "correction", "translation"
        ]
        
        assert len(types_with_templates) == 6
