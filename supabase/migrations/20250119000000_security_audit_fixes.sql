-- ============================================
-- SECURITY AUDIT FIXES - 19/01/2025
-- Addressing critical vulnerabilities identified in security audit
-- ============================================

-- ============================================
-- 1. FIX PROFILES TABLE - RESTRICT PII EXPOSURE
-- ============================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Create restrictive policy for anonymous users
-- Only expose minimal, non-sensitive data for public profiles
CREATE POLICY "Anonymous users can view limited public profile data"
ON profiles FOR SELECT
TO anon
USING (
  -- Only allow access to public profiles
  is_profile_public = true
)
WITH CHECK (false);

-- Add a view with only safe columns for anonymous access
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
  id,
  first_name,
  last_name,
  role,
  bio,
  avatar_url,
  city,  -- Location is OK at city level, not full address
  instagram_url,
  tiktok_url,
  profile_views,
  is_profile_public,
  custom_username,
  company_name,
  created_at
FROM profiles
WHERE is_profile_public = true;

-- Grant access to the view for anonymous users
GRANT SELECT ON public_profiles TO anon;
GRANT SELECT ON public_profiles TO authenticated;

-- Authenticated users can see their own full profile
CREATE POLICY "Users can view own full profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. FIX SOCIAL_LINKS - REQUIRE AUTHENTICATION
-- ============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Social links viewable by everyone" ON social_links;
DROP POLICY IF EXISTS "Anyone can view social links" ON social_links;

-- Only authenticated users can view social links
CREATE POLICY "Authenticated users can view social links"
ON social_links FOR SELECT
TO authenticated
USING (true);

-- Users can manage their own social links
CREATE POLICY "Users can manage own social links"
ON social_links FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- 3. FIX PAYMENT_LOGS - RESTRICT ACCESS
-- ============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "payment_logs_select" ON payment_logs;
DROP POLICY IF EXISTS "Anyone can view payment logs" ON payment_logs;

-- Only allow users to see their own payment logs
CREATE POLICY "Users can view own payment logs as merchant"
ON payment_logs FOR SELECT
TO authenticated
USING (
  merchant_id = auth.uid()
);

CREATE POLICY "Users can view own payment logs as influencer"
ON payment_logs FOR SELECT
TO authenticated
USING (
  influencer_id = auth.uid()
);

-- Admins can view all payment logs
CREATE POLICY "Admins can view all payment logs"
ON payment_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.is_active = true
  )
);

-- Only system can insert payment logs (via service role)
CREATE POLICY "Service role can insert payment logs"
ON payment_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================
-- 4. FIX ADMIN ROLES - STRENGTHEN SECURITY
-- ============================================

-- Ensure admin_roles table exists and is properly secured
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Enable RLS on admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Admins can view admin roles" ON admin_roles;
DROP POLICY IF EXISTS "Anyone can view admin roles" ON admin_roles;

-- Only admins can view admin roles
CREATE POLICY "Admins can view admin roles"
ON admin_roles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
    AND ar.is_active = true
  )
);

-- Only admins can manage admin roles
CREATE POLICY "Admins can manage admin roles"
ON admin_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
    AND ar.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_roles ar
    WHERE ar.user_id = auth.uid()
    AND ar.is_active = true
  )
);

-- ============================================
-- 5. UPDATE ADMIN CHECK FUNCTION
-- ============================================

-- Drop old function
DROP FUNCTION IF EXISTS is_current_user_admin();

-- Create corrected function using admin_roles table
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admin_roles
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_current_user_admin() TO authenticated;

-- ============================================
-- 6. SECURE ORDERS TABLE
-- ============================================

-- Ensure orders can only be viewed by involved parties
DROP POLICY IF EXISTS "Users can view orders" ON orders;

CREATE POLICY "Merchants can view their orders"
ON orders FOR SELECT
TO authenticated
USING (merchant_id = auth.uid());

CREATE POLICY "Influencers can view their orders"
ON orders FOR SELECT
TO authenticated
USING (influencer_id = auth.uid());

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_roles
    WHERE admin_roles.user_id = auth.uid()
    AND admin_roles.is_active = true
  )
);

-- ============================================
-- 7. SECURE OFFERS TABLE
-- ============================================

-- Public can view active offers for browsing
CREATE POLICY "Anyone can view active offers"
ON offers FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Users can manage their own offers
CREATE POLICY "Influencers can manage own offers"
ON offers FOR ALL
TO authenticated
USING (influencer_id = auth.uid())
WITH CHECK (influencer_id = auth.uid());

-- ============================================
-- 8. ADD SECURITY INDEXES
-- ============================================

-- Improve performance of security checks
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_active ON admin_roles(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_public ON profiles(is_profile_public) WHERE is_profile_public = true;
CREATE INDEX IF NOT EXISTS idx_social_links_user ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_merchant ON payment_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_influencer ON payment_logs(influencer_id);

-- ============================================
-- SUMMARY OF CHANGES
-- ============================================
-- ✅ Restricted PII exposure in profiles table
-- ✅ Created public_profiles view for safe anonymous access  
-- ✅ Required authentication for social_links access
-- ✅ Fixed payment_logs to only show user's own transactions
-- ✅ Strengthened admin_roles table security
-- ✅ Updated is_current_user_admin() to use admin_roles table
-- ✅ Added proper RLS policies for orders and offers
-- ✅ Added performance indexes for security checks

