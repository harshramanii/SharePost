-- =====================================================
-- Contact Support Table
-- =====================================================
-- This file creates the contact_support table for handling
-- user support requests and inquiries
-- Run this in Supabase SQL Editor

-- Create contact_support table
CREATE TABLE IF NOT EXISTS public.contact_support (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NULL DEFAULT 'pending'::text,
  priority TEXT NULL DEFAULT 'medium'::text,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL,
  admin_notes TEXT NULL DEFAULT ''::text,
  CONSTRAINT contact_support_pkey PRIMARY KEY (id),
  CONSTRAINT contact_support_priority_check CHECK (
    (
      priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])
    )
  ),
  CONSTRAINT contact_support_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'pending'::text,
          'in_progress'::text,
          'resolved'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_contact_support_status 
ON public.contact_support USING btree (status) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contact_support_created_at 
ON public.contact_support USING btree (created_at DESC) 
TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_contact_support_email 
ON public.contact_support USING btree (email) 
TABLESPACE pg_default;

-- Add comments for documentation
COMMENT ON TABLE public.contact_support IS 'Stores user support requests and inquiries';
COMMENT ON COLUMN public.contact_support.title IS 'Brief title of the support request';
COMMENT ON COLUMN public.contact_support.description IS 'Detailed description of the issue or question';
COMMENT ON COLUMN public.contact_support.email IS 'Email address of the user submitting the request';
COMMENT ON COLUMN public.contact_support.status IS 'Current status: pending, in_progress, or resolved';
COMMENT ON COLUMN public.contact_support.priority IS 'Priority level: low, medium, or high';
COMMENT ON COLUMN public.contact_support.resolved_at IS 'Timestamp when the request was resolved';
COMMENT ON COLUMN public.contact_support.admin_notes IS 'Internal notes for admin use';

-- Enable Row Level Security (RLS)
ALTER TABLE public.contact_support ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone (including anonymous users) can insert (submit support requests)
CREATE POLICY "Anyone can submit support requests"
ON public.contact_support
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Authenticated users can view their own support requests
-- Uses public.users table instead of auth.users to avoid permission issues
CREATE POLICY "Users can view their own support requests"
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

-- Policy: Anonymous users can view requests (optional - remove if not needed)
-- This allows guests to view requests, but you may want to restrict this
CREATE POLICY "Anonymous users can view requests"
ON public.contact_support
FOR SELECT
TO anon
USING (true);

-- Note: Admin policies for viewing/updating all requests should be added separately
-- based on your admin role system

