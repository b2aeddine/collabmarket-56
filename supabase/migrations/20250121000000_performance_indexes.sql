-- Performance optimization: Add indexes for frequently queried columns

-- Index for reviews by influencer_id (used in useReviews hook)
CREATE INDEX IF NOT EXISTS idx_reviews_influencer_id_is_public 
ON public.reviews(influencer_id, is_public) 
WHERE is_public = true;

-- Index for reviews rating aggregation
CREATE INDEX IF NOT EXISTS idx_reviews_influencer_rating 
ON public.reviews(influencer_id, rating) 
WHERE is_public = true;

-- Composite index for profiles query optimization
CREATE INDEX IF NOT EXISTS idx_profiles_role_verified_public_banned 
ON public.profiles(role, is_verified, is_profile_public, is_banned)
WHERE role = 'influenceur' AND is_verified = true AND is_profile_public = true AND is_banned = false;

-- Index for social_links followers aggregation
CREATE INDEX IF NOT EXISTS idx_social_links_user_id_followers 
ON public.social_links(user_id, followers)
WHERE is_active = true;

-- Index for offers price filtering
CREATE INDEX IF NOT EXISTS idx_offers_influencer_price_active 
ON public.offers(influencer_id, price, is_active)
WHERE is_active = true;

-- Index for profile_categories lookup
CREATE INDEX IF NOT EXISTS idx_profile_categories_user_category 
ON public.profile_categories(user_id, category_id);

