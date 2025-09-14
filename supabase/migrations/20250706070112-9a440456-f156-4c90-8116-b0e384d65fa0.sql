
-- Ajouter les tables manquantes à la migration précédente

-- Table des favoris (commerçants qui marquent des influenceurs favoris)
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, influencer_id)
);

-- Table pour tracer les vues de profil détaillées
CREATE TABLE public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_order', 'message', 'payment', 'verification'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID, -- ID de l'ordre, message, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les reviews/avis sur les influenceurs
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id)
);

-- Table pour les catégories d'influenceurs
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison influenceurs-catégories (relation many-to-many)
CREATE TABLE public.profile_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, category_id)
);

-- Table pour les paramètres système
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour favorites
CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (merchant_id = auth.uid());

-- Politiques RLS pour profile_views
CREATE POLICY "Profile owners can view their profile views" ON public.profile_views
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Anyone can record profile views" ON public.profile_views
  FOR INSERT WITH CHECK (true);

-- Politiques RLS pour notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Politiques RLS pour reviews
CREATE POLICY "Anyone can view public reviews" ON public.reviews
  FOR SELECT USING (is_public = true);

CREATE POLICY "Merchants can create reviews for their orders" ON public.reviews
  FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Review authors can update their reviews" ON public.reviews
  FOR UPDATE USING (merchant_id = auth.uid());

-- Politiques RLS pour categories
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

-- Politiques RLS pour profile_categories
CREATE POLICY "Users can manage their own categories" ON public.profile_categories
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY "Anyone can view profile categories" ON public.profile_categories
  FOR SELECT USING (true);

-- Politiques RLS pour system_settings (admin seulement)
CREATE POLICY "System settings are read-only for all" ON public.system_settings
  FOR SELECT USING (true);

-- Fonction pour incrémenter les vues de profil
CREATE OR REPLACE FUNCTION public.increment_profile_views(
  target_profile_id UUID,
  viewer_ip INET DEFAULT NULL,
  viewer_user_agent TEXT DEFAULT NULL,
  viewer_referrer TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insérer la vue détaillée
  INSERT INTO public.profile_views (profile_id, viewer_id, viewer_ip, user_agent, referrer)
  VALUES (target_profile_id, auth.uid(), viewer_ip, viewer_user_agent, viewer_referrer);
  
  -- Incrémenter le compteur dans profiles
  UPDATE public.profiles 
  SET profile_views = profile_views + 1 
  WHERE id = target_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer la note moyenne d'un influenceur
CREATE OR REPLACE FUNCTION public.get_influencer_rating(influencer_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
  SELECT COALESCE(AVG(rating::DECIMAL), 0.0)::DECIMAL(3,2)
  FROM public.reviews 
  WHERE influencer_id = influencer_uuid AND is_public = true;
$$ LANGUAGE SQL STABLE;

-- Fonction pour obtenir le solde disponible d'un influenceur
CREATE OR REPLACE FUNCTION public.get_available_balance(influencer_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  total_revenue DECIMAL(10,2);
  total_withdrawn DECIMAL(10,2);
BEGIN
  -- Calculer le total des revenus
  SELECT COALESCE(SUM(net_amount), 0) INTO total_revenue
  FROM public.revenues
  WHERE influencer_id = influencer_uuid;
  
  -- Calculer le total des retraits traités
  SELECT COALESCE(SUM(amount), 0) INTO total_withdrawn
  FROM public.withdrawals
  WHERE influencer_id = influencer_uuid 
  AND status IN ('completed', 'processing');
  
  RETURN total_revenue - total_withdrawn;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION public.create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_content TEXT,
  related_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, content, related_id)
  VALUES (target_user_id, notification_type, notification_title, notification_content, related_entity_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer des notifications automatiques sur nouvelles commandes
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Notifier l'influenceur d'une nouvelle commande
  PERFORM public.create_notification(
    NEW.influencer_id,
    'new_order',
    'Nouvelle commande reçue',
    'Vous avez reçu une nouvelle commande de ' || (SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = NEW.merchant_id),
    NEW.id
  );
  
  -- Notifier le commerçant de la confirmation de commande
  PERFORM public.create_notification(
    NEW.merchant_id,
    'order_confirmation',
    'Commande confirmée',
    'Votre commande a été envoyée à ' || (SELECT first_name || ' ' || last_name FROM public.profiles WHERE id = NEW.influencer_id),
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

-- Trigger pour notifications sur changement de statut de commande
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Notifier le commerçant du changement de statut
    PERFORM public.create_notification(
      NEW.merchant_id,
      'order_status_update',
      'Statut de commande mis à jour',
      'Votre commande est maintenant : ' || NEW.status,
      NEW.id
    );
    
    -- Si commande terminée, notifier l'influenceur des revenus
    IF NEW.status = 'completed' THEN
      PERFORM public.create_notification(
        NEW.influencer_id,
        'revenue_earned',
        'Revenus ajoutés',
        'Vous avez gagné des revenus suite à une commande terminée',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_order_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status_change();

-- Insérer des catégories par défaut
INSERT INTO public.categories (name, slug, description, icon_name) VALUES
('Tech & Gaming', 'tech-gaming', 'Technologie, jeux vidéo, gadgets', 'Gamepad2'),
('Beauté & Mode', 'beaute-mode', 'Cosmétiques, mode, lifestyle', 'Sparkles'),
('Fitness & Sport', 'fitness-sport', 'Sport, fitness, bien-être', 'Dumbbell'),
('Food & Cooking', 'food-cooking', 'Cuisine, restaurants, recettes', 'ChefHat'),
('Travel & Adventure', 'travel-adventure', 'Voyages, aventures, découvertes', 'Plane'),
('Art & Culture', 'art-culture', 'Art, culture, créativité', 'Palette'),
('Business & Finance', 'business-finance', 'Entrepreneuriat, finance, business', 'TrendingUp'),
('Family & Parenting', 'family-parenting', 'Famille, parentalité, enfants', 'Heart'),
('Education & Learning', 'education-learning', 'Éducation, formation, apprentissage', 'GraduationCap'),
('Entertainment', 'entertainment', 'Divertissement, humour, spectacle', 'Drama');

-- Insérer des paramètres système par défaut
INSERT INTO public.system_settings (key, value, description) VALUES
('commission_rate', '{"default": 10.0, "min": 5.0, "max": 20.0}', 'Taux de commission par défaut et limites'),
('min_withdrawal_amount', '{"amount": 50.0, "currency": "EUR"}', 'Montant minimum pour un retrait'),
('verification_required_followers', '{"instagram": 1000, "tiktok": 1000, "youtube": 500}', 'Nombre minimum d abonnés requis pour la vérification'),
('platform_fee_rates', '{"stripe": 2.9, "paypal": 3.4}', 'Frais des plateformes de paiement');

-- Index pour optimiser les performances des nouvelles tables
CREATE INDEX idx_favorites_merchant ON public.favorites(merchant_id);
CREATE INDEX idx_favorites_influencer ON public.favorites(influencer_id);
CREATE INDEX idx_profile_views_profile_viewed_at ON public.profile_views(profile_id, viewed_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_reviews_influencer_rating ON public.reviews(influencer_id, rating);
CREATE INDEX idx_reviews_public ON public.reviews(is_public, created_at DESC);
CREATE INDEX idx_profile_categories_profile ON public.profile_categories(profile_id);
CREATE INDEX idx_profile_categories_category ON public.profile_categories(category_id);
