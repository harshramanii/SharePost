-- =====================================================
-- Simple RLS Policies for Contact Support Table
-- =====================================================
-- This version uses simpler policies that don't reference other tables
-- Run this if you're still getting permission errors

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.contact_support;
DROP POLICY IF EXISTS "Users can view their own support requests" ON public.contact_support;
DROP POLICY IF EXISTS "Anonymous users can view requests by email" ON public.contact_support;

-- Policy: Anyone (including anonymous users) can insert (submit support requests)
-- This is the most important policy - it allows submissions from anyone
CREATE POLICY "Anyone can submit support requests"
ON public.contact_support
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Authenticated users can view their own requests by email
-- This uses a simpler check that doesn't require accessing auth.users
CREATE POLICY "Authenticated users can view own requests"
ON public.contact_support
FOR SELECT
TO authenticated
USING (
  -- Match email from public.users table (which authenticated users can access)
  EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.email = contact_support.email
  )
);

-- Optional: Allow anonymous users to view all requests (for testing)
-- Remove this if you want to restrict viewing to authenticated users only
-- CREATE POLICY "Anonymous users can view requests"
-- ON public.contact_support
-- FOR SELECT
-- TO anon
-- USING (true);


