-- =====================================================
-- Supabase Storage Buckets and Policies
-- =====================================================
-- This file creates storage buckets for profile photos
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. Create Profile Photos Bucket
-- =====================================================

-- Insert bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true, -- Public bucket so images can be accessed via URL
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. Storage Policies for Profile Photos Bucket
-- =====================================================

-- Policy: Users can upload their own profile photos
CREATE POLICY "Users can upload their own profile photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own profile photos
CREATE POLICY "Users can update their own profile photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own profile photos
CREATE POLICY "Users can delete their own profile photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view profile photos (public read)
CREATE POLICY "Public can view profile photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

-- =====================================================
-- 3. Helper Function to Get Profile Photo URL
-- =====================================================

CREATE OR REPLACE FUNCTION get_profile_photo_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  photo_url TEXT;
BEGIN
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (SELECT name FROM storage.objects 
         WHERE bucket_id = 'profile-photos' 
         AND (storage.foldername(name))[1] = user_id::text 
         ORDER BY created_at DESC 
         LIMIT 1)
      ELSE NULL
    END INTO photo_url
  FROM storage.objects
  WHERE bucket_id = 'profile-photos' 
  AND (storage.foldername(name))[1] = user_id::text;
  
  RETURN photo_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Trigger to Auto-Update avatar_url in users table
-- =====================================================

-- Function to update avatar_url when photo is uploaded
CREATE OR REPLACE FUNCTION update_user_avatar_url()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract user_id from folder name (first part of path)
  IF NEW.bucket_id = 'profile-photos' THEN
    UPDATE public.users
    SET 
      avatar_url = get_profile_photo_url((storage.foldername(NEW.name))[1]::UUID),
      updated_at = NOW()
    WHERE id = (storage.foldername(NEW.name))[1]::UUID;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_user_avatar ON storage.objects;
CREATE TRIGGER trigger_update_user_avatar
AFTER INSERT OR UPDATE ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION update_user_avatar_url();

-- =====================================================
-- 5. Optional: Create Posts/Photos Bucket (if needed)
-- =====================================================

-- Insert posts bucket configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true, -- Public bucket
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload posts
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posts');

-- Policy: Anyone can view posts (public read)
CREATE POLICY "Public can view posts"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posts');

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'posts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- Notes:
-- =====================================================
-- 1. Profile photos are stored in: profile-photos/{user_id}/{filename}
-- 2. Posts are stored in: posts/{user_id}/{filename}
-- 3. All buckets are public for easy URL access
-- 4. File size limits: Profile photos (5MB), Posts (10MB)
-- 5. Only authenticated users can upload
-- 6. Users can only manage their own files
-- 7. Public can view all files





