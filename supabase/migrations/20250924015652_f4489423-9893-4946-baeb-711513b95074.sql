-- Create a function to get public influencers data for anonymous users
CREATE OR REPLACE FUNCTION public.get_public_influencers(limit_count integer DEFAULT 20)
RETURNS TABLE(
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
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
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
  WHERE p.role = 'influenceur'
    AND p.is_verified = true
    AND p.is_profile_public = true
    AND p.is_banned = false
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- Update RLS policy for anonymous users to access more profile data
DROP POLICY IF EXISTS "Anonymous can view basic public profile info" ON public.profiles;

CREATE POLICY "Anonymous can view public influencer profiles"
ON public.profiles
FOR SELECT
TO anon
USING (
  role = 'influenceur' 
  AND is_profile_public = true 
  AND is_banned = false 
  AND is_verified = true
);