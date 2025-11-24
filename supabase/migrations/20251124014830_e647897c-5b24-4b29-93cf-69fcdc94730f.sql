-- Supprimer la contrainte de clé étrangère entre orders et offers
-- car les commandes sont maintenant totalement indépendantes des offres
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_offer_id_fkey;

-- Ajouter un commentaire pour expliquer pourquoi offer_id existe toujours
COMMENT ON COLUMN public.orders.offer_id IS 'Référence historique uniquement - les données de l''offre sont copiées dans offer_title, offer_description, etc. Peut être NULL.';
