# Supabase Storage Setup - Step by Step

## Quick Setup (5 minutes)

### Step 1: Run SQL Script

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the entire contents of `04_storage_buckets.sql`
4. Click **Run** or press `Cmd/Ctrl + Enter`
5. Verify success message appears

### Step 2: Verify Buckets Created

1. Go to **Storage** → **Buckets** in Supabase Dashboard
2. You should see two buckets:
   - ✅ `profile-photos` (public, 5MB limit)
   - ✅ `posts` (public, 10MB limit)

### Step 3: Verify Policies

1. Go to **Storage** → **Policies**
2. Select `profile-photos` bucket
3. You should see 4 policies:
   - ✅ Users can upload their own profile photos
   - ✅ Users can update their own profile photos
   - ✅ Users can delete their own profile photos
   - ✅ Public can view profile photos

### Step 4: Test in App

1. Open Edit Profile modal
2. Tap on profile image
3. Select Camera or Photo Library
4. Choose/take a photo
5. Save profile
6. Check console logs for upload status
7. Verify image appears in Storage → profile-photos bucket

## SQL File Contents Summary

The `04_storage_buckets.sql` file includes:

1. **Bucket Creation**
   - `profile-photos` bucket (5MB, public)
   - `posts` bucket (10MB, public)

2. **RLS Policies**
   - Upload policies (authenticated users only)
   - Update/Delete policies (own files only)
   - View policies (public)

3. **Helper Functions**
   - `get_profile_photo_url()` - Gets user's latest profile photo
   - `update_user_avatar_url()` - Auto-updates avatar_url in users table

4. **Triggers**
   - Auto-updates `users.avatar_url` when photo is uploaded

## File Structure in Storage

```
profile-photos/
  └── {user_id}/
      ├── 1234567890-abc123.jpg
      └── 1234567891-def456.png
```

## How It Works

1. **User selects photo** → Local file path (file:// or content://)
2. **User saves profile** → `updateProfile()` called
3. **Check if local file** → Detects file://, content://, or non-HTTP paths
4. **Upload to Storage** → `uploadProfilePhoto()` uploads to `profile-photos/{user_id}/{filename}`
5. **Get public URL** → Returns Supabase Storage public URL
6. **Save to database** → URL stored in `users.avatar_url` column
7. **Display image** → Image shown using public URL

## Troubleshooting

### Bucket Not Found Error
- **Solution**: Run `04_storage_buckets.sql` in Supabase SQL Editor
- **Verify**: Check Storage → Buckets in Dashboard

### Permission Denied Error
- **Solution**: Check RLS policies are created
- **Verify**: Go to Storage → Policies → profile-photos

### Upload Fails Silently
- **Check**: Console logs for error messages
- **Verify**: User is authenticated (logged in)
- **Check**: File size is under 5MB limit

### Image Not Displaying
- **Check**: Public URL is correct
- **Verify**: Bucket is set to public
- **Check**: File was uploaded successfully in Storage dashboard

## Testing

### Test Upload Manually

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'profile-photos';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- List files in bucket (replace user_id)
SELECT * FROM storage.objects 
WHERE bucket_id = 'profile-photos' 
AND name LIKE 'your-user-id/%';
```

### Test in App

1. Add console.log statements in `uploadProfilePhoto()`
2. Check logs when saving profile
3. Verify upload success message appears
4. Check Supabase Storage dashboard for uploaded file

## Next Steps

After setup:
1. ✅ Test profile photo upload
2. ✅ Verify image appears in Storage
3. ✅ Verify URL is saved in database
4. ✅ Test image display in app





