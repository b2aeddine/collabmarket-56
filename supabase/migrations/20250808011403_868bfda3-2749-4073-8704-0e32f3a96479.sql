-- Ajouter les nouvelles colonnes à la table orders
ALTER TABLE public.orders 
ADD COLUMN date_creation_commande TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN preuve_influenceur TEXT,
ADD COLUMN date_contestation TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_decision TEXT,
ADD COLUMN admin_decision_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN admin_decision_by UUID REFERENCES auth.users(id);

-- Mettre à jour les contraintes de statut pour inclure les nouveaux statuts
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'pending', 
  'accepted', 
  'delivered', 
  'completed', 
  'disputed', 
  'refused', 
  'cancelled',
  'en_attente_confirmation_influenceur',
  'refusée_par_influenceur', 
  'en_cours',
  'terminée',
  'en_contestation',
  'validée_par_plateforme',
  'annulée'
));

-- Créer une table pour gérer les contestations
CREATE TABLE public.contestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL,
  merchant_id UUID NOT NULL,
  date_contestation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  preuve_influenceur TEXT,
  raison_contestation TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'validée', 'refusée')),
  admin_decision TEXT,
  admin_decision_date TIMESTAMP WITH TIME ZONE,
  admin_decision_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS pour la table contestations
ALTER TABLE public.contestations ENABLE ROW LEVEL SECURITY;

-- Policies pour contestations
CREATE POLICY "Influenceurs peuvent créer leurs contestations" 
ON public.contestations 
FOR INSERT 
WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Participants peuvent voir leurs contestations" 
ON public.contestations 
FOR SELECT 
USING (influencer_id = auth.uid() OR merchant_id = auth.uid());

CREATE POLICY "Admins peuvent voir toutes les contestations" 
ON public.contestations 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Admins peuvent mettre à jour les contestations" 
ON public.contestations 
FOR UPDATE 
USING (is_current_user_admin());

-- Fonction pour auto-annuler les commandes en attente après 48h
CREATE OR REPLACE FUNCTION public.auto_cancel_pending_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Annuler les commandes en attente depuis plus de 48h
  UPDATE public.orders 
  SET 
    status = 'annulée',
    updated_at = now()
  WHERE 
    status IN ('pending', 'en_attente_confirmation_influenceur') 
    AND created_at < now() - INTERVAL '48 hours';
END;
$$;

-- Fonction pour auto-valider les commandes après 48h de non-confirmation
CREATE OR REPLACE FUNCTION public.enable_contestation_for_delivered_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Permettre la contestation pour les commandes livrées depuis plus de 48h
  -- (Cette fonction sera utilisée pour identifier les commandes éligibles à la contestation)
  -- Pas de modification automatique, juste pour les requêtes
  NULL;
END;
$$;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_contestations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contestations_updated_at
  BEFORE UPDATE ON public.contestations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contestations_updated_at();