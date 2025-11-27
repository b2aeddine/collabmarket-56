-- Migration: Update commission rate from 10% to 5%
-- Created: 2025-11-27
-- Purpose: Change default commission rate across the platform from 10% to 5%

-- 1. Update system_settings table - change default commission rate
UPDATE public.system_settings
SET 
  value = '{"default": 5.0, "min": 5.0, "max": 20.0}'::jsonb,
  updated_at = NOW()
WHERE key = 'commission_rate';

-- 2. Alter orders table - change default commission_rate from 10.0 to 5.0
ALTER TABLE public.orders 
ALTER COLUMN commission_rate SET DEFAULT 5.0;

-- 3. Add comment to document the change
COMMENT ON COLUMN public.orders.commission_rate IS 'Platform commission rate (percentage). Default changed from 10.0 to 5.0 on 2025-11-27';

-- 4. Verify the changes
DO $$
DECLARE
  setting_value jsonb;
  default_rate numeric;
BEGIN
  -- Check system_settings
  SELECT value INTO setting_value
  FROM public.system_settings
  WHERE key = 'commission_rate';
  
  RAISE NOTICE 'System settings commission_rate: %', setting_value;
  
  -- Check orders table default
  SELECT column_default INTO default_rate
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'orders'
    AND column_name = 'commission_rate';
    
  RAISE NOTICE 'Orders table commission_rate default: %', default_rate;
END $$;
