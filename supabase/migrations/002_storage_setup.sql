-- ====================================================================
-- AgroMind AI — Supabase Storage Configuration for Crop Scans
-- ====================================================================

-- 1. Create crop-scans bucket if not already created
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'crop-scans',
  'crop-scans',
  true,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Allow public read access to scan photos
CREATE POLICY "Public read crop-scans images"
ON storage.objects FOR SELECT
USING (bucket_id = 'crop-scans');

-- 3. Allow authenticated farmers to upload into their own folder
CREATE POLICY "Farmers upload crop-scans images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'crop-scans'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow farmers to update their own scan photos
CREATE POLICY "Farmers update own crop-scans images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'crop-scans'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Allow farmers to delete their own scan photos
CREATE POLICY "Farmers delete own crop-scans images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'crop-scans'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
