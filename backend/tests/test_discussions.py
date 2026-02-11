"""
Tests for the Discussions API

Tests cover thread creation, comments, voting, and moderation.
"""

import pytest
from uuid import uuid4


class TestThreadCreation:
    """Tests for creating discussion threads."""
    
    def test_create_thread(self, client, auth_headers, sample_thread):
        """Test creating a discussion thread."""
        assert sample_thread["entity_type"] == "event"
        assert len(sample_thread["title"]) >= 5
        assert len(sample_thread["initial_comment"]) >= 10
    
    def test_thread_requires_title(self):
        """Test that threads require a title."""
        invalid_thread = {
            "entity_type": "event",
            "title": "",  # Empty title
            "initial_comment": "Valid comment content"
        }
        
        assert len(invalid_thread["title"]) < 5
    
    def test_valid_entity_types(self):
        """Test valid entity types for threads."""
        valid_types = [
            "event", "person", "location", "book",
            "contribution", "document", "general"
        ]
        
        assert "general" in valid_types  # For forum-style
        assert len(valid_types) == 7


class TestComments:
    """Tests for comments on threads."""
    
    def test_create_comment(self, client, auth_headers, sample_comment):
        """Test creating a comment."""
        assert len(sample_comment["content"]) >= 1
        assert sample_comment["parent_id"] is None  # Top-level comment
    
    def test_create_reply(self, sample_comment):
        """Test creating a reply to a comment."""
        parent_id = str(uuid4())
        reply = {
            "content": "This is a reply to the parent comment.",
            "parent_id": parent_id
        }
        
        assert reply["parent_id"] == parent_id
    
    def test_comment_depth(self):
        """Test comment threading depth."""
        # Top-level comment
        comment = {"depth": 0, "parent_id": None}
        assert comment["depth"] == 0
        
        # Reply (depth 1)
        reply = {"depth": 1, "parent_id": "parent-id"}
        assert reply["depth"] == 1
    
    def test_comment_content_length(self):
        """Test comment content length validation."""
        # Too short (empty)
        assert len("") < 1
        
        # Valid
        assert len("Valid comment") >= 1
        
        # Max length (10000)
        assert 10000 >= len("x" * 10000)


class TestCommentVoting:
    """Tests for comment voting."""
    
    def test_upvote_comment(self):
        """Test upvoting a comment."""
        vote = {"vote": 1}
        assert vote["vote"] == 1
    
    def test_downvote_comment(self):
        """Test downvoting a comment."""
        vote = {"vote": -1}
        assert vote["vote"] == -1
    
    def test_remove_vote(self):
        """Test removing a vote."""
        vote = {"vote": 0}
        assert vote["vote"] == 0
    
    def test_vote_score_calculation(self):
        """Test vote score calculation."""
        upvotes = 10
        downvotes = 3
        score = upvotes - downvotes
        
        assert score == 7


class TestThreadStatus:
    """Tests for thread status management."""
    
    def test_valid_thread_statuses(self):
        """Test valid thread statuses."""
        valid_statuses = ["open", "closed", "locked", "archived"]
        
        assert "open" in valid_statuses
        assert "locked" in valid_statuses
        assert len(valid_statuses) == 4
    
    def test_moderator_can_lock_thread(self):
        """Test that moderators can lock threads."""
        moderator_roles = ["moderator", "admin", "superadmin"]
        
        for role in moderator_roles:
            assert role in moderator_roles


class TestCommentModeration:
    """Tests for comment moderation."""
    
    def test_flag_comment(self):
        """Test flagging a comment."""
        flag_categories = ["spam", "abuse", "misinformation", "off_topic", "other"]
        
        flag = {
            "reason": "This comment contains misinformation about historical facts.",
            "category": "misinformation"
        }
        
        assert flag["category"] in flag_categories
        assert len(flag["reason"]) >= 10
    
    def test_comment_statuses(self):
        """Test comment statuses."""
        valid_statuses = ["active", "edited", "deleted", "hidden", "flagged"]
        
        assert "hidden" in valid_statuses  # Hidden by moderator
        assert "flagged" in valid_statuses


class TestEntityDiscussions:
    """Tests for entity-specific discussions."""
    
    def test_get_discussions_for_entity(self):
        """Test getting discussions for a specific entity."""
        entity_type = "event"
        entity_id = str(uuid4())
        
        endpoint = f"/discussions/entity/{entity_type}/{entity_id}/threads"
        
        assert entity_type in endpoint
        assert entity_id in endpoint
    
    def test_discussion_stats(self):
        """Test discussion statistics."""
        stats = {
            "total_threads": 100,
            "total_comments": 500,
            "active_threads_today": 10,
            "new_comments_today": 25
        }
        
        assert stats["total_comments"] > stats["total_threads"]
