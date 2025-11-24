-- Add is_deleted column to offers table for soft delete functionality
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Create index on is_deleted for better query performance
CREATE INDEX IF NOT EXISTS idx_offers_is_deleted ON public.offers(is_deleted);

-- Update RLS policies to exclude deleted offers from public view
DROP POLICY IF EXISTS "Anyone can view active offers" ON public.offers;

CREATE POLICY "Anyone can view active non-deleted offers" 
ON public.offers 
FOR SELECT 
USING (is_active = true AND (is_deleted = false OR is_deleted IS NULL));

-- Influencers can still manage (but not actually delete) their offers
-- The delete will be a soft delete (UPDATE is_deleted = true)