
-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  merchant_id UUID REFERENCES public.profiles(id) NOT NULL,
  influencer_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view public reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Merchants can create reviews for their orders" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Review authors can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (merchant_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_reviews_influencer_id ON public.reviews(influencer_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
