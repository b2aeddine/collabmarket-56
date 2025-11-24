-- ============================================
-- SECURITY FIX 1: Fix Admin Check Function (without dropping)
-- ============================================

-- Replace function to check admin_roles table
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Query admin_roles table instead of profiles.is_admin for security
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles 
    WHERE user_id = auth.uid() 
    AND is_active = true
  );
END;
$$;

-- Replace is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_roles 
    WHERE admin_roles.user_id = $1 
    AND is_active = true
  );
END;
$$;

-- ============================================
-- SECURITY FIX 2: Create User Roles System
-- ============================================

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'influenceur', 'commercant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_at timestamp with time zone DEFAULT now(),
  granted_by uuid REFERENCES public.profiles(id),
  is_active boolean DEFAULT true,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
DO $$ BEGIN
  CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Function to get user role with fallback
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid DEFAULT auth.uid())
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role
  FROM public.user_roles
  WHERE user_roles.user_id = $1 AND is_active = true
  LIMIT 1;
  
  IF user_role IS NULL THEN
    SELECT profiles.role INTO user_role
    FROM public.profiles WHERE profiles.id = $1;
  END IF;
  
  RETURN user_role;
END;
$$;

-- ============================================
-- SECURITY FIX 3: Migrate Existing Data
-- ============================================

INSERT INTO public.user_roles (user_id, role, granted_at, is_active)
SELECT id, role::app_role, created_at, true
FROM public.profiles
WHERE role IN ('admin', 'influenceur', 'commercant')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.admin_roles (user_id, role, is_active)
SELECT id, 'admin', true
FROM public.profiles
WHERE is_admin = true
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- SECURITY FIX 4: Add Race Condition Prevention
-- ============================================

CREATE UNIQUE INDEX IF NOT EXISTS unique_revenue_per_order 
ON public.influencer_revenues(order_id) WHERE order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_transfer_per_order 
ON public.stripe_transfers(order_id) WHERE order_id IS NOT NULL;

-- ============================================
-- SECURITY FIX 5: Prevent Role Self-Modification
-- ============================================

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile except sensitive fields"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  AND COALESCE(is_admin, false) = (SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid())
);

-- ============================================
-- SECURITY FIX 6: Update New User Handler
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'influenceur');
  
  INSERT INTO public.profiles (
    id, email, role, first_name, last_name,
    is_verified, is_profile_public, company_name,
    custom_username, is_admin
  ) VALUES (
    NEW.id, NEW.email, user_role,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    false,
    CASE WHEN user_role = 'admin' THEN false ELSE true END,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'custom_username',
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  
  IF user_role IN ('admin', 'influenceur', 'commercant') THEN
    INSERT INTO public.user_roles (user_id, role, is_active)
    VALUES (NEW.id, user_role::app_role, true);
  END IF;
  
  IF user_role = 'admin' THEN
    INSERT INTO public.admin_roles (user_id, role, is_active)
    VALUES (NEW.id, 'admin', true);
  END IF;
  
  RETURN NEW;
END;
$$;