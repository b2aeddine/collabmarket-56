-- Create a security definer function that returns only safe public profile data
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_id uuid)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  bio text,
  city text,
  profile_views integer,
  profile_share_count integer,
  created_at timestamp with time zone,
  custom_username text,
  is_verified boolean,
  role text
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.bio,
    p.city,
    p.profile_views,
    p.profile_share_count,
    p.created_at,
    p.custom_username,
    p.is_verified,
    p.role
  FROM public.profiles p
  WHERE p.id = profile_id 
    AND p.is_profile_public = true 
    AND p.is_banned = false;
$$;

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create new restrictive policies
CREATE POLICY "Users can view safe public profile data" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow access to own profile (full data)
  auth.uid() = id 
  OR 
  -- Allow admins to see all profiles (full data)
  is_current_user_admin()
  OR
  -- For public access, only allow if the request is for safe columns via the function
  -- This will be enforced at the application level
  (is_profile_public = true AND is_banned = false AND auth.role() = 'anon')
);

-- Create a view for public profiles with only safe data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  avatar_url,
  bio,
  city,
  profile_views,
  profile_share_count,
  created_at,
  custom_username,
  is_verified,
  role
FROM public.profiles 
WHERE is_profile_public = true 
  AND is_banned = false;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated, anon;