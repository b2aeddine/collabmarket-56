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
    const { orderId, reason } = await req.json();
    console.log('Canceling payment for order:', orderId, 'reason:', reason);

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

    // Get authenticated user (optional for system-triggered cancellations)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
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

    // Verify order status allows cancellation
    if (!['payment_authorized', 'en_attente_confirmation_influenceur'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // If user-triggered, verify authorization
    if (user && order.influencer_id !== user.id) {
      throw new Error("Unauthorized: You are not the influencer for this order");
    }

    let canceledPaymentIntent = null;

    // Cancel the payment intent if it exists
    if (order.stripe_session_id) {
      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.cancel(
            session.payment_intent as string
          );
          canceledPaymentIntent = paymentIntent.id;
          console.log('Payment intent canceled:', paymentIntent.id);
        }
      } catch (stripeError) {
        console.error('Error canceling payment intent:', stripeError);
        // Continue with order cancellation even if Stripe cancellation fails
      }
    }

    // Update order status
    const newStatus = reason === 'timeout' ? 'annulée' : 'refusée_par_influenceur';
    const { error: updateError } = await supabaseService
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error('Failed to update order status');
    }

    return new Response(JSON.stringify({ 
      success: true,
      canceledPaymentIntent,
      newStatus 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in cancel-payment:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});