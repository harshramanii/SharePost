-- =====================================================
-- Add FCM Token Column to Users Table
-- =====================================================
-- This adds a column to store Firebase Cloud Messaging tokens
-- Run this in Supabase SQL Editor

-- Add fcm_token column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS fcm_token TEXT DEFAULT NULL;

-- Add index for fcm_token for faster queries
CREATE INDEX IF NOT EXISTS idx_users_fcm_token 
ON public.users(fcm_token) 
WHERE fcm_token IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.users.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
