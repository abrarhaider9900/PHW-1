-- Add is_spotlight column to both trainers and profiles tables
ALTER TABLE public.trainers ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_spotlight BOOLEAN DEFAULT FALSE;

-- Allow admins to update any profile (required for toggling spotlight)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());

