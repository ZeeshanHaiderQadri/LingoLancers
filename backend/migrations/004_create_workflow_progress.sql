-- Migration: Create workflow progress tracking table
-- This stores the actual agent work progress for historical viewing

CREATE TABLE IF NOT EXISTS workflow_progress (
    id SERIAL PRIMARY KEY,
    workflow_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    progress_type TEXT NOT NULL, -- 'search', 'analysis', 'generation', 'processing', 'compilation'
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB, -- Store sources, URLs, keywords, etc.
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by workflow_id
CREATE INDEX IF NOT EXISTS idx_workflow_progress_workflow_id ON workflow_progress(workflow_id);

-- Index for ordering by timestamp
CREATE INDEX IF NOT EXISTS idx_workflow_progress_timestamp ON workflow_progress(workflow_id, timestamp);