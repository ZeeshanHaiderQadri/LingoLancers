-- Migration: Create travel plans table
-- This creates persistent storage for travel plans similar to blog articles

CREATE TABLE IF NOT EXISTS travel_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT DEFAULT 'default_user',
    departure TEXT,
    destination TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    adults INTEGER DEFAULT 1,
    children INTEGER DEFAULT 0,
    budget TEXT,
    preferences TEXT,
    status TEXT DEFAULT 'planning',
    task_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_created_at ON travel_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_plans_status ON travel_plans(status);