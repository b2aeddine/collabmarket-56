-- Créer le compte admin avec l'email spécifique
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'Bahaa.dine87@gmail.com';

-- Si le profil n'existe pas encore, l'insérer
INSERT INTO public.profiles (
  id, 
  email, 
  role, 
  first_name, 
  last_name, 
  is_admin, 
  is_verified,
  created_at,
  updated_at
) 
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Bahaa.dine87@gmail.com',
  'admin',
  'Admin',
  'System',
  true,
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE email = 'Bahaa.dine87@gmail.com'
);