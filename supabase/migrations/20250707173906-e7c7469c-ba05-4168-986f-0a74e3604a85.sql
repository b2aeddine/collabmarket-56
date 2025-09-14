
-- Ajouter la colonne special_instructions à la table orders
ALTER TABLE public.orders 
ADD COLUMN special_instructions TEXT;

-- Ajouter aussi stripe_session_id pour stocker l'ID de session Stripe
ALTER TABLE public.orders 
ADD COLUMN stripe_session_id TEXT;
