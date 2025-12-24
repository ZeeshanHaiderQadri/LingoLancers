-- Migration: Create workflow_state table
-- Requirements: 10.1, 11.3
-- Description: Track workflow execution state and agent results

CREATE TABLE IF NOT EXISTS workflow_state (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(100) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'running',
    request_data JSONB NOT NULL,
    current_agent VARCHAR(50),
    agent_results JSONB NOT NULL DEFAULT '{}',
    article_data JSONB,
    iteration_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT workflow_state_status_check 
        CHECK (status IN ('running', 'completed', 'failed', 'awaiting_review', 'declined')),
    CONSTRAINT workflow_state_iteration_check 
        CHECK (iteration_count >= 0 AND iteration_count <= 3)
);

-- Create indexes for performance
CREATE INDEX idx_workflow_state_workflow_id ON workflow_state(workflow_id);
CREATE INDEX idx_workflow_state_user_id ON workflow_state(user_id);
CREATE INDEX idx_workflow_state_status ON workflow_state(status);
CREATE INDEX idx_workflow_state_created_at ON workflow_state(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_workflow_state_updated_at 
    BEFORE UPDATE ON workflow_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE workflow_state IS 'Tracks blog writing workflow execution state';
COMMENT ON COLUMN workflow_state.workflow_id IS 'Unique identifier for workflow instance';
COMMENT ON COLUMN workflow_state.request_data IS 'Original blog request parameters';
COMMENT ON COLUMN workflow_state.current_agent IS 'Currently executing agent name';
COMMENT ON COLUMN workflow_state.agent_results IS 'Results from each agent execution';
COMMENT ON COLUMN workflow_state.article_data IS 'Compiled article data when ready for review';
COMMENT ON COLUMN workflow_state.iteration_count IS 'Number of revision iterations (max 3)';
