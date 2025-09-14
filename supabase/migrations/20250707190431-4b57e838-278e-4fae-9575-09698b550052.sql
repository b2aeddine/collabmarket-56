
-- Ajouter les colonnes Stripe manquantes à la table orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Créer un index pour optimiser les requêtes sur les payment intents
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Ajouter des contraintes pour le statut de paiement
ALTER TABLE public.orders 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled'));

-- Mettre à jour la fonction pour calculer le solde disponible
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

-- Créer une fonction pour créer automatiquement un compte Stripe Connect
CREATE OR REPLACE FUNCTION create_stripe_connect_account(user_id UUID, email TEXT)
RETURNS UUID AS $$
DECLARE
  account_id UUID;
BEGIN
  INSERT INTO public.stripe_accounts (
    user_id,
    account_status,
    details_submitted,
    charges_enabled,
    payouts_enabled
  ) VALUES (
    user_id,
    'pending',
    false,
    false,
    false
  ) RETURNING id INTO account_id;
  
  RETURN account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une vue pour les statistiques de revenus
CREATE OR REPLACE VIEW revenue_stats AS
SELECT 
  influencer_id,
  SUM(CASE WHEN status = 'available' THEN net_amount ELSE 0 END) as available_balance,
  SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0 END) as pending_balance,
  SUM(net_amount) as total_revenue,
  COUNT(*) as total_orders
FROM revenues
GROUP BY influencer_id;

-- Politique RLS pour la vue revenue_stats
CREATE POLICY "revenue_stats_policy" ON revenue_stats
  FOR SELECT USING (influencer_id = auth.uid());

-- Fonction pour traiter automatiquement les paiements expirés
CREATE OR REPLACE FUNCTION process_expired_payments()
RETURNS void AS $$
BEGIN
  -- Annuler les paiements en attente depuis plus de 24h
  UPDATE public.orders 
  SET 
    payment_status = 'canceled',
    status = 'cancelled',
    updated_at = now()
  WHERE 
    payment_status = 'pending' 
    AND created_at < now() - INTERVAL '24 hours'
    AND status = 'pending_payment';
    
  -- Log les actions
  INSERT INTO public.notifications (user_id, type, title, content)
  SELECT 
    merchant_id,
    'payment_expired',
    'Paiement expiré',
    'Votre commande a été annulée car le paiement n''a pas été effectué dans les temps.'
  FROM public.orders 
  WHERE payment_status = 'canceled' 
  AND updated_at >= now() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
