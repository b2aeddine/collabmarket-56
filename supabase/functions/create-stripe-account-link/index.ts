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
    console.log('🔗 Creating Stripe access link...');
    
    const { type = 'dashboard' } = await req.json();

    // Vérifier la présence de la clé Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found');
      return new Response(JSON.stringify({ 
        error: 'Configuration Stripe manquante',
        code: 'MISSING_STRIPE_KEY'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: 'Non authentifié',
        code: 'UNAUTHORIZED'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    console.log('✅ User authenticated:', user.email);

    // Get user's Stripe account
    const { data: stripeAccountData, error: fetchError } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !stripeAccountData?.stripe_account_id) {
      console.error('❌ No Stripe account found:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Aucun compte Stripe Connect trouvé. Veuillez d\'abord configurer votre compte.',
        code: 'NO_STRIPE_ACCOUNT'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const stripeAccountId = stripeAccountData.stripe_account_id;
    console.log('📋 Found Stripe account:', stripeAccountId);

    // Récupérer les détails du compte depuis Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);
    console.log('📊 Account status:', {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
      currently_due: account.requirements?.currently_due?.length || 0
    });

    // Déterminer l'URL de retour
    const origin = req.headers.get('origin') || 'https://preview--collabmarket-56.lovable.app';
    const refreshUrl = `${origin}/onboarding/refresh`;
    const returnUrl = `${origin}/influencer-dashboard`;

    // SI le compte est complètement configuré, utiliser le Login Link (Express Dashboard)
    if (account.charges_enabled && account.details_submitted && type === 'dashboard') {
      console.log('✅ Account is complete, creating login link for Express Dashboard');
      
      try {
        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
        
        console.log('✅ Login link created successfully');
        
        return new Response(JSON.stringify({ 
          url: loginLink.url,
          type: 'login_link',
          message: 'Accès au tableau de bord Stripe Express'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (loginError: unknown) {
        const errorMessage = loginError instanceof Error ? loginError.message : 'Unknown error';
        console.error('❌ Error creating login link:', errorMessage);
        // Si le login link échoue, on essaie account_update
        console.log('⚠️ Falling back to account_update link');
      }
    }

    // Sinon, utiliser Account Links pour l'onboarding ou la mise à jour
    let linkType = type;
    
    // Déterminer automatiquement le bon type de lien
    if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
      console.log('⚠️ Requirements pending, using account_onboarding');
      linkType = 'account_onboarding';
    } else if (!account.charges_enabled || !account.details_submitted) {
      console.log('⚠️ Account incomplete, using account_onboarding');
      linkType = 'account_onboarding';
    } else {
      // Compte complet, utiliser account_update
      linkType = 'account_update';
    }

    console.log(`🔄 Creating ${linkType} link...`);

    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: linkType,
        collect: 'currently_due',
      });

      console.log('✅ Account link created successfully');

      return new Response(JSON.stringify({ 
        url: accountLink.url,
        expiresAt: accountLink.expires_at,
        type: linkType,
        message: 'Lien créé avec succès'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (linkError: unknown) {
      // Si account_update échoue, réessayer avec account_onboarding
      if (linkError.raw?.param === 'type' && linkType === 'account_update') {
        console.log('🔄 account_update failed, retrying with account_onboarding');
        
        const retryAccountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: refreshUrl,
          return_url: returnUrl,
          type: 'account_onboarding',
          collect: 'currently_due',
        });

        console.log('✅ Account link created with account_onboarding');

        return new Response(JSON.stringify({ 
          url: retryAccountLink.url,
          expiresAt: retryAccountLink.expires_at,
          type: 'account_onboarding',
          message: 'Lien créé avec succès'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      throw linkError;
    }

  } catch (error: unknown) {
    console.error('❌ Error:', {
      message: error.message,
      type: error.type,
      code: error.code
    });
    
    let errorMessage = error.message || 'Une erreur est survenue';
    let errorCode = error.code || 'INTERNAL_ERROR';
    
    if (error.type === 'StripeInvalidRequestError') {
      errorMessage = 'Impossible de créer le lien Stripe. Votre compte nécessite une reconfiguration.';
      errorCode = 'STRIPE_INVALID_REQUEST';
    } else if (error.statusCode === 401) {
      errorMessage = 'Authentification Stripe échouée.';
      errorCode = 'STRIPE_AUTH_ERROR';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
        details: error.raw?.message || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
