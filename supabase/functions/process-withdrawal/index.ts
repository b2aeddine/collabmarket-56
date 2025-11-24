
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateRequest, processWithdrawalSchema } from "../_shared/validation.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const { amount } = await validateRequest(req, processWithdrawalSchema);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user's Stripe Connect account
    const { data: stripeAccount } = await supabaseService
      .from('stripe_accounts')
      .select('stripe_account_id, payouts_enabled')
      .eq('user_id', user.id)
      .single();

    if (!stripeAccount?.stripe_account_id) {
      throw new Error('Stripe Connect account not found');
    }

    if (!stripeAccount.payouts_enabled) {
      throw new Error('Payouts not enabled for this account');
    }

    // Check available balance
    const availableBalance = await supabaseService.rpc('get_available_balance', { 
      user_id: user.id 
    });

    if (!availableBalance.data || availableBalance.data < amount) {
      throw new Error('Insufficient balance');
    }

    // Create payout via Stripe
    const payout = await stripe.payouts.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      method: 'standard', // Standard transfer (1-2 business days)
    }, {
      stripeAccount: stripeAccount.stripe_account_id,
    });

    console.log('Stripe payout created:', payout);

    // Record withdrawal
    const { data: withdrawal } = await supabaseService
      .from('withdrawals')
      .insert({
        influencer_id: user.id,
        amount: amount,
        status: 'processing',
        stripe_payout_id: payout.id,
      })
      .select()
      .single();

    // Get specific revenue entries to mark as withdrawn (up to the withdrawal amount)
    const { data: revenueEntries } = await supabaseService
      .from('revenues')
      .select('id, net_amount')
      .eq('influencer_id', user.id)
      .eq('status', 'available')
      .order('created_at', { ascending: true });

    if (revenueEntries) {
      let remainingAmount = amount;
      const idsToUpdate: string[] = [];
      
      for (const revenue of revenueEntries) {
        if (remainingAmount <= 0) break;
        idsToUpdate.push(revenue.id);
        remainingAmount -= revenue.net_amount;
      }

      // Update specific revenue entries
      await supabaseService
        .from('revenues')
        .update({ status: 'withdrawn' })
        .in('id', idsToUpdate);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        withdrawalId: withdrawal.id,
        payoutId: payout.id,
        amount: amount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
