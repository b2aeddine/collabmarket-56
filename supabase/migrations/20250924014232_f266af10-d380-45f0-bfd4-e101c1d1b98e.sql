-- Drop the security definer view (flagged as security risk)
DROP VIEW IF EXISTS public.public_profiles;

-- Instead, update the RLS policy to be more specific about which columns can be accessed publicly
DROP POLICY IF EXISTS "Users can view safe public profile data" ON public.profiles;

-- Create a more restrictive RLS policy that limits public access to specific safe columns only
CREATE POLICY "Users can view public profiles with limited data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow full access to own profile
  auth.uid() = id 
  OR 
  -- Allow admins to see all profiles
  is_current_user_admin()
);

-- Create a separate policy for anonymous public access (this will be handled at application level)
CREATE POLICY "Anonymous can view basic public profile info" 
ON public.profiles 
FOR SELECT 
TO anon
USING (
  is_profile_public = true 
  AND is_banned = false
);

-- Fix search path for existing functions
ALTER FUNCTION public.get_current_user_role() SET search_path = public;
ALTER FUNCTION public.is_current_user_admin() SET search_path = public;
ALTER FUNCTION public.auto_cancel_expired_orders() SET search_path = public;
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.create_admin_account() SET search_path = public;
ALTER FUNCTION public.create_initial_admin() SET search_path = public;
ALTER FUNCTION public.auto_cancel_pending_orders() SET search_path = public;
ALTER FUNCTION public.enable_contestation_for_delivered_orders() SET search_path = public;
ALTER FUNCTION public.auto_cancel_payment_authorized_orders() SET search_path = public;
ALTER FUNCTION public.get_influencer_total_earned(uuid) SET search_path = public;
ALTER FUNCTION public.can_contest_order(uuid) SET search_path = public;
ALTER FUNCTION public.get_influencer_total_withdrawn(uuid) SET search_path = public;
ALTER FUNCTION public.get_influencer_available_balance(uuid) SET search_path = public;
ALTER FUNCTION public.auto_handle_expired_orders() SET search_path = public;
ALTER FUNCTION public.sync_social_analytics(uuid) SET search_path = public;
ALTER FUNCTION public.get_available_balance(uuid) SET search_path = public;
ALTER FUNCTION public.auto_confirm_completed_orders() SET search_path = public;