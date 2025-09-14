-- Corriger les tables existantes et ajouter ce qui manque

-- La table bank_accounts existe déjà, donc on ajoute seulement les colonnes manquantes si nécessaire
DO $$ 
BEGIN
    -- Vérifier et ajouter la colonne bic si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bank_accounts' AND column_name='bic') THEN
        ALTER TABLE public.bank_accounts ADD COLUMN bic TEXT;
    END IF;
    
    -- Vérifier et ajouter la colonne bank_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bank_accounts' AND column_name='bank_name') THEN
        ALTER TABLE public.bank_accounts ADD COLUMN bank_name TEXT;
    END IF;
END $$;

-- Créer la table des revenus des influenceurs
CREATE TABLE IF NOT EXISTS public.influencer_revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'withdrawn', 'pending_withdrawal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur influencer_revenues
ALTER TABLE public.influencer_revenues ENABLE ROW LEVEL SECURITY;

-- Supprimer et recréer les politiques pour influencer_revenues
DROP POLICY IF EXISTS "Influencers can view their own revenues" ON public.influencer_revenues;
CREATE POLICY "Influencers can view their own revenues" 
ON public.influencer_revenues 
FOR SELECT 
USING (influencer_id = auth.uid());

-- Créer la table des demandes de retrait
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Supprimer et recréer les politiques pour withdrawal_requests
DROP POLICY IF EXISTS "Influencers can view their own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Influencers can create their own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can view all withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admins can update withdrawal requests" ON public.withdrawal_requests;

CREATE POLICY "Influencers can view their own withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can create their own withdrawal requests" 
ON public.withdrawal_requests 
FOR INSERT 
WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Admins can view all withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Admins can update withdrawal requests" 
ON public.withdrawal_requests 
FOR UPDATE 
USING (is_current_user_admin());

-- Fonction pour calculer le solde disponible d'un influenceur
CREATE OR REPLACE FUNCTION public.get_influencer_available_balance(user_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(net_amount)
    FROM public.influencer_revenues
    WHERE influencer_id = user_id 
    AND status = 'available'
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;