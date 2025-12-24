-- Migration: Add result column to travel_plans table
-- This stores the final travel plan data (flights, hotels, itinerary, etc.)

ALTER TABLE travel_plans ADD COLUMN result TEXT;

-- Create index for faster queries on completed plans
CREATE INDEX IF NOT EXISTS idx_travel_plans_result ON travel_plans(result) WHERE result IS NOT NULL;
