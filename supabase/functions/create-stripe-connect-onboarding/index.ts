import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // Include both lowercase and uppercase to satisfy strict CORS checks in some environments
  'Access-Control-Allow-Headers': 'authorization, Authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Stripe Connect onboarding...');
    
    const { country = 'FR', redirectOrigin } = await req.json();
    console.log('Request body:', { country, redirectOrigin });

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
      console.error('Missing Authorization header');
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
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    console.log('Creating Stripe Connect account for user:', user.email);

    // Check if user already has a Stripe account
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: existingAccount } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    let stripeAccountId;

    if (existingAccount?.stripe_account_id) {
      stripeAccountId = existingAccount.stripe_account_id;
      console.log('Using existing Stripe account:', stripeAccountId);
    } else {
      // Create new Stripe Connect Custom account for individual influencers
      const stripeAccount = await stripe.accounts.create({
        type: 'custom',
        country,
        email: user.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        }
      });

      stripeAccountId = stripeAccount.id;
      console.log('New Stripe account created:', stripeAccountId);

      // Save to Supabase
      const { error: insertError } = await supabaseService
        .from('stripe_accounts')
        .upsert({
          user_id: user.id,
          stripe_account_id: stripeAccountId,
          account_status: 'pending',
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false,
          onboarding_completed: false,
          country: country,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error saving to Supabase:', insertError);
        throw insertError;
      }
    }

    // Determine the origin for redirects
    const originHeader = req.headers.get('origin') || req.headers.get('referer') || '';
    const derivedOrigin = originHeader ? (() => { try { return new URL(originHeader).origin; } catch { return originHeader; } })() : '';
    const origin = redirectOrigin || derivedOrigin || 'https://preview--collabmarket-43.lovable.app';

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/influencer-dashboard?setup=refresh`,
      return_url: `${origin}/influencer-dashboard?setup=complete`,
      type: 'account_onboarding',
    });

    console.log('Account link created:', accountLink.url);

    const response = {
      accountId: stripeAccountId,
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