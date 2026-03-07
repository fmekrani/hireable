-- Migration: Add raw_text column to resumes table
-- Run this in Supabase SQL Editor

-- Add raw_text column for storing extracted resume text
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS raw_text text;

-- Add index for full-text search (optional, for future use)
-- CREATE INDEX IF NOT EXISTS idx_resumes_raw_text_search 
--   ON public.resumes USING gin(to_tsvector('english', raw_text));

-- Comment for documentation
COMMENT ON COLUMN public.resumes.raw_text IS 'Extracted raw text content from the resume file';
