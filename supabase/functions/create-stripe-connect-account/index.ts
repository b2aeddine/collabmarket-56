
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, Authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Stripe Connect account creation...');
    
    const { country = 'FR', type = 'express' } = await req.json();
    console.log('Request body:', { country, type });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    console.log('Creating Stripe Connect account for user:', user.email);

    // Create Stripe Connect account for individual influencers
    const stripeAccount = await stripe.accounts.create({
      type: type,
      country: country,
      email: user.email,
      business_type: 'individual', // Explicitly set as individual to avoid company info requests
      capabilities: {
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual'
          }
        }
      }
    });

    console.log('Stripe account created:', stripeAccount.id);

    // Get the origin from the request
    const origin = req.headers.get('origin') || 'http://localhost:3000';
    console.log('Origin:', origin);

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${origin}/dashboard?setup=refresh`,
      return_url: `${origin}/dashboard?setup=complete`,
      type: 'account_onboarding',
    });

    console.log('Account link created:', accountLink.url);

    // Save to Supabase with service role
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService
      .from('stripe_accounts')
      .upsert({
        user_id: user.id,
        stripe_account_id: stripeAccount.id,
        account_status: 'pending',
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error saving to Supabase:', insertError);
      throw insertError;
    }

    console.log('Account saved to Supabase successfully');

    const response = {
      accountId: stripeAccount.id,
      onboardingUrl: accountLink.url
    };

    console.log('Returning response:', response);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
