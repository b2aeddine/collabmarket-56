-- Ajouter les champs Stripe Connect au profil utilisateur pour synchroniser les statuts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_connect_status text,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
ADD COLUMN IF NOT EXISTS is_stripe_connect_active boolean DEFAULT false;