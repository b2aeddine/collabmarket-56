-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create portfolio_items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active portfolio items
CREATE POLICY "Anyone can view active portfolio items"
ON public.portfolio_items
FOR SELECT
USING (is_active = true);

-- Policy: Influencers can manage their own portfolio items
CREATE POLICY "Influencers can manage their own portfolio items"
ON public.portfolio_items
FOR ALL
USING (influencer_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_portfolio_influencer ON public.portfolio_items(influencer_id);
CREATE INDEX idx_portfolio_display_order ON public.portfolio_items(display_order);

-- Create updated_at trigger
CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for portfolio images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio bucket
CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

CREATE POLICY "Influencers can upload their own portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Influencers can update their own portfolio images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Influencers can delete their own portfolio images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);