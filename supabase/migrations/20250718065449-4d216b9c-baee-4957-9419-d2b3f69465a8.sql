-- Add Stripe Identity fields to profiles table if they don't exist
DO $$
BEGIN
    -- Add stripe_identity_session_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_identity_session_id') THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_identity_session_id TEXT;
    END IF;
    
    -- Add stripe_identity_status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_identity_status') THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_identity_status TEXT DEFAULT 'not_started';
    END IF;
    
    -- Add stripe_identity_url if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_identity_url') THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_identity_url TEXT;
    END IF;
END $$;