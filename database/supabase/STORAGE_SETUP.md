# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for profile photos and posts.

## Quick Setup

1. **Run SQL Script**: Execute `04_storage_buckets.sql` in Supabase SQL Editor
2. **Verify Buckets**: Go to Storage → Buckets in Supabase Dashboard
3. **Test Upload**: Use the app to upload a profile photo

## Storage Buckets Created

### 1. Profile Photos Bucket (`profile-photos`)
- **Purpose**: Store user profile avatars
- **Public**: Yes (for easy URL access)
- **File Size Limit**: 5MB
- **Allowed Types**: JPEG, JPG, PNG, WEBP
- **Path Structure**: `profile-photos/{user_id}/{filename}`

### 2. Posts Bucket (`posts`)
- **Purpose**: Store post images/photos
- **Public**: Yes
- **File Size Limit**: 10MB
- **Allowed Types**: JPEG, JPG, PNG, WEBP, GIF
- **Path Structure**: `posts/{user_id}/{filename}`

## Permissions (RLS Policies)

### Profile Photos
- ✅ **Upload**: Authenticated users can upload to their own folder
- ✅ **Update**: Users can update their own photos
- ✅ **Delete**: Users can delete their own photos
- ✅ **View**: Public can view all profile photos

### Posts
- ✅ **Upload**: Authenticated users can upload posts
- ✅ **Update**: Users can update their own posts
- ✅ **Delete**: Users can delete their own posts
- ✅ **View**: Public can view all posts

## File Structure

```
profile-photos/
  └── {user_id}/
      └── {timestamp}-{random}.{ext}

posts/
  └── {user_id}/
      └── {timestamp}-{random}.{ext}
```

## Usage in Code

### Upload Profile Photo

```javascript
import { authService } from './services';

// Upload image (local file path)
const { data: url, error } = await authService.uploadProfilePhoto(userId, imageUri);

// Update profile with uploaded URL
await authService.updateProfile(userId, {
  avatar_url: url,
  // ... other fields
});
```

### Get Public URL

```javascript
const { data } = supabase.storage
  .from('profile-photos')
  .getPublicUrl('user_id/filename.jpg');
```

## Manual Setup (Alternative)

If you prefer to set up buckets manually in Supabase Dashboard:

1. Go to **Storage** → **Buckets**
2. Click **New Bucket**
3. Configure:
   - **Name**: `profile-photos`
   - **Public**: ✅ Enabled
   - **File Size Limit**: 5MB
   - **Allowed MIME Types**: `image/jpeg, image/jpg, image/png, image/webp`
4. Create bucket
5. Go to **Storage** → **Policies**
6. Add policies manually (see SQL file for policy definitions)

## Troubleshooting

### Upload Fails
- Check bucket exists: `SELECT * FROM storage.buckets WHERE id = 'profile-photos'`
- Verify RLS policies are active
- Check user is authenticated
- Verify file size is under limit

### Permission Denied
- Ensure RLS policies are created
- Check user is authenticated
- Verify folder path matches user_id

### URL Not Working
- Ensure bucket is public
- Check file path is correct
- Verify file was uploaded successfully

## Security Notes

- Users can only manage files in their own folder
- Public read access allows easy image display
- File size limits prevent abuse
- MIME type restrictions ensure only images are uploaded





