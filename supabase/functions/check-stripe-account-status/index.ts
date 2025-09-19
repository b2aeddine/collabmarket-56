import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking Stripe account status...');

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
    const { data: stripeAccount } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!stripeAccount?.stripe_account_id) {
      console.log('No Stripe account ID found for user, checking if accounts exist in Stripe...');
      
      // Rechercher tous les comptes Stripe qui peuvent correspondre à cet utilisateur
      try {
        const accounts = await stripe.accounts.list({ 
          limit: 100 
        });
        
        // Chercher un compte avec le même email
        const matchingAccount = accounts.data.find(acc => 
          acc.email === user.email
        );
        
        if (matchingAccount) {
          console.log('Found matching Stripe account by email:', matchingAccount.id);
          
          // Créer l'entrée dans notre base de données
          const { error: insertError } = await supabaseService
            .from('stripe_accounts')
            .insert({
              user_id: user.id,
              stripe_account_id: matchingAccount.id,
              account_status: matchingAccount.charges_enabled ? 'active' : 'pending',
              details_submitted: matchingAccount.details_submitted,
              charges_enabled: matchingAccount.charges_enabled,
              payouts_enabled: matchingAccount.payouts_enabled,
              onboarding_completed: matchingAccount.details_submitted && matchingAccount.charges_enabled,
              country: matchingAccount.country || 'FR',
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error inserting account:', insertError);
          } else {
            console.log('✅ Successfully linked existing Stripe account');
            // Continuer avec ce compte
            const account = matchingAccount;
            const stripeAccountIdToUse = matchingAccount.id;
    
            // Get external accounts for the linked account
            const externalAccounts = await stripe.accounts.listExternalAccounts(
              stripeAccountIdToUse,
              { object: 'bank_account' }
            );

            const hasExternalAccount = externalAccounts.data.length > 0;
            const externalAccount = hasExternalAccount ? externalAccounts.data[0] : null;
            
            // Continue with the rest of the logic using the linked account
            const isComplete = account.charges_enabled && account.details_submitted;
            const stripeStatus = isComplete ? 'complete' : 'incomplete';
    
    console.log('Stripe account status:', {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      final_status: stripeStatus
    });

    // Update our database with current status
    const updateData = {
      account_status: account.charges_enabled ? 'active' : 'pending',
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_completed: isComplete,
      capabilities_transfers: account.capabilities?.transfers?.status === 'active',
      capabilities_card_payments: account.capabilities?.card_payments?.status === 'active',
      external_account_last4: externalAccount?.last4 || null,
      external_account_bank_name: externalAccount?.bank_name || null,
      verification_status: account.requirements?.disabled_reason ? 'rejected' : 
                          (account.details_submitted ? 'verified' : 'pending'),
      updated_at: new Date().toISOString()
    };

    await supabaseService
      .from('stripe_accounts')
      .update(updateData)
      .eq('user_id', user.id);

            // Update user profile with exact status
            const profileUpdateData = {
              stripe_connect_status: stripeStatus,
              stripe_connect_account_id: stripeAccountIdToUse,
              is_stripe_connect_active: isComplete,
              updated_at: new Date().toISOString()
            };

    const { error: profileUpdateError } = await supabaseService
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
    } else {
      console.log('✅ Profile updated with Stripe Connect status:', stripeStatus);
    }

            const response = {
              hasAccount: true,
              accountId: stripeAccountIdToUse,
              detailsSubmitted: account.details_submitted,
              chargesEnabled: account.charges_enabled,
              payoutsEnabled: account.payouts_enabled,
              onboardingCompleted: isComplete,
              requirementsNeeded: account.requirements?.currently_due || [],
              hasExternalAccount: hasExternalAccount,
              externalAccountLast4: externalAccount?.last4,
              externalAccountBankName: externalAccount?.bank_name,
              needsOnboarding: !isComplete,
              disabledReason: account.requirements?.disabled_reason,
              verificationStatus: updateData.verification_status,
              stripe_status: stripeStatus
            };

            console.log('Account status response:', response);

            return new Response(JSON.stringify(response), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            });
          }
        }
      } catch (err) {
        console.error('Error searching for Stripe accounts:', err);
      }
      
      // Si aucun compte trouvé, retourner qu'il faut créer un compte
      return new Response(JSON.stringify({ 
        hasAccount: false,
        needsOnboarding: true,
        stripe_status: 'incomplete'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Retrieving Stripe account:', stripeAccount.stripe_account_id);
    
    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id);
    
    // Check if account has external accounts (bank accounts)
    const externalAccounts = await stripe.accounts.listExternalAccounts(
      stripeAccount.stripe_account_id,
      { object: 'bank_account' }
    );

    const hasExternalAccount = externalAccounts.data.length > 0;
    const externalAccount = hasExternalAccount ? externalAccounts.data[0] : null;

    // Déterminer le statut selon les critères exacts
    const isComplete = account.charges_enabled && account.details_submitted;
    const stripeStatus = isComplete ? 'complete' : 'incomplete';
    
    console.log('Stripe account status:', {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      final_status: stripeStatus
    });

    // Update our database with current status
    const updateData = {
      account_status: account.charges_enabled ? 'active' : 'pending',
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      onboarding_completed: isComplete,
      capabilities_transfers: account.capabilities?.transfers?.status === 'active',
      capabilities_card_payments: account.capabilities?.card_payments?.status === 'active',
      external_account_last4: externalAccount?.last4 || null,
      external_account_bank_name: externalAccount?.bank_name || null,
      verification_status: account.requirements?.disabled_reason ? 'rejected' : 
                          (account.details_submitted ? 'verified' : 'pending'),
      updated_at: new Date().toISOString()
    };

    await supabaseService
      .from('stripe_accounts')
      .update(updateData)
      .eq('user_id', user.id);

    // Update the user profile with exact status
    const profileUpdateData = {
      stripe_connect_status: stripeStatus,
      stripe_connect_account_id: stripeAccount.stripe_account_id,
      is_stripe_connect_active: isComplete,
      updated_at: new Date().toISOString()
    };

    const { error: profileUpdateError } = await supabaseService
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
    } else {
      console.log('✅ Profile updated with Stripe Connect status:', stripeStatus);
    }

    const response = {
      hasAccount: true,
      accountId: stripeAccount.stripe_account_id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      onboardingCompleted: isComplete,
      requirementsNeeded: account.requirements?.currently_due || [],
      hasExternalAccount: hasExternalAccount,
      externalAccountLast4: externalAccount?.last4,
      externalAccountBankName: externalAccount?.bank_name,
      needsOnboarding: !isComplete,
      disabledReason: account.requirements?.disabled_reason,
      verificationStatus: updateData.verification_status,
      stripe_status: stripeStatus
    };

    console.log('Account status response:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error checking Stripe account status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});