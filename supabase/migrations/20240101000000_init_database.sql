-- STRUCTURE DE BASE (SAUVEGARDE)
-- Ne pas exécuter si la base est déjà installée.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. TABLES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('influenceur', 'commercant', 'admin')),
  first_name TEXT CHECK (LENGTH(first_name) <= 100),
  last_name TEXT CHECK (LENGTH(last_name) <= 100),
  email TEXT UNIQUE NOT NULL CHECK (position('@' in email) > 1),
  phone TEXT,
  city TEXT CHECK (LENGTH(city) <= 100),
  bio TEXT CHECK (LENGTH(bio) <= 1000),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  profile_views INTEGER DEFAULT 0,
  stripe_account_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter')),
  username TEXT NOT NULL,
  profile_url TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  engagement_rate DECIMAL(4,2) DEFAULT 0,
  is_connected BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (LENGTH(title) >= 3),
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  delivery_time TEXT,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (participant_1_id != participant_2_id)
);

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','shipped','delivered','completed','cancelled','disputed')),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount <= total_amount),
  commission_rate DECIMAL(5,2) DEFAULT 10.0 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  requirements TEXT,
  delivery_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) > 0),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.revenues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  net_amount DECIMAL(10,2) NOT NULL CHECK (net_amount <= amount),
  commission DECIMAL(10,2) NOT NULL CHECK (commission >= 0 AND commission <= amount),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','available','withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_revenues_order UNIQUE(order_id)
);

CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  payment_method TEXT,
  payment_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(merchant_id, influencer_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.audit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES & VUES
CREATE INDEX idx_offers_influencer_id ON public.offers (influencer_id);
CREATE INDEX idx_offers_category_id ON public.offers (category_id);
CREATE INDEX idx_orders_merchant_id ON public.orders (merchant_id);
CREATE INDEX idx_orders_influencer_id ON public.orders (influencer_id);
CREATE INDEX idx_messages_conversation_id ON public.messages (conversation_id);
CREATE INDEX idx_conversations_p1 ON public.conversations (participant_1_id);
CREATE INDEX idx_conversations_p2 ON public.conversations (participant_2_id);
CREATE INDEX idx_audit_orders_order_id ON public.audit_orders (order_id);
CREATE UNIQUE INDEX ux_conversations_participants_canonical ON public.conversations ((LEAST(participant_1_id, participant_2_id)), (GREATEST(participant_1_id, participant_2_id)));

CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, role, first_name, last_name, city, bio, avatar_url, is_verified, profile_views, created_at
FROM public.profiles;

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM public.profiles WHERE role='influenceur') as total_influencers,
  (SELECT COUNT(*) FROM public.profiles WHERE role='commercant') as total_merchants,
  (SELECT COUNT(*) FROM public.orders WHERE status='completed') as completed_orders,
  (SELECT COALESCE(SUM(amount), 0) FROM public.revenues) as total_volume_eur;

-- 3. LOGIQUE MÉTIER
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id,email,role,first_name,last_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role','influenceur'), NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'),'')='admin';
$$;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp() RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_update_conversation_ts AFTER INSERT ON public.messages FOR EACH ROW EXECUTE PROCEDURE public.update_conversation_timestamp();

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_offers BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER trg_set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE FUNCTION public.audit_order_status_change() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_orders (order_id, old_status, new_status, changed_by) VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER trg_audit_order_status AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE public.audit_order_status_change();

CREATE OR REPLACE FUNCTION public.safe_update_order_status(p_order_id uuid, p_new_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_merchant_id uuid; v_influencer_id uuid; v_current_status text; v_total_amount numeric; v_net_amount numeric; v_actor_id uuid;
  allowed_statuses text[] := ARRAY['pending','accepted','in_progress','shipped','delivered','completed','cancelled','disputed'];
BEGIN
  v_actor_id := auth.uid();
  IF v_actor_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT merchant_id, influencer_id, status, total_amount, net_amount INTO v_merchant_id, v_influencer_id, v_current_status, v_total_amount, v_net_amount
  FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_actor_id != v_merchant_id AND v_actor_id != v_influencer_id AND NOT public.is_admin() THEN RAISE EXCEPTION 'Access Denied'; END IF;
  IF NOT (p_new_status = ANY (allowed_statuses)) THEN RAISE EXCEPTION 'Invalid status'; END IF;
  IF v_current_status='pending' AND p_new_status NOT IN ('accepted','cancelled') THEN RAISE EXCEPTION 'Invalid transition'; END IF;
  IF v_current_status='completed' AND p_new_status != 'disputed' THEN RAISE EXCEPTION 'Order is completed'; END IF;
  IF v_current_status='cancelled' THEN RAISE EXCEPTION 'Order is cancelled'; END IF;
  
  UPDATE public.orders SET status = p_new_status WHERE id = p_order_id;
  
  IF p_new_status='completed' THEN
    INSERT INTO public.revenues (influencer_id, order_id, amount, net_amount, commission, status, created_at)
    VALUES (v_influencer_id, p_order_id, v_total_amount, v_net_amount, (v_total_amount-v_net_amount), 'available', NOW())
    ON CONFLICT (order_id) DO NOTHING;
  END IF;
END;
$$;

-- 4. RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Public view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public view active social links" ON public.social_links FOR SELECT USING (is_active = true);
CREATE POLICY "Users manage own links" ON public.social_links FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public view active offers" ON public.offers FOR SELECT USING (is_active = true OR influencer_id = auth.uid());
CREATE POLICY "Influencers manage offers" ON public.offers FOR ALL USING (influencer_id = auth.uid());

CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);
CREATE POLICY "Participants create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Participants view messages" ON public.messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Participants view orders" ON public.orders FOR SELECT USING (merchant_id = auth.uid() OR influencer_id = auth.uid() OR public.is_admin());
CREATE POLICY "Merchants create orders" ON public.orders FOR INSERT WITH CHECK (merchant_id = auth.uid());
CREATE POLICY "Orders update via RPC only" ON public.orders FOR UPDATE USING (false);

CREATE POLICY "Influencers view own revenues" ON public.revenues FOR SELECT USING (influencer_id = auth.uid() OR public.is_admin());
CREATE POLICY "Influencers manage withdrawals" ON public.withdrawals FOR ALL USING (influencer_id = auth.uid());
CREATE POLICY "Admins manage withdrawals" ON public.withdrawals FOR ALL USING (public.is_admin());

CREATE POLICY "Merchants manage favorites" ON public.favorites FOR ALL USING (merchant_id = auth.uid());

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Participants view audit" ON public.audit_orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE id = audit_orders.order_id AND (merchant_id = auth.uid() OR influencer_id = auth.uid() OR public.is_admin())));

-- 5. DATA INIT
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

INSERT INTO public.categories (name, slug, description, icon_name) VALUES
('Story Instagram', 'story-instagram', 'Story', 'instagram'),
('Post Instagram', 'post-instagram', 'Post', 'image'),
('Vidéo TikTok', 'video-tiktok', 'TikTok', 'video')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
