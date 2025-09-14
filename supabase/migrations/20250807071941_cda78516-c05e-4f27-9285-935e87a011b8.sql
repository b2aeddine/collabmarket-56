-- Supprimer la contrainte de statut qui pose problème
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Ajouter les nouveaux statuts nécessaires
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'pending_payment', 'paid', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed', 'refused'));

-- Ajouter une colonne pour tracker les webhooks
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMPTZ;

-- Ajouter une table pour les logs de paiement (fallback)
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  order_id UUID REFERENCES public.orders(id),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payment_logs
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage payment logs
CREATE POLICY "Service role can manage payment logs" 
ON public.payment_logs FOR ALL
USING (true);