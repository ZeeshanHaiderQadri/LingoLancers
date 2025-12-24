-- Migration: Create user_integrations table
-- Requirements: 12.11, 13.6
-- Description: Store encrypted platform credentials and connection status

CREATE TABLE IF NOT EXISTS user_integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    encrypted_credentials TEXT NOT NULL,
    platform_metadata JSONB,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT user_integrations_platform_check 
        CHECK (platform IN ('wordpress', 'shopify', 'facebook', 'twitter')),
    CONSTRAINT user_integrations_status_check 
        CHECK (status IN ('connected', 'disconnected', 'error')),
    CONSTRAINT user_integrations_unique_user_platform 
        UNIQUE (user_id, platform)
);

-- Create indexes for performance
CREATE INDEX idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX idx_user_integrations_platform ON user_integrations(platform);
CREATE INDEX idx_user_integrations_status ON user_integrations(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_integrations_updated_at 
    BEFORE UPDATE ON user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_integrations IS 'Stores user platform integrations with encrypted credentials';
COMMENT ON COLUMN user_integrations.encrypted_credentials IS 'Fernet-encrypted JSON credentials';
COMMENT ON COLUMN user_integrations.platform_metadata IS 'Platform-specific metadata (site URL, store name, etc.)';
COMMENT ON COLUMN user_integrations.last_sync_at IS 'Last successful sync/publish timestamp';
