import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Creating Stripe account link for bank account update...');
    
    const { type = 'account_update' } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    console.log('User authenticated:', user.email);

    // Get user's Stripe account
    const { data: stripeAccountData, error: fetchError } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !stripeAccountData?.stripe_account_id) {
      console.error('No Stripe account found:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Aucun compte Stripe Connect trouvé. Veuillez d\'abord configurer votre compte.',
        code: 'NO_STRIPE_ACCOUNT'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const stripeAccountId = stripeAccountData.stripe_account_id;
    console.log('Found Stripe account:', stripeAccountId);

    // Vérifier le statut du compte
    const account = await stripe.accounts.retrieve(stripeAccountId);
    console.log('Account charges_enabled:', account.charges_enabled);
    console.log('Account details_submitted:', account.details_submitted);

    // Déterminer l'URL de retour
    const origin = req.headers.get('origin') || 'https://preview--collabmarket-56.lovable.app';
    const refreshUrl = `${origin}/onboarding/refresh`;
    const returnUrl = `${origin}/influencer-dashboard`;

    // Créer le lien pour mettre à jour le compte (y compris le compte bancaire)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: type, // 'account_onboarding' ou 'account_update'
      collect: 'currently_due', // Collecter uniquement les informations manquantes
    });

    console.log('Account link created successfully');

    return new Response(JSON.stringify({ 
      url: accountLink.url,
      expiresAt: accountLink.expires_at,
      message: 'Lien créé avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error creating account link:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue',
        code: 'INTERNAL_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
