-- Drop old conflicting policies that prevent remixing
DROP POLICY IF EXISTS "Public can view study materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload study materials" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;