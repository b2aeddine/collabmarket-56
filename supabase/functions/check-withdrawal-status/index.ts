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
    const { withdrawalId } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get withdrawal details
    const { data: withdrawal } = await supabaseService
      .from('withdrawals')
      .select('*, stripe_accounts(stripe_account_id)')
      .eq('id', withdrawalId)
      .single();

    if (!withdrawal || !withdrawal.stripe_payout_id) {
      throw new Error('Withdrawal not found');
    }

    // Get payout status from Stripe
    const payout = await stripe.payouts.retrieve(
      withdrawal.stripe_payout_id,
      {
        stripeAccount: withdrawal.stripe_accounts.stripe_account_id,
      }
    );

    // Update withdrawal status based on Stripe payout status
    let newStatus = 'processing';
    if (payout.status === 'paid') {
      newStatus = 'completed';
    } else if (payout.status === 'failed' || payout.status === 'canceled') {
      newStatus = 'failed';
    }

    // Update withdrawal in database
    await supabaseService
      .from('withdrawals')
      .update({
        status: newStatus,
        processed_at: payout.status === 'paid' ? new Date().toISOString() : null,
        failure_reason: payout.failure_message || null,
      })
      .eq('id', withdrawalId);

    return new Response(
      JSON.stringify({ 
        status: newStatus,
        stripeStatus: payout.status,
        arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error checking withdrawal status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});