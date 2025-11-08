-- Fix storage security: Make study-materials bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'study-materials';

-- Drop the public view policy
DROP POLICY IF EXISTS "Public can view study materials" ON storage.objects;

-- Add proper RLS policy for authenticated users to view their own uploads
CREATE POLICY "Users can view their own study materials"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'study-materials' AND owner_id = auth.uid()::text);

-- Drop the experts_public_info view as it's not needed and triggers security warnings
-- The agricultural_experts table already has proper RLS policies
DROP VIEW IF EXISTS public.experts_public_info;