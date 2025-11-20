-- Optimisation des performances : Ajout d'indexes sur les colonnes fréquemment filtrées

-- Index pour orders.influencer_id (utilisé constamment dans useOrders)
CREATE INDEX IF NOT EXISTS idx_orders_influencer_id ON public.orders(influencer_id);

-- Index pour orders.merchant_id (utilisé constamment dans useOrders)
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON public.orders(merchant_id);

-- Index composite pour orders.status et dates (pour filtres et tri)
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON public.orders(status, created_at DESC);

-- Index pour influencer_revenues.influencer_id et status
CREATE INDEX IF NOT EXISTS idx_influencer_revenues_influencer_status ON public.influencer_revenues(influencer_id, status);

-- Index pour messages non lus
CREATE INDEX IF NOT EXISTS idx_messages_receiver_unread ON public.messages(receiver_id, is_read);

-- Index pour withdrawal_requests par influenceur
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_influencer ON public.withdrawal_requests(influencer_id, status);