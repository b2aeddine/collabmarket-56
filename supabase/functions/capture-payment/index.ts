import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    console.log('Capturing payment for order:', orderId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get order details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Verify user is the influencer for this order
    if (order.influencer_id !== user.id) {
      throw new Error("Unauthorized: You are not the influencer for this order");
    }

    // Verify order status
    if (order.status !== 'payment_authorized') {
      throw new Error(`Cannot capture payment for order with status: ${order.status}`);
    }

    // Get payment intent from Stripe session
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
    
    if (!session.payment_intent) {
      throw new Error("No payment intent found for this session");
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(
      session.payment_intent as string
    );

    console.log('Payment captured successfully:', paymentIntent.id);

    // Update order status
    const { error: updateError } = await supabaseService
      .from('orders')
      .update({
        status: 'en_cours',
        date_accepted: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Failed to update order status');
    }

    // Create revenue record for the influencer
    const { error: revenueError } = await supabaseService
      .from('influencer_revenues')
      .insert({
        influencer_id: order.influencer_id,
        order_id: orderId,
        amount: order.total_amount,
        commission: order.total_amount * (order.commission_rate / 100),
        net_amount: order.net_amount,
        status: 'pending', // Will become 'available' when order is completed
      });

    if (revenueError) {
      console.error('Error creating revenue record:', revenueError);
      // Don't throw here as payment is already captured
    }

    return new Response(JSON.stringify({ 
      success: true,
      paymentIntentId: paymentIntent.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in capture-payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});