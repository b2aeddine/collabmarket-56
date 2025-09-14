
-- Update the handle_new_user function to set is_profile_public to true by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role, 
    first_name, 
    last_name,
    is_verified,
    is_profile_public
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'influenceur'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    false,
    true  -- Set profile as public by default
  );
  RETURN NEW;
END;
$function$;

-- Also update the default value for the column itself
ALTER TABLE public.profiles 
ALTER COLUMN is_profile_public SET DEFAULT true;
