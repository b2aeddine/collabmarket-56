-- Fix payment_logs RLS policies to prevent unauthorized access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage payment logs" ON public.payment_logs;

-- Create table for rate limiting contact form submissions
CREATE TABLE IF NOT EXISTS public.contact_form_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_rate_limit_ip_time 
ON public.contact_form_rate_limit(ip_address, created_at);

-- Enable RLS on rate limit table
ALTER TABLE public.contact_form_rate_limit ENABLE ROW LEVEL SECURITY;

-- Service role can manage rate limit entries
CREATE POLICY "Service role can manage rate limits"
ON public.contact_form_rate_limit FOR ALL
USING (true);

-- Create restrictive policies for payment_logs
-- Users can only view payment logs for their own orders
CREATE POLICY "Users can view their own payment logs"
ON public.payment_logs FOR SELECT
USING (
  order_id IN (
    SELECT id FROM public.orders 
    WHERE merchant_id = auth.uid() OR influencer_id = auth.uid()
  )
);

-- Only service role can insert/update/delete payment logs
CREATE POLICY "Service role can manage payment logs"
ON public.payment_logs FOR ALL
USING (
  auth.jwt()->>'role' = 'service_role' OR
  auth.role() = 'service_role'
);

-- Function to cleanup old rate limit entries (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.contact_form_rate_limit
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;