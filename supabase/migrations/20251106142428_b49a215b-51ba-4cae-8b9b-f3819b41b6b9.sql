-- Make study-materials bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'study-materials';

-- Add RLS policies for study-materials storage bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own study materials"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'study-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own study materials"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'study-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own study materials"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'study-materials' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);