
-- Ajouter les colonnes manquantes pour Stripe Identity
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS stripe_identity_session_id text,
ADD COLUMN IF NOT EXISTS stripe_identity_status text DEFAULT 'not_started'::text,
ADD COLUMN IF NOT EXISTS stripe_identity_url text;

-- Ajouter une contrainte pour les statuts Stripe Identity
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS check_stripe_identity_status 
CHECK (stripe_identity_status IN ('not_started', 'requires_input', 'processing', 'verified', 'canceled'));
