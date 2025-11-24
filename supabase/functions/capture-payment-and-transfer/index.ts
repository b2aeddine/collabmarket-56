import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { handleError } from "../_shared/errorHandler.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('unauthorized');
    }

    // Initialize Supabase with service role for auth verification
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseService.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('unauthorized');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get order details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // SECURITY: Verify user authorization - only merchant can capture payment
    if (order.merchant_id !== user.id && order.influencer_id !== user.id) {
      throw new Error('insufficient_permissions');
    }

    if (!order.stripe_payment_intent_id) {
      throw new Error('No payment intent found for this order');
    }

    if (order.payment_captured) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Payment already captured'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);

    if (paymentIntent.status !== 'requires_capture') {
      throw new Error(`Payment cannot be captured. Status: ${paymentIntent.status}`);
    }

    // Capture the payment
    const capturedPayment = await stripe.paymentIntents.capture(order.stripe_payment_intent_id);

    // Calculate amounts
    const totalAmount = capturedPayment.amount;
    const platformFee = Math.round(totalAmount * 0.1);
    const influencerAmount = totalAmount - platformFee;

    // Update order status
    const { error: updateError } = await supabaseService
      .from('orders')
      .update({
        payment_captured: true,
        payment_captured_at: new Date().toISOString(),
        status: 'en_cours',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error('Failed to update order status');
    }

    // Check if revenue already exists (avoid duplicates)
    const { data: existingRevenue } = await supabaseService
      .from('influencer_revenues')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (!existingRevenue) {
      // Create revenue record ONLY if it doesn't exist
      const { error: revenueError } = await supabaseService
        .from('influencer_revenues')
        .insert({
          influencer_id: order.influencer_id,
          order_id: orderId,
          amount: totalAmount / 100, // Convert to euros
          commission: platformFee / 100,
          net_amount: influencerAmount / 100,
          status: 'available',
          created_at: new Date().toISOString()
        });

      if (revenueError) {
        throw revenueError;
      }
    }

    // Create transfer record
    const { error: transferError } = await supabaseService
      .from('stripe_transfers')
      .insert({
        order_id: orderId,
        influencer_id: order.influencer_id,
        merchant_id: order.merchant_id,
        stripe_payment_intent_id: capturedPayment.id,
        amount: totalAmount,
        platform_fee: platformFee,
        influencer_amount: influencerAmount,
        currency: 'eur',
        status: 'completed',
        transferred_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (transferError) {
      throw transferError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      capturedAmount: totalAmount,
      platformFee: platformFee,
      influencerAmount: influencerAmount,
      transferId: capturedPayment.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return handleError(error, 'capture-payment-and-transfer');
  }
});