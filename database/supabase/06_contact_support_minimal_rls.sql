-- =====================================================
-- Minimal RLS Policies for Contact Support Table
-- =====================================================
-- This version uses the simplest possible policies
-- Run this to fix permission denied errors

-- First, drop ALL existing policies
DROP POLICY IF EXISTS "Anyone can submit support requests" ON public.contact_support;
DROP POLICY IF EXISTS "Users can view their own support requests" ON public.contact_support;
DROP POLICY IF EXISTS "Anonymous users can view requests by email" ON public.contact_support;
DROP POLICY IF EXISTS "Authenticated users can view own requests" ON public.contact_support;
DROP POLICY IF EXISTS "Anonymous users can view requests" ON public.contact_support;

-- Policy 1: Allow INSERT from anyone (most important - this is what's failing)
-- This policy has NO dependencies on other tables
CREATE POLICY "Allow insert from anyone"
ON public.contact_support
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Allow SELECT for authenticated users (simplified)
-- Only add this if you want users to view their requests
-- For now, we'll keep it simple and allow authenticated users to see requests matching their email from public.users
CREATE POLICY "Allow select for authenticated users"
ON public.contact_support
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.email = contact_support.email
  )
);

-- Note: If you still get errors, try temporarily disabling RLS to test:
-- ALTER TABLE public.contact_support DISABLE ROW LEVEL SECURITY;
-- Then re-enable after confirming the table structure is correct:
-- ALTER TABLE public.contact_support ENABLE ROW LEVEL SECURITY;


