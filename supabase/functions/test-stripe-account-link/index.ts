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

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] 🧪 TEST: Creating Stripe account link...`);

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ 
        error: 'userId is required in request body'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`[${requestId}] 🧪 TEST: User ID: ${userId}`);

    // Validate Stripe key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error(`[${requestId}] ❌ TEST: STRIPE_SECRET_KEY not found`);
      return new Response(JSON.stringify({ 
        error: 'STRIPE_SECRET_KEY not configured',
        hint: 'Please add STRIPE_SECRET_KEY to Supabase secrets'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log(`[${requestId}] 🧪 TEST: Stripe key format: ${stripeSecretKey.substring(0, 15)}...`);

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get Stripe account from database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: stripeAccountData, error: fetchError } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error(`[${requestId}] ❌ TEST: Database error:`, fetchError);
      return new Response(JSON.stringify({ 
        error: 'Database error',
        details: fetchError
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!stripeAccountData?.stripe_account_id) {
      console.log(`[${requestId}] ⚠️ TEST: No Stripe account found for user`);
      return new Response(JSON.stringify({
        error: 'No Stripe account found for this user',
        hint: 'User needs to complete Stripe Connect onboarding first'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const stripeAccountId = stripeAccountData.stripe_account_id;
    console.log(`[${requestId}] 🧪 TEST: Stripe account ID: ${stripeAccountId}`);

    // Retrieve account from Stripe
    console.log(`[${requestId}] 🧪 TEST: Retrieving account from Stripe API...`);
    const account = await stripe.accounts.retrieve(stripeAccountId);
    
    console.log(`[${requestId}] 🧪 TEST: Account status:`, {
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
      requirements_due: account.requirements?.currently_due?.length || 0
    });

    // Determine link type
    let linkType = 'account_onboarding';
    let shouldUseLoginLink = false;

    if (account.charges_enabled && account.details_submitted && 
        (!account.requirements?.currently_due || account.requirements.currently_due.length === 0)) {
      shouldUseLoginLink = true;
      console.log(`[${requestId}] 🧪 TEST: Account fully configured, will try Login Link`);
    } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
      linkType = 'account_onboarding';
      console.log(`[${requestId}] 🧪 TEST: Requirements pending, using account_onboarding`);
    } else if (account.details_submitted) {
      linkType = 'account_update';
      console.log(`[${requestId}] 🧪 TEST: Details submitted, using account_update`);
    }

    const origin = req.headers.get('origin') || 'https://preview--collabmarket-56.lovable.app';
    const refreshUrl = `${origin}/onboarding/refresh`;
    const returnUrl = `${origin}/influencer-dashboard`;

    let link = null;
    let linkMethod = null;

    // Try Login Link first for complete accounts
    if (shouldUseLoginLink) {
      try {
        console.log(`[${requestId}] 🧪 TEST: Creating Login Link...`);
        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
        link = loginLink.url;
        linkMethod = 'login_link';
        console.log(`[${requestId}] ✅ TEST: Login Link created successfully`);
      } catch (loginError: any) {
        console.error(`[${requestId}] ⚠️ TEST: Login Link failed:`, loginError.message);
        shouldUseLoginLink = false;
      }
    }

    // Fallback to Account Link
    if (!link) {
      console.log(`[${requestId}] 🧪 TEST: Creating Account Link (${linkType})...`);
      try {
        const accountLink = await stripe.accountLinks.create({
          account: stripeAccountId,
          refresh_url: refreshUrl,
          return_url: returnUrl,
          type: linkType,
          collect: 'currently_due',
        });
        link = accountLink.url;
        linkMethod = linkType;
        console.log(`[${requestId}] ✅ TEST: Account Link created successfully`);
      } catch (linkError: any) {
        // If account_update fails, retry with account_onboarding
        if (linkError.raw?.param === 'type' && linkType === 'account_update') {
          console.log(`[${requestId}] 🧪 TEST: Retrying with account_onboarding...`);
          const retryAccountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
            collect: 'currently_due',
          });
          link = retryAccountLink.url;
          linkMethod = 'account_onboarding';
          console.log(`[${requestId}] ✅ TEST: Account Link created with retry`);
        } else {
          throw linkError;
        }
      }
    }

    const response = {
      success: true,
      url: link,
      method: linkMethod,
      accountId: stripeAccountId,
      accountStatus: {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements_due: account.requirements?.currently_due || []
      },
      redirectUrls: {
        refresh: refreshUrl,
        return: returnUrl
      },
      timestamp: new Date().toISOString()
    };

    console.log(`[${requestId}] ✅ TEST: Response:`, response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[${requestId}] ❌ TEST: Error:`, {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error.raw
    });

    return new Response(JSON.stringify({
      error: error.message || 'Unknown error',
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      details: error.raw?.message || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
