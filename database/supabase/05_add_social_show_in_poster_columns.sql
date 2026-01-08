-- =====================================================
-- Add Show in Poster Columns for Social Media Links
-- =====================================================
-- This file adds columns to control whether social media
-- links should be displayed in post cards
-- Run this in Supabase SQL Editor

-- Add columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS facebook_show_in_poster BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS instagram_show_in_poster BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS twitter_show_in_poster BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.users.facebook_show_in_poster IS 'Whether to show Facebook link in post cards';
COMMENT ON COLUMN public.users.instagram_show_in_poster IS 'Whether to show Instagram link in post cards';
COMMENT ON COLUMN public.users.twitter_show_in_poster IS 'Whether to show Twitter link in post cards';

-- Create indexes for better query performance (optional)
CREATE INDEX IF NOT EXISTS idx_users_facebook_show_in_poster ON public.users(facebook_show_in_poster) WHERE facebook_show_in_poster = true;
CREATE INDEX IF NOT EXISTS idx_users_instagram_show_in_poster ON public.users(instagram_show_in_poster) WHERE instagram_show_in_poster = true;
CREATE INDEX IF NOT EXISTS idx_users_twitter_show_in_poster ON public.users(twitter_show_in_poster) WHERE twitter_show_in_poster = true;


