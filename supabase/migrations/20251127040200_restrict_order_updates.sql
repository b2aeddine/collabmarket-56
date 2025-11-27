-- Migration: Restrict Order Updates
-- Description: Removes the permissive RLS policy for order updates.
-- DEPENDENCY: Frontend must use safe_update_order_status() RPC before this is applied.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop the permissive update policy created in Phase 1
DROP POLICY IF EXISTS "Participants update orders" ON public.orders;

-- Ensure no other update policies exist for authenticated users (except maybe admins if defined elsewhere)
-- We rely on the RPC (SECURITY DEFINER) to perform updates now.
