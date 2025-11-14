-- Migration: Fix security and performance issues
-- Date: 2025-01-20
-- Description: 
--   - Fix overly permissive RLS policies
--   - Add missing indexes for performance
--   - Ensure proper constraints

-- ============================================
-- 1. FIX RLS POLICIES - Security improvements
-- ============================================

-- Note: Profile policies are already handled in migration 20250715104010
-- We only add the missing index here, policies are already secure

-- Ensure social links policy respects privacy
-- The current "Anyone can view social links" might expose sensitive data
-- Update to only show active links for public profiles
DROP POLICY IF EXISTS "Anyone can view social links" ON public.social_links;

CREATE POLICY "Users can view active social links for public profiles" 
ON public.social_links 
FOR SELECT 
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = social_links.user_id 
    AND (profiles.is_profile_public = true OR profiles.id = auth.uid())
  )
);

-- Keep the existing policy for users managing their own links
-- (Already exists: "Users can manage their own social links")

-- ============================================
-- 2. ADD MISSING INDEXES - Performance improvements
-- ============================================

-- Index for orders status filtering (very common query)
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status) WHERE status IN ('pending', 'accepted', 'paid', 'delivered', 'completed');

-- Index for orders created_at (for sorting and filtering)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Index for orders merchant_id + status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON public.orders(merchant_id, status);

-- Index for orders influencer_id + status (common query pattern)
CREATE INDEX IF NOT EXISTS idx_orders_influencer_status ON public.orders(influencer_id, status);

-- Index for profiles role + is_profile_public + is_verified (catalog queries)
CREATE INDEX IF NOT EXISTS idx_profiles_public_verified ON public.profiles(role, is_profile_public, is_verified) 
WHERE role = 'influenceur' AND is_profile_public = true AND is_verified = true;

-- Index for offers influencer_id + is_active (common query)
CREATE INDEX IF NOT EXISTS idx_offers_influencer_active ON public.offers(influencer_id, is_active) WHERE is_active = true;

-- Index for messages conversation_id + created_at (for message ordering)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);

-- Index for notifications user_id + is_read + created_at (common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON public.notifications(user_id, is_read, created_at DESC);

-- Index for revenues influencer_id + status + created_at (for balance calculations)
CREATE INDEX IF NOT EXISTS idx_revenues_influencer_status_created ON public.revenues(influencer_id, status, created_at);

-- Index for withdrawals influencer_id + status (common query)
CREATE INDEX IF NOT EXISTS idx_withdrawals_influencer_status ON public.withdrawals(influencer_id, status);

-- Index for disputes order_id + status (common query)
CREATE INDEX IF NOT EXISTS idx_disputes_order_status ON public.disputes(order_id, status);

-- Index for stripe_accounts user_id + charges_enabled (for payment checks)
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user_charges ON public.stripe_accounts(user_id, charges_enabled) WHERE charges_enabled = true;

-- ============================================
-- 3. ADD MISSING CONSTRAINTS - Data integrity
-- ============================================

-- Ensure orders have valid status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_status_check' 
    AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders 
    ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'accepted', 'refused', 'pending_payment', 'paid', 'delivered', 'completed', 'disputed', 'cancelled'));
  END IF;
END $$;

-- Ensure profiles have valid role values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check' 
    AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('influenceur', 'commercant', 'admin'));
  END IF;
END $$;

-- ============================================
-- 4. ADD COLUMN DEFAULTS IF MISSING
-- ============================================

-- Ensure is_profile_public has a default (security: default to false)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_profile_public'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN is_profile_public BOOLEAN DEFAULT false;
  ELSE
    -- Update existing NULL values to false for security
    UPDATE public.profiles 
    SET is_profile_public = false 
    WHERE is_profile_public IS NULL;
    
    -- Set default for future inserts
    ALTER TABLE public.profiles 
    ALTER COLUMN is_profile_public SET DEFAULT false;
  END IF;
END $$;

-- ============================================
-- 5. ANALYZE TABLES - Update statistics
-- ============================================

ANALYZE public.orders;
ANALYZE public.profiles;
ANALYZE public.offers;
ANALYZE public.messages;
ANALYZE public.revenues;
ANALYZE public.withdrawals;
ANALYZE public.disputes;
ANALYZE public.stripe_accounts;

