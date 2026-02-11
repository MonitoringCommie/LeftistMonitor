-- Migration: Add User Contributions System
-- Description: Tables for community-submitted data and moderation workflow

-- Enum types
CREATE TYPE contribution_type AS ENUM (
    'event', 'person', 'location', 'document', 'correction', 'translation'
);

CREATE TYPE contribution_status AS ENUM (
    'pending', 'under_review', 'needs_revision', 'approved', 'rejected', 'merged'
);

CREATE TYPE source_type AS ENUM (
    'academic', 'news', 'primary', 'archive', 'oral_history', 'government', 'ngo', 'other'
);

-- Main contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_type contribution_type NOT NULL,
    status contribution_status NOT NULL DEFAULT 'pending',
    
    -- Content
    data JSONB NOT NULL,
    sources JSONB NOT NULL,
    notes TEXT,
    language VARCHAR(5) DEFAULT 'en',
    
    -- Submitter info
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Review info
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Voting
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Reference to merged entity (if applicable)
    merged_entity_type VARCHAR(50),
    merged_entity_id UUID,
    merged_at TIMESTAMP WITH TIME ZONE
);

-- Contribution votes table (one vote per user per contribution)
CREATE TABLE IF NOT EXISTS contribution_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(contribution_id, user_id)
);

-- Contribution history (audit log)
CREATE TABLE IF NOT EXISTS contribution_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id UUID NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    old_status contribution_status,
    new_status contribution_status,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB
);

-- Indexes
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_type ON contributions(contribution_type);
CREATE INDEX idx_contributions_submitted_by ON contributions(submitted_by);
CREATE INDEX idx_contributions_submitted_at ON contributions(submitted_at DESC);
CREATE INDEX idx_contributions_language ON contributions(language);
CREATE INDEX idx_contributions_data ON contributions USING GIN (data);
CREATE INDEX idx_contribution_votes_contribution ON contribution_votes(contribution_id);
CREATE INDEX idx_contribution_votes_user ON contribution_votes(user_id);
CREATE INDEX idx_contribution_history_contribution ON contribution_history(contribution_id);

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_contribution_votes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote = 1 THEN
            UPDATE contributions SET upvotes = upvotes + 1 WHERE id = NEW.contribution_id;
        ELSE
            UPDATE contributions SET downvotes = downvotes + 1 WHERE id = NEW.contribution_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote = 1 THEN
            UPDATE contributions SET upvotes = upvotes - 1 WHERE id = OLD.contribution_id;
        ELSE
            UPDATE contributions SET downvotes = downvotes - 1 WHERE id = OLD.contribution_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.vote != NEW.vote THEN
            IF OLD.vote = 1 THEN
                UPDATE contributions SET upvotes = upvotes - 1, downvotes = downvotes + 1 
                WHERE id = NEW.contribution_id;
            ELSE
                UPDATE contributions SET upvotes = upvotes + 1, downvotes = downvotes - 1 
                WHERE id = NEW.contribution_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contribution_votes
AFTER INSERT OR UPDATE OR DELETE ON contribution_votes
FOR EACH ROW EXECUTE FUNCTION update_contribution_votes();

-- Function to log contribution history
CREATE OR REPLACE FUNCTION log_contribution_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO contribution_history (
            contribution_id, action, old_status, new_status, changed_by, details
        ) VALUES (
            NEW.id,
            'status_change',
            OLD.status,
            NEW.status,
            NEW.reviewer_id,
            jsonb_build_object('review_notes', NEW.review_notes, 'rejection_reason', NEW.rejection_reason)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_contribution_history
AFTER UPDATE ON contributions
FOR EACH ROW EXECUTE FUNCTION log_contribution_history();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_contribution_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contribution_timestamp
BEFORE UPDATE ON contributions
FOR EACH ROW EXECUTE FUNCTION update_contribution_timestamp();
