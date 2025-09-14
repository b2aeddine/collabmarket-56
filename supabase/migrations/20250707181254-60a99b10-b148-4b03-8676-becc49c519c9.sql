
-- Modifier la table orders pour ajouter les nouveaux champs de statut et dates
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS date_accepted TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_completed TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_disputed TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT;

-- Créer une table pour les litiges
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  date_opened TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur la table disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour que les utilisateurs puissent voir leurs propres litiges
CREATE POLICY "Users can view their own disputes" 
  ON public.disputes 
  FOR SELECT 
  USING (user_id = auth.uid() OR (
    SELECT influencer_id FROM public.orders WHERE id = order_id
  ) = auth.uid() OR (
    SELECT merchant_id FROM public.orders WHERE id = order_id
  ) = auth.uid());

-- Politique RLS pour que les utilisateurs puissent créer des litiges sur leurs commandes
CREATE POLICY "Users can create disputes for their orders" 
  ON public.disputes 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.orders 
        WHERE id = order_id AND (influencer_id = auth.uid() OR merchant_id = auth.uid())
      )
    )
  );

-- Politique RLS pour que les utilisateurs puissent mettre à jour leurs propres litiges
CREATE POLICY "Users can update their own disputes" 
  ON public.disputes 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Ajouter une fonction pour gérer l'expiration automatique des commandes
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Annuler les commandes pending depuis plus de 48h
  UPDATE public.orders 
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE 
    status = 'pending' 
    AND created_at < now() - INTERVAL '48 hours';
END;
$$;

-- Ajouter une fonction pour gérer l'auto-confirmation des prestations
CREATE OR REPLACE FUNCTION public.auto_confirm_completed_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Confirmer automatiquement les commandes marquées comme terminées depuis plus de 48h
  UPDATE public.orders 
  SET 
    status = 'completed',
    date_completed = COALESCE(date_completed, now()),
    updated_at = now()
  WHERE 
    status = 'delivered' 
    AND updated_at < now() - INTERVAL '48 hours';
END;
$$;

-- Mettre à jour les valeurs de statut existantes pour être cohérentes
UPDATE public.orders 
SET status = CASE 
  WHEN status = 'in_progress' THEN 'accepted'
  WHEN status = 'completed' THEN 'completed'
  WHEN status = 'cancelled' THEN 'cancelled'
  ELSE 'pending'
END
WHERE status NOT IN ('pending', 'accepted', 'refused', 'delivered', 'completed', 'disputed', 'cancelled');
