-- Mise à jour du compte admin avec un rôle autorisé
UPDATE public.profiles 
SET is_admin = true 
WHERE email = 'Bahaa.dine87@gmail.com';