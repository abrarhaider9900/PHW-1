-- SQL Migration: Add functional_roles column to profiles table
-- This allows users to have multiple functional roles (owner, rider, trainer, producer)
-- separate from their system role (admin, user).

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS functional_roles TEXT[] DEFAULT '{}';

-- Optional: Migrate existing roles if needed (though the user asked to remap to 'user'/'admin')
-- UPDATE public.profiles SET functional_roles = ARRAY[role] WHERE role NOT IN ('user', 'admin');
-- UPDATE public.profiles SET role = 'user' WHERE role NOT IN ('user', 'admin');
