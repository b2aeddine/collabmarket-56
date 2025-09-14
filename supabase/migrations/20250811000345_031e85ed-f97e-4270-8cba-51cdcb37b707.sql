-- Ajouter les nouvelles colonnes nécessaires à la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS date_creation_commande timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS date_contestation timestamp with time zone,
ADD COLUMN IF NOT EXISTS preuve_influenceur text,
ADD COLUMN IF NOT EXISTS admin_decision text,
ADD COLUMN IF NOT EXISTS admin_decision_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS admin_decision_by uuid;

-- Créer une fonction pour vérifier si une commande peut être contestée
CREATE OR REPLACE FUNCTION public.can_contest_order(order_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_status text;
    order_updated_at timestamp with time zone;
    hours_since_delivery numeric;
BEGIN
    -- Récupérer les informations de la commande
    SELECT status, updated_at 
    INTO order_status, order_updated_at
    FROM public.orders 
    WHERE id = order_id;
    
    -- Vérifier si le statut permet la contestation
    IF order_status != 'delivered' THEN
        RETURN false;
    END IF;
    
    -- Vérifier si 48h se sont écoulées depuis la livraison
    hours_since_delivery := EXTRACT(EPOCH FROM (now() - order_updated_at)) / 3600;
    
    RETURN hours_since_delivery >= 48;
END;
$$;

-- Créer une fonction pour automatiser l'annulation des commandes non confirmées après 48h
CREATE OR REPLACE FUNCTION public.auto_handle_expired_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Annuler les commandes en attente de confirmation influenceur depuis plus de 48h
    UPDATE public.orders 
    SET 
        status = 'annulée',
        updated_at = now()
    WHERE 
        status = 'en_attente_confirmation_influenceur' 
        AND created_at < now() - INTERVAL '48 hours';
        
    -- Auto-confirmer les commandes livrées depuis plus de 48h
    UPDATE public.orders 
    SET 
        status = 'terminée',
        date_completed = COALESCE(date_completed, now()),
        updated_at = now()
    WHERE 
        status = 'delivered' 
        AND updated_at < now() - INTERVAL '48 hours'
        AND NOT EXISTS (
            SELECT 1 FROM public.contestations 
            WHERE order_id = orders.id AND statut = 'en_attente'
        );
END;
$$;