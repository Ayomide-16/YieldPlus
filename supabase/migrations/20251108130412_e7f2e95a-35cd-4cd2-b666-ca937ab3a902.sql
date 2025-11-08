-- Fix remix failure: Remove duplicate saved_plans table definition conflict
-- This migration corrects the schema conflict introduced in migration 20251025173008

-- The saved_plans table already exists from migration 20251014141457
-- Instead of trying to recreate it, we'll migrate it to the new schema

-- First, add the new columns if they don't exist
ALTER TABLE public.saved_plans 
ADD COLUMN IF NOT EXISTS plan_data JSONB;

-- Migrate existing data to the new format
UPDATE public.saved_plans 
SET plan_data = jsonb_build_object(
  'crop_type', crop_type,
  'soil_type', soil_type,
  'farm_size', farm_size,
  'water_source', water_source,
  'irrigation_method', irrigation_method,
  'expected_yield', expected_yield,
  'harvest_date', harvest_date,
  'analysis_result', analysis_result,
  'location', location
)
WHERE plan_data IS NULL;

-- Now we can safely drop the old columns that have been migrated
ALTER TABLE public.saved_plans
DROP COLUMN IF EXISTS crop_type,
DROP COLUMN IF EXISTS soil_type,
DROP COLUMN IF EXISTS farm_size,
DROP COLUMN IF EXISTS water_source,
DROP COLUMN IF EXISTS irrigation_method,
DROP COLUMN IF EXISTS expected_yield,
DROP COLUMN IF EXISTS harvest_date,
DROP COLUMN IF EXISTS analysis_result;

-- Update location to JSONB if it isn't already
ALTER TABLE public.saved_plans 
ALTER COLUMN location TYPE JSONB USING 
  CASE 
    WHEN location IS NULL THEN NULL
    WHEN location::text = '' THEN NULL
    ELSE jsonb_build_object('text', location)
  END;

-- Make plan_data NOT NULL now that all data is migrated
ALTER TABLE public.saved_plans 
ALTER COLUMN plan_data SET NOT NULL;

-- Add the CHECK constraint for plan_type
ALTER TABLE public.saved_plans
DROP CONSTRAINT IF EXISTS saved_plans_plan_type_check;

ALTER TABLE public.saved_plans
ADD CONSTRAINT saved_plans_plan_type_check 
CHECK (plan_type IN ('crop', 'soil', 'water', 'market', 'fertilizer', 'pest', 'comprehensive'));

-- The foreign key to profiles is correct and should remain
-- Migration 20251025173008's attempt to reference auth.users was incorrect
-- because the user_id should go through the profiles table for proper data encapsulation