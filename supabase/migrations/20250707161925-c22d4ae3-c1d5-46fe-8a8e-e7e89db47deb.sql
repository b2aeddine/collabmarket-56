
-- Mettre à jour la fonction handle_new_user pour inclure is_profile_public
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
    is_profile_public,
    company_name,
    custom_username
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'influenceur'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    false,
    true,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'custom_username'
  );
  RETURN NEW;
END;
$function$;
