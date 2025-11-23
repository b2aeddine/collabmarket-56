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
    console.log('Bank account data received');

    // Validation des données
    if (!bankAccount || !bankAccount.iban || !bankAccount.accountHolder) {
      return new Response(JSON.stringify({ 
        error: 'IBAN et nom du titulaire requis',
        code: 'MISSING_FIELDS'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Nettoyer l'IBAN (retirer les espaces)
    const cleanedIban = bankAccount.iban.replace(/\s/g, '').toUpperCase();
    
    // Validation de base de l'IBAN
    if (cleanedIban.length < 15 || cleanedIban.length > 34) {
      return new Response(JSON.stringify({ 
        error: 'Format IBAN invalide. L\'IBAN doit contenir entre 15 et 34 caractères.',
        code: 'INVALID_IBAN_LENGTH'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
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
      return new Response(JSON.stringify({ 
        error: 'Aucun compte Stripe Connect trouvé. Veuillez d\'abord configurer votre compte.',
        code: 'NO_STRIPE_ACCOUNT'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const stripeAccountId = stripeAccountData.stripe_account_id;

    // Vérifier le statut du compte Stripe
    const stripeAccount = await stripe.accounts.retrieve(stripeAccountId);
    
    if (!stripeAccount.charges_enabled) {
      return new Response(JSON.stringify({ 
        error: 'Votre compte Stripe n\'est pas encore activé. Veuillez finaliser votre configuration.',
        code: 'ACCOUNT_NOT_ACTIVE',
        requiresOnboarding: !stripeAccount.details_submitted
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Supprimer les comptes bancaires existants
    try {
      const existingAccounts = await stripe.accounts.listExternalAccounts(
        stripeAccountId,
        { object: 'bank_account', limit: 100 }
      );

      for (const account of existingAccounts.data) {
        console.log(`Removing existing bank account: ${account.id}`);
        await stripe.accounts.deleteExternalAccount(stripeAccountId, account.id);
      }
    } catch (error) {
      console.error('Error removing existing accounts:', error);
      // Continue même si la suppression échoue
    }

    // Déterminer le pays de l'IBAN
    const country = cleanedIban.substring(0, 2);
    
    // Créer le nouveau compte bancaire externe
    let externalAccount;
    try {
      externalAccount = await stripe.accounts.createExternalAccount(stripeAccountId, {
        external_account: {
          object: 'bank_account',
          country: country,
          currency: 'eur',
          account_holder_name: bankAccount.accountHolder,
          account_holder_type: 'individual',
          account_number: cleanedIban,
        }
      });
      
      console.log('External account created successfully:', externalAccount.id);
    } catch (stripeError: any) {
      console.error('Stripe error creating external account:', stripeError);
      
      // Traduire les erreurs Stripe courantes
      let errorMessage = 'Erreur lors de l\'ajout du compte bancaire';
      let errorCode = 'STRIPE_ERROR';
      
      if (stripeError.code === 'bank_account_unusable') {
        errorMessage = 'Ce compte bancaire ne peut pas être utilisé. Veuillez vérifier vos informations.';
        errorCode = 'BANK_ACCOUNT_UNUSABLE';
      } else if (stripeError.code === 'bank_account_declined') {
        errorMessage = 'Ce compte bancaire a été refusé par Stripe. Veuillez contacter votre banque.';
        errorCode = 'BANK_ACCOUNT_DECLINED';
      } else if (stripeError.code === 'invalid_bank_account_iban') {
        errorMessage = 'L\'IBAN fourni n\'est pas valide. Veuillez vérifier le format.';
        errorCode = 'INVALID_IBAN';
      } else if (stripeError.code === 'bank_account_exists') {
        errorMessage = 'Ce compte bancaire est déjà associé à un autre compte Stripe.';
        errorCode = 'BANK_ACCOUNT_EXISTS';
      } else if (stripeError.message) {
        errorMessage = stripeError.message;
      }
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        code: errorCode,
        stripeCode: stripeError.code
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Mettre à jour la base de données
    const { error: dbError } = await supabaseService
      .from('stripe_accounts')
      .update({
        external_account_last4: externalAccount.last4,
        external_account_bank_name: externalAccount.bank_name || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Error updating database:', dbError);
      // Ne pas bloquer si la mise à jour DB échoue
    }

    // Mettre à jour aussi le profil
    await supabaseService
      .from('profiles')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    console.log('Bank account updated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      externalAccountId: externalAccount.id,
      last4: externalAccount.last4,
      bankName: externalAccount.bank_name || 'Compte bancaire',
      country: country,
      message: 'Compte bancaire mis à jour avec succès'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error updating Stripe account details:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Une erreur est survenue lors de la mise à jour',
        code: 'INTERNAL_ERROR'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});