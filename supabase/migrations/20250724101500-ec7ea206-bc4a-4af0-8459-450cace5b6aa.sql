-- Vérifier et mettre à jour le trigger handle_new_user pour supporter le rôle admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    custom_username,
    is_admin
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'influenceur'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    false,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN false 
      ELSE true 
    END,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'custom_username',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  
  -- Si c'est un admin, ajouter également l'entrée dans admin_roles
  IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    INSERT INTO public.admin_roles (user_id, role, is_active)
    VALUES (NEW.id, 'admin', true);
  END IF;
  
  RETURN NEW;
END;
$$;