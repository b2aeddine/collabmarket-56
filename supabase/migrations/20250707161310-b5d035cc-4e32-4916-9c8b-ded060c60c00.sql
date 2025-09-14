
-- Table pour les comptes bancaires (RIB) des influenceurs
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  iban TEXT NOT NULL,
  bic TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS pour bank_accounts
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent gérer leurs propres comptes bancaires
CREATE POLICY "Users can manage their own bank accounts" ON public.bank_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Table pour les comptes Stripe Connect des influenceurs
CREATE TABLE public.stripe_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  account_status TEXT DEFAULT 'pending',
  details_submitted BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS pour stripe_accounts
ALTER TABLE public.stripe_accounts ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leurs propres comptes Stripe
CREATE POLICY "Users can view their own stripe accounts" ON public.stripe_accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Mettre à jour la table withdrawals existante pour inclure le statut et les détails
ALTER TABLE public.withdrawals 
ADD COLUMN IF NOT EXISTS stripe_payout_id TEXT,
ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES public.bank_accounts(id),
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Mettre à jour les policies existantes pour withdrawals si nécessaire
DROP POLICY IF EXISTS "Influencers can manage their own withdrawals" ON public.withdrawals;
CREATE POLICY "Influencers can manage their own withdrawals" ON public.withdrawals
  FOR ALL USING (auth.uid() = influencer_id);

-- Fonction pour calculer le solde disponible d'un influenceur
CREATE OR REPLACE FUNCTION get_available_balance(user_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(net_amount)
    FROM revenues
    WHERE influencer_id = user_id 
    AND status = 'available'
  ), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_revenues_influencer_status ON revenues(influencer_id, status);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user_id ON stripe_accounts(user_id);
