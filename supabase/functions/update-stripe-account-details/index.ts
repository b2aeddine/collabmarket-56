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
    console.log('Updating Stripe account details...');
    
    const { bankAccount } = await req.json();
    console.log('Bank account data:', bankAccount);

    if (!bankAccount || !bankAccount.iban || !bankAccount.accountHolder) {
      throw new Error('IBAN et nom du titulaire requis');
    }

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

    // Get user's Stripe account
    const { data: stripeAccountData } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stripeAccountData?.stripe_account_id) {
      throw new Error('Aucun compte Stripe Connect trouvé');
    }

    const stripeAccountId = stripeAccountData.stripe_account_id;

    // Remove any existing external accounts first
    const existingAccounts = await stripe.accounts.listExternalAccounts(
      stripeAccountId,
      { object: 'bank_account' }
    );

    for (const account of existingAccounts.data) {
      await stripe.accounts.deleteExternalAccount(stripeAccountId, account.id);
    }

    // Add new bank account
    const externalAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
      external_account: {
        object: 'bank_account',
        country: bankAccount.country || 'FR',
        currency: 'eur',
        account_holder_name: bankAccount.accountHolder,
        account_holder_type: 'individual',
        ...bankAccount.iban.startsWith('FR') ? {
          // For French IBAN
          routing_number: bankAccount.iban.substring(4, 9), // Bank code
          account_number: bankAccount.iban.substring(9), // Account number
        } : {
          // For other IBANs
          account_number: bankAccount.iban,
        }
      }
    });

    // Update our database
    await supabaseService
      .from('stripe_accounts')
      .update({
        external_account_last4: externalAccount.last4,
        external_account_bank_name: externalAccount.bank_name,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    console.log('External account created:', externalAccount.id);

    return new Response(JSON.stringify({ 
      success: true,
      externalAccountId: externalAccount.id,
      last4: externalAccount.last4,
      bankName: externalAccount.bank_name
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error updating Stripe account details:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});