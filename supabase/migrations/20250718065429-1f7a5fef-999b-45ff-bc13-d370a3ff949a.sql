-- Add Stripe Identity fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_identity_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_identity_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS stripe_identity_url TEXT,
ADD COLUMN IF NOT EXISTS identity_status TEXT DEFAULT 'pending' CHECK (identity_status IN ('pending', 'verified', 'rejected', 'processing'));

-- Create identity_documents table for storing verification documents
CREATE TABLE IF NOT EXISTS public.identity_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('identity_card', 'passport', 'driving_license', 'residence_permit')),
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'processing')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on identity_documents
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for identity_documents
CREATE POLICY "Users can view their own identity documents"
ON public.identity_documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own identity documents"
ON public.identity_documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own identity documents"
ON public.identity_documents
FOR UPDATE
USING (auth.uid() = user_id);

-- Admin users can view and modify all identity documents
CREATE POLICY "Admins can view all identity documents"
ON public.identity_documents
FOR SELECT
USING (is_current_user_admin());

CREATE POLICY "Admins can update all identity documents"
ON public.identity_documents
FOR UPDATE
USING (is_current_user_admin());

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_identity_documents_updated_at
    BEFORE UPDATE ON public.identity_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();