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
    console.log('Account details:', {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
      currently_due: account.requirements?.currently_due?.length || 0,
      eventually_due: account.requirements?.eventually_due?.length || 0
    });

    // Déterminer l'URL de retour
    const origin = req.headers.get('origin') || 'https://preview--collabmarket-56.lovable.app';
    const refreshUrl = `${origin}/onboarding/refresh`;
    const returnUrl = `${origin}/influencer-dashboard`;

    // Déterminer automatiquement le type de lien approprié
    // Si le compte a des requirements en attente ou n'est pas complètement configuré, utiliser account_onboarding
    // Sinon, tenter account_update
    let linkType = type;
    
    // Si des informations sont requises ou si l'onboarding n'est pas terminé, forcer account_onboarding
    if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
      console.log('Requirements pending, using account_onboarding instead of account_update');
      linkType = 'account_onboarding';
    } else if (!account.charges_enabled || !account.payouts_enabled) {
      console.log('Account not fully enabled, using account_onboarding');
      linkType = 'account_onboarding';
    }

    console.log(`Creating account link with type: ${linkType}`);

    // Créer le lien pour mettre à jour le compte (y compris le compte bancaire)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: linkType, // Utiliser le type détecté automatiquement
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
    
    // Gérer spécifiquement l'erreur de type de lien invalide
    if (error.raw?.param === 'type' && error.message?.includes('account_onboarding')) {
      console.log('Retrying with account_onboarding type...');
      
      try {
        // Récupérer à nouveau les données du compte
        const { data: retryAccountData } = await supabaseService
          .from('stripe_accounts')
          .select('stripe_account_id')
          .eq('user_id', user.id)
          .single();
        
        if (!retryAccountData?.stripe_account_id) {
          throw new Error('Compte Stripe introuvable');
        }

        const origin = req.headers.get('origin') || 'https://preview--collabmarket-56.lovable.app';
        const refreshUrl = `${origin}/onboarding/refresh`;
        const returnUrl = `${origin}/influencer-dashboard`;
        
        // Réessayer avec account_onboarding
        const accountLink = await stripe.accountLinks.create({
          account: retryAccountData.stripe_account_id,
          refresh_url: refreshUrl,
          return_url: returnUrl,
          type: 'account_onboarding',
          collect: 'currently_due',
        });

        console.log('Account link created successfully with account_onboarding type');

        return new Response(JSON.stringify({ 
          url: accountLink.url,
          expiresAt: accountLink.expires_at,
          message: 'Lien créé avec succès (onboarding requis)'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (retryError: any) {
        console.error('Retry failed:', retryError);
        return new Response(
          JSON.stringify({ 
            error: retryError.message || 'Impossible de créer le lien Stripe',
            code: 'RETRY_FAILED'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors de la création du lien Stripe',
        code: error.code || 'INTERNAL_ERROR',
        details: error.raw?.message || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
