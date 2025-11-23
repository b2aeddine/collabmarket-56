import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('✅ Checking Stripe account status...');

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

    // D'abord, nettoyer les comptes en double et récupérer le bon compte
    console.log('Checking for existing Stripe accounts for user:', user.id);
    
    // Récupérer tous les comptes Stripe pour cet utilisateur
    const { data: allStripeAccounts } = await supabaseService
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    let stripeAccountToUse = null;

    if (!allStripeAccounts || allStripeAccounts.length === 0) {
      console.log('No Stripe accounts found in database, searching Stripe...');
      
      // Rechercher dans Stripe par email
      try {
        const accounts = await stripe.accounts.list({ limit: 100 });
        const matchingAccount = accounts.data.find(acc => acc.email === user.email);
        
        if (matchingAccount) {
          console.log('Found Stripe account by email:', matchingAccount.id);
          
          // Créer l'entrée dans notre base
          const { data: newAccount, error: insertError } = await supabaseService
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
            })
            .select()
            .single();
          
          if (insertError) {
            console.error('Error inserting account:', insertError);
          } else {
            stripeAccountToUse = newAccount;
            console.log('✅ Successfully created new Stripe account entry');
          }
        }
      } catch (err) {
        console.error('Error searching Stripe:', err);
      }
    } else {
      // Prendre le compte le plus récent
      stripeAccountToUse = allStripeAccounts[0];
      console.log('Using existing Stripe account:', stripeAccountToUse.stripe_account_id);
      
      // Si on a plusieurs comptes, supprimer les anciens
      if (allStripeAccounts.length > 1) {
        console.log('Cleaning up duplicate accounts...');
        const accountsToDelete = allStripeAccounts.slice(1);
        for (const accountToDelete of accountsToDelete) {
          await supabaseService
            .from('stripe_accounts')
            .delete()
            .eq('id', accountToDelete.id);
        }
      }
    }

    if (!stripeAccountToUse?.stripe_account_id) {
      return new Response(JSON.stringify({ 
        hasAccount: false,
        needsOnboarding: true,
        stripe_status: 'incomplete'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('Retrieving Stripe account:', stripeAccountToUse.stripe_account_id);
    
    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(stripeAccountToUse.stripe_account_id);
    
    // Check if account has external accounts (bank accounts)
    const externalAccounts = await stripe.accounts.listExternalAccounts(
      stripeAccountToUse.stripe_account_id,
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

    // Synchroniser le compte bancaire externe dans notre base de données
    if (hasExternalAccount && externalAccount) {
      console.log('Synchronizing external bank account to local database...');
      
      // Vérifier si le compte bancaire existe déjà dans notre base
      const { data: existingBankAccount } = await supabaseService
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('iban', `*****${externalAccount.last4}`)
        .single();

      if (!existingBankAccount && externalAccount.last4 && externalAccount.bank_name) {
        // Créer une entrée dans notre table bank_accounts
        const { error: bankAccountError } = await supabaseService
          .from('bank_accounts')
          .insert({
            user_id: user.id,
            iban: `*****${externalAccount.last4}`, // IBAN partiel pour des raisons de sécurité
            bic: '', // Pas disponible depuis Stripe
            account_holder: account.business_profile?.name || account.individual?.first_name + ' ' + account.individual?.last_name || 'Compte Stripe',
            bank_name: externalAccount.bank_name,
            is_default: true,
            is_active: true
          });

        if (bankAccountError) {
          console.error('Error creating bank account entry:', bankAccountError);
        } else {
          console.log('✅ Bank account synchronized to local database');
        }
      }
    }

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
      stripe_connect_account_id: stripeAccountToUse.stripe_account_id,
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
      accountId: stripeAccountToUse.stripe_account_id,
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