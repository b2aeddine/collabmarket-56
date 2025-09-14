-- Supprimer les tables liées à Stripe Connect
DROP TABLE IF EXISTS public.stripe_accounts CASCADE;

-- Créer la table bank_accounts si elle n'existe pas déjà (pour les IBAN des influenceurs)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  iban TEXT NOT NULL,
  bic TEXT,
  account_holder TEXT NOT NULL,
  bank_name TEXT,
  is_default BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs gèrent leurs propres comptes bancaires
CREATE POLICY "Users can manage their own bank accounts" 
ON public.bank_accounts 
FOR ALL 
USING (auth.uid() = user_id);

-- Créer la table des revenus des influenceurs
CREATE TABLE IF NOT EXISTS public.influencer_revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Politique pour que les influenceurs voient leurs propres revenus
CREATE POLICY "Influencers can view their own revenues" 
ON public.influencer_revenues 
FOR SELECT 
USING (influencer_id = auth.uid());

-- Créer la table des demandes de retrait
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur withdrawal_requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Politique pour que les influenceurs voient leurs propres demandes
CREATE POLICY "Influencers can view their own withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (influencer_id = auth.uid());

-- Politique pour que les influenceurs créent leurs propres demandes
CREATE POLICY "Influencers can create their own withdrawal requests" 
ON public.withdrawal_requests 
FOR INSERT 
WITH CHECK (influencer_id = auth.uid());

-- Politique pour que les admins voient toutes les demandes
CREATE POLICY "Admins can view all withdrawal requests" 
ON public.withdrawal_requests 
FOR SELECT 
USING (is_current_user_admin());

-- Politique pour que les admins mettent à jour les demandes
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

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_influencer_revenues_updated_at ON public.influencer_revenues;
CREATE TRIGGER update_influencer_revenues_updated_at
  BEFORE UPDATE ON public.influencer_revenues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON public.withdrawal_requests;
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();