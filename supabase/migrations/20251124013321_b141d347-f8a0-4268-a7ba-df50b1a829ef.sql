-- Remove the soft delete approach and store offer details directly in orders

-- 1. Add columns to orders table to store offer snapshot
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS offer_title TEXT,
ADD COLUMN IF NOT EXISTS offer_description TEXT,
ADD COLUMN IF NOT EXISTS offer_delivery_time TEXT,
ADD COLUMN IF NOT EXISTS offer_platform TEXT;

-- 2. Copy existing offer data to orders (for historical data)
UPDATE public.orders o
SET 
  offer_title = off.title,
  offer_description = off.description,
  offer_delivery_time = off.delivery_time
FROM public.offers off
WHERE o.offer_id = off.id
  AND o.offer_title IS NULL;

-- 3. Make offer_id nullable so orders can exist without the original offer
ALTER TABLE public.orders 
ALTER COLUMN offer_id DROP NOT NULL;

-- 4. Drop the policy that depends on is_deleted first
DROP POLICY IF EXISTS "Anyone can view active non-deleted offers" ON public.offers;

-- 5. Remove the soft delete column from offers
ALTER TABLE public.offers
DROP COLUMN IF EXISTS is_deleted;

-- 6. Drop the index we created for soft delete
DROP INDEX IF EXISTS idx_offers_is_deleted;

-- 7. Restore original RLS policy for offers
CREATE POLICY "Anyone can view active offers" 
ON public.offers 
FOR SELECT 
USING (is_active = true);