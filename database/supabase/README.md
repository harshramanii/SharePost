# Supabase Database Setup

This directory contains PostgreSQL SQL files for setting up the SharePost database in Supabase.

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key from Settings > API

### 2. Configure Environment Variables

Add your Supabase credentials to your React Native app:

Create a `.env` file in the root directory:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Or update `src/config/supabase.js` directly with your credentials.

### 3. Run SQL Migrations

In Supabase Dashboard, go to SQL Editor and run the files in this order:

1. **01_users_authentication.sql** - Creates user authentication tables
2. **02_categories_posts_feed.sql** - Creates categories and posts tables
3. **03_sample_data.sql** - Inserts sample data (optional, for development)

### 4. Enable Authentication

1. Go to Authentication > Providers in Supabase Dashboard
2. Enable Email provider
3. Configure email templates if needed

### 5. Set Up Storage (Optional)

If you want to store images in Supabase Storage:

1. Go to Storage in Supabase Dashboard
2. Create a bucket named `posts` (or your preferred name)
3. Set bucket to public if you want public access
4. Update your code to upload images to Supabase Storage instead of using URLs

### 6. Row Level Security (RLS)

RLS policies are already included in the SQL files. Make sure they're enabled:

- Users can only view/edit their own profile
- Posts are publicly readable but only authenticated users can create
- Categories are publicly readable

### 7. Install Dependencies

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

## Key Differences from MySQL Version

1. **UUID instead of INT**: All IDs use UUID for better distributed system support
2. **TIMESTAMP WITH TIME ZONE**: Instead of DATETIME
3. **JSONB**: Instead of JSON for better performance
4. **CHECK constraints**: Instead of ENUM
5. **Functions and Triggers**: PostgreSQL syntax
6. **Row Level Security**: Built-in Supabase feature

## Database Structure

### Authentication Tables
- `users` - Extends Supabase auth.users with profile data
- `otp_verifications` - OTP codes
- `user_sessions` - Session metadata
- `password_reset_tokens` - Password reset
- `admin_users` - Admin accounts
- `activity_logs` - Activity tracking

### Content Tables
- `categories` - Post categories
- `posts` - All posts/photos
- `post_likes` - User likes
- `post_favorites` - User favorites
- `post_downloads` - Download tracking
- `post_shares` - Share tracking
- `post_comments` - Comments
- `feed_preferences` - User feed settings

## Services

The app includes service files:
- `src/services/authService.js` - Authentication operations
- `src/services/postService.js` - Post operations
- `src/services/categoryService.js` - Category operations

## Testing

After setup, test the connection:

```javascript
import { supabase } from './src/config/supabase';

// Test connection
const { data, error } = await supabase.from('categories').select('*');
console.log('Categories:', data);
```

## Troubleshooting

1. **RLS Errors**: Make sure RLS policies are correctly set up
2. **Connection Issues**: Verify your Supabase URL and anon key
3. **Auth Issues**: Check that email provider is enabled
4. **Foreign Key Errors**: Make sure tables are created in order

## Next Steps

1. Update `LoginScreen.js` to use `authService.signIn()`
2. Update `HomeScreen.js` to use `postService.getPosts()`
3. Update `ProfileScreen.js` to use `authService.getCurrentUser()`
4. Implement image upload to Supabase Storage if needed







