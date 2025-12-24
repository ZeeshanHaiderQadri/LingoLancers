-- Rollback script for Blog Writing Team migrations
-- Run this to undo all migrations

-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS draft_articles CASCADE;
DROP TABLE IF EXISTS workflow_state CASCADE;
DROP TABLE IF EXISTS user_integrations CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE 'All Blog Writing Team tables have been dropped';
END $$;
