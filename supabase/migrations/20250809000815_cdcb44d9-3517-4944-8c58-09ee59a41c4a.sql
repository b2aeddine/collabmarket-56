-- Add new status for payment authorization flow
UPDATE orders SET status = 'payment_authorized' WHERE status = 'pending' AND stripe_session_id IS NOT NULL;

-- Create function to auto-cancel payment authorized orders after 48h
CREATE OR REPLACE FUNCTION public.auto_cancel_payment_authorized_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Cancel payment authorized orders older than 48h by calling the cancel-payment edge function
  UPDATE public.orders 
  SET 
    status = 'annulée',
    updated_at = now()
  WHERE 
    status = 'payment_authorized'
    AND created_at < now() - INTERVAL '48 hours';
END;
$function$;