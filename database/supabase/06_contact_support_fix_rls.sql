-- =====================================================
-- Fix RLS Policies for Contact Support Table
-- =====================================================
-- Run this if you're getting RLS policy violations
-- This will drop existing policies and recreate them correctly

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.contact_support;
DROP POLICY IF EXISTS "Users can view their own support requests" ON public.contact_support;
DROP POLICY IF EXISTS "Anonymous users can view requests by email" ON public.contact_support;

-- Policy: Anyone (including anonymous users) can insert (submit support requests)
-- This policy should not reference any other tables to avoid permission issues
CREATE POLICY "Anyone can submit support requests"
ON public.contact_support
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Users can view their own support requests
-- Note: This policy allows authenticated users to view requests matching their email
-- For anonymous users, they would need to know the request ID or use a different method
CREATE POLICY "Users can view their own support requests"
ON public.contact_support
FOR SELECT
TO authenticated
USING (
  -- Check if user's email matches (without accessing auth.users directly)
  email IN (
    SELECT email 
    FROM public.users 
    WHERE id = auth.uid()
  )
  OR
  -- Also allow if email matches the current user's email from public.users
  email = (
    SELECT email 
    FROM public.users 
    WHERE id = auth.uid()
    LIMIT 1
  )
);

-- Policy: Anonymous users can also view requests (optional - remove if not needed)
-- Uncomment the following if you want anonymous users to view their requests
-- CREATE POLICY "Anonymous users can view requests by email"
-- ON public.contact_support
-- FOR SELECT
-- TO anon
-- USING (true);

