-- Drop and recreate the get_influencer_available_balance function to only count CAPTURED payments
CREATE OR REPLACE FUNCTION public.get_influencer_available_balance(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only count revenues from orders that have been ACTUALLY CAPTURED via Stripe
  RETURN COALESCE((
    SELECT SUM(ir.net_amount)
    FROM public.influencer_revenues ir
    INNER JOIN public.orders o ON ir.order_id = o.id
    WHERE ir.influencer_id = user_id 
    AND ir.status = 'available'
    AND o.payment_captured = true
    AND o.stripe_payment_intent_id IS NOT NULL
  ), 0);
END;
$$;

-- Create a new function to get total earned (only from captured payments)
CREATE OR REPLACE FUNCTION public.get_influencer_total_earned_verified(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only count revenues from orders that have been ACTUALLY CAPTURED via Stripe
  RETURN COALESCE((
    SELECT SUM(ir.net_amount)
    FROM public.influencer_revenues ir
    INNER JOIN public.orders o ON ir.order_id = o.id
    WHERE ir.influencer_id = user_id
    AND o.payment_captured = true
    AND o.stripe_payment_intent_id IS NOT NULL
  ), 0);
END;
$$;

-- Create function to get merchant total spent (only captured payments)
CREATE OR REPLACE FUNCTION public.get_merchant_total_spent(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN COALESCE((
    SELECT SUM(o.total_amount)
    FROM public.orders o
    WHERE o.merchant_id = user_id
    AND o.payment_captured = true
    AND o.stripe_payment_intent_id IS NOT NULL
  ), 0);
END;
$$;

-- Create function to clean up invalid revenues (revenues without captured payments)
CREATE OR REPLACE FUNCTION public.cleanup_invalid_revenues()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rows_deleted bigint;
BEGIN
  -- Delete revenues for orders that were never captured
  WITH deleted AS (
    DELETE FROM public.influencer_revenues
    WHERE order_id IN (
      SELECT o.id FROM public.orders o
      WHERE o.payment_captured = false 
      OR o.stripe_payment_intent_id IS NULL
    )
    RETURNING *
  )
  SELECT COUNT(*) INTO rows_deleted FROM deleted;
  
  -- Also delete from legacy revenues table
  DELETE FROM public.revenues
  WHERE order_id IN (
    SELECT o.id FROM public.orders o
    WHERE o.payment_captured = false 
    OR o.stripe_payment_intent_id IS NULL
  );
  
  RETURN QUERY SELECT rows_deleted;
END;
$$;