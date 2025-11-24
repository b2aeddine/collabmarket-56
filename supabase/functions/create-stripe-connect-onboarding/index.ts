import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, Authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  let step = 'start';
  try {
    console.log('Starting Stripe Connect onboarding...');
    // Initialize request body
    step = 'parse_body';
    const { country = 'FR', redirectOrigin, refreshPath = '/onboarding/refresh', returnPath = '/influencer-dashboard' } = await req.json();
    console.log('Request body:', { country, redirectOrigin, refreshPath, returnPath });

    // Initialize Stripe
    step = 'init_stripe';
    const secret = Deno.env.get('STRIPE_SECRET_KEY') || '';
    if (!secret) throw new Error('Missing STRIPE_SECRET_KEY');
    const stripe = new Stripe(secret, {
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
      // Create new Stripe Connect Express account for individual influencers
      const stripeAccount = await stripe.accounts.create({
        type: 'express',
        country,
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        settings: {
          payouts: { schedule: { interval: 'manual' } },
        },
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
      refresh_url: `${origin}${refreshPath}`,
      return_url: `${origin}${returnPath}`,
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
    const err = error as { raw?: { message?: string }; message?: string };
    const message = err?.raw?.message || err?.message || (typeof err === 'string' ? err : 'Unknown error');
    const code = err?.raw?.code || err?.code;
    console.error('Error creating Stripe Connect account:', { message, code, step, err });
    return new Response(
      JSON.stringify({ error: message, code, step }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});