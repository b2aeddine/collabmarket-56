-- Migration: Add Admin Helper and Order RPC
-- Description: Adds security helpers and a secure RPC for updating order status.

-- 1. Admin Helper Function
-- Checks if the current user has the 'admin' role in app_metadata
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

-- 2. Safe Order Update RPC
-- Securely updates order status with state machine validation
CREATE OR REPLACE FUNCTION public.safe_update_order_status(
  p_order_id uuid,
  p_new_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner privileges to bypass RLS if needed, but we check permissions manually
SET search_path = public
AS $$
DECLARE
  v_merchant_id uuid;
  v_influencer_id uuid;
  v_current_status text;
  v_actor_id uuid;
BEGIN
  -- 1. Securely get the caller's ID
  v_actor_id := auth.uid();
  
  -- 2. Fetch order details
  SELECT merchant_id, influencer_id, status 
  INTO v_merchant_id, v_influencer_id, v_current_status
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- 3. Permission Check
  -- Allow if actor is merchant, influencer, or admin
  IF v_actor_id != v_merchant_id AND v_actor_id != v_influencer_id AND NOT public.is_admin() THEN
     RAISE EXCEPTION 'Access Denied: You are not a participant of this order.';
  END IF;

  -- 4. State Machine & Logic
  
  -- Rule: Only merchants (or admins) can mark as SHIPPED
  IF p_new_status = 'SHIPPED' AND v_actor_id != v_merchant_id AND NOT public.is_admin() THEN
     RAISE EXCEPTION 'Only merchants can mark orders as shipped.';
  END IF;

  -- Rule: Cannot modify a finalized order
  IF v_current_status IN ('COMPLETED', 'CANCELLED') THEN
     RAISE EXCEPTION 'Order is final and cannot be changed.';
  END IF;

  -- 5. Execute Update
  UPDATE public.orders
  SET status = p_new_status, updated_at = now()
  WHERE id = p_order_id;
END;
$$;
