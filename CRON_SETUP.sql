-- ============================================
-- CRON JOB SETUP FOR AUTOMATIC NBS DATA SYNC
-- ============================================
-- 
-- This script sets up a weekly automatic sync of NBS market price data
-- Run this SQL using the Supabase insert tool (NOT migration tool)
-- as it contains project-specific URLs and keys
--
-- INSTRUCTIONS:
-- 1. Replace YOUR_PROJECT_URL with your actual Supabase project URL
-- 2. Replace YOUR_ANON_KEY with your actual anon key
-- 3. Run this SQL using the insert tool
--
-- ============================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule weekly NBS data sync (Every Sunday at 2 AM UTC)
SELECT cron.schedule(
  'weekly-nbs-data-sync',
  '0 2 * * 0', -- Every Sunday at 2:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='YOUR_PROJECT_URL/functions/v1/fetch-nbs-data',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer YOUR_ANON_KEY'
        ),
        body:=jsonb_build_object(
          'triggered_by', 'cron',
          'timestamp', now()
        )
    ) as request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule the job (if needed):
-- SELECT cron.unschedule('weekly-nbs-data-sync');

-- To manually trigger the job (for testing):
-- SELECT cron.schedule('test-nbs-sync', '* * * * *', $$ ... $$);
-- Then unschedule after testing with: SELECT cron.unschedule('test-nbs-sync');
