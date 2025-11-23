-- Create search_history table to track user searches
CREATE TABLE IF NOT EXISTS public.search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  search_term text NOT NULL,
  filters jsonb,
  result_count integer,
  clicked_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create search_analytics table for platform-wide analytics
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  total_searches integer DEFAULT 0,
  avg_search_time numeric,
  top_search_terms text[],
  top_filters text[],
  conversion_rate numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_search_text ON public.profiles 
  USING gin(to_tsvector('french', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(bio, '')));

CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city) WHERE city IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_verified_public ON public.profiles(is_verified, is_profile_public, is_banned) 
  WHERE role = 'influenceur';

CREATE INDEX IF NOT EXISTS idx_offers_price ON public.offers(price) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_social_links_followers ON public.social_links(followers) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON public.search_history(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for search_history
CREATE POLICY "Users can view their own search history"
  ON public.search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
  ON public.search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage search history"
  ON public.search_history FOR ALL
  USING (true);

-- RLS policies for search_analytics (admin only)
CREATE POLICY "Only admins can view search analytics"
  ON public.search_analytics FOR SELECT
  USING (is_current_user_admin());

CREATE POLICY "Service role can manage search analytics"
  ON public.search_analytics FOR ALL
  USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_search_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_search_analytics_timestamp
  BEFORE UPDATE ON public.search_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_search_analytics_updated_at();