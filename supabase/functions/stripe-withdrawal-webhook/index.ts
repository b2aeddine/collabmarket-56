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
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Verify webhook signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log('Webhook event received:', event.type);

    // Initialize Supabase
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case 'payout.paid':
        await handlePayoutPaid(event.data.object, supabaseService);
        break;
      case 'payout.failed':
        await handlePayoutFailed(event.data.object, supabaseService);
        break;
      case 'payout.canceled':
        await handlePayoutCanceled(event.data.object, supabaseService);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function handlePayoutPaid(payout: any, supabase: any) {
  console.log('Handling payout.paid:', payout.id);
  
  // Update withdrawal status to completed
  const { error } = await supabase
    .from('withdrawals')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .eq('stripe_payout_id', payout.id);

  if (error) {
    console.error('Error updating withdrawal status:', error);
    throw error;
  }

  console.log('Withdrawal marked as completed:', payout.id);
}

async function handlePayoutFailed(payout: any, supabase: any) {
  console.log('Handling payout.failed:', payout.id);
  
  // Update withdrawal status to failed and add failure reason
  const { error } = await supabase
    .from('withdrawals')
    .update({
      status: 'failed',
      failure_reason: payout.failure_message || 'Payout failed',
    })
    .eq('stripe_payout_id', payout.id);

  if (error) {
    console.error('Error updating withdrawal status:', error);
    throw error;
  }

  // Also update revenue entries back to available
  const { data: withdrawal } = await supabase
    .from('withdrawals')
    .select('influencer_id, amount')
    .eq('stripe_payout_id', payout.id)
    .single();

  if (withdrawal) {
    // Find revenues that were marked as withdrawn for this amount
    const { data: revenues } = await supabase
      .from('revenues')
      .select('id, net_amount')
      .eq('influencer_id', withdrawal.influencer_id)
      .eq('status', 'withdrawn')
      .order('created_at', { ascending: true });

    if (revenues) {
      let remainingAmount = withdrawal.amount;
      const idsToRevert: string[] = [];
      
      for (const revenue of revenues) {
        if (remainingAmount <= 0) break;
        idsToRevert.push(revenue.id);
        remainingAmount -= revenue.net_amount;
      }

      // Revert revenue status back to available
      await supabase
        .from('revenues')
        .update({ status: 'available' })
        .in('id', idsToRevert);
    }
  }

  console.log('Withdrawal marked as failed:', payout.id);
}

async function handlePayoutCanceled(payout: any, supabase: any) {
  console.log('Handling payout.canceled:', payout.id);
  
  // Similar to failed, but with different status
  await handlePayoutFailed(payout, supabase);
  
  // Update to canceled status specifically
  await supabase
    .from('withdrawals')
    .update({ status: 'cancelled' })
    .eq('stripe_payout_id', payout.id);
}