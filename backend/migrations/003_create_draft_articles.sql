-- Migration: Create draft_articles table
-- Requirements: 15.1, 15.2
-- Description: Store draft articles for later editing and publishing

CREATE TABLE IF NOT EXISTS draft_articles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    workflow_id VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to workflow_state
    CONSTRAINT fk_draft_articles_workflow
        FOREIGN KEY (workflow_id) 
        REFERENCES workflow_state(workflow_id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_draft_articles_user_id ON draft_articles(user_id);
CREATE INDEX idx_draft_articles_workflow_id ON draft_articles(workflow_id);
CREATE INDEX idx_draft_articles_created_at ON draft_articles(created_at DESC);
CREATE INDEX idx_draft_articles_title ON draft_articles USING gin(to_tsvector('english', title));

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_draft_articles_updated_at 
    BEFORE UPDATE ON draft_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE draft_articles IS 'Stores declined/saved draft articles';
COMMENT ON COLUMN draft_articles.content IS 'Full CompiledArticle as JSONB including all metadata, images, and content';
COMMENT ON COLUMN draft_articles.title IS 'Article title for quick reference and search';
