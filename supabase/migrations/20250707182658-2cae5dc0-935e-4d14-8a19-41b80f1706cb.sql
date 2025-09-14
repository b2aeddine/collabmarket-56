
-- Supprimer l'ancienne contrainte de statut
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Ajouter la nouvelle contrainte avec tous les statuts autorisés
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'accepted', 'refused', 'delivered', 'completed', 'disputed', 'cancelled'));
