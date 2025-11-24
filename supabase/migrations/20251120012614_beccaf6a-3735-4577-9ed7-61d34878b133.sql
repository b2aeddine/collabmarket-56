-- Fix critical security issue: Remove public access to OAuth tokens in social_accounts table
-- Drop the overly permissive policy that allows anyone to view social accounts
DROP POLICY IF EXISTS "Anyone can view social accounts" ON public.social_accounts;

-- Create a restrictive policy that only allows users to view their own social accounts
CREATE POLICY "Users can view their own social accounts"
ON public.social_accounts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure the existing policy for managing own social accounts is still in place
-- (The "Users can manage their own social accounts" policy already exists and covers INSERT/UPDATE/DELETE)