-- Mettre à jour la table stripe_accounts pour inclure plus d'informations
ALTER TABLE public.stripe_accounts 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS capabilities_transfers BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS capabilities_card_payments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS external_account_last4 TEXT,
ADD COLUMN IF NOT EXISTS external_account_bank_name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'FR',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'eur',
ADD COLUMN IF NOT EXISTS tos_acceptance_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Créer une table pour stocker les transferts Stripe
CREATE TABLE IF NOT EXISTS public.stripe_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_transfer_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- en centimes
  platform_fee INTEGER NOT NULL, -- frais de plateforme en centimes
  influencer_amount INTEGER NOT NULL, -- montant pour l'influenceur en centimes
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  transferred_at TIMESTAMPTZ,
  failure_reason TEXT
);

-- Activer RLS sur la table stripe_transfers
ALTER TABLE public.stripe_transfers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour stripe_transfers
CREATE POLICY "Influencers can view their own transfers" ON public.stripe_transfers
FOR SELECT
USING (influencer_id = auth.uid());

CREATE POLICY "Merchants can view their own transfers" ON public.stripe_transfers
FOR SELECT
USING (merchant_id = auth.uid());

-- Mettre à jour la table orders pour inclure le statut de transfert
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_captured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS transfer_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transfer_completed_at TIMESTAMPTZ;

-- Ajouter une politique pour permettre aux edge functions de gérer les transferts
CREATE POLICY "Service role can manage transfers" ON public.stripe_transfers
FOR ALL
USING (true);

-- Ajouter une politique pour permettre aux edge functions de gérer les comptes Stripe
CREATE POLICY "Service role can manage stripe accounts" ON public.stripe_accounts
FOR ALL
USING (true);