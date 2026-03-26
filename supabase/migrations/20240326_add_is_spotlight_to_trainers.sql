-- Add is_spotlight column to trainers table
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT FALSE;
