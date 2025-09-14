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
    const { orderId } = await req.json();
    console.log('Processing order completion for:', orderId);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get order and payment info
    const { data: order } = await supabaseService
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order) {
      throw new Error('Order not found');
    }

    console.log('Order found:', order.id, 'Total amount:', order.total_amount);

    let totalAmount: number;
    let platformFee: number;
    let influencerAmount: number;

    // Si l'ordre a une session Stripe, utiliser les données de Stripe
    if (order.stripe_session_id) {
      try {
        console.log('Using Stripe session:', order.stripe_session_id);
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        const paymentIntentId = session.payment_intent as string;

        if (!paymentIntentId) {
          throw new Error('Payment intent not found');
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        totalAmount = paymentIntent.amount;
        platformFee = Math.round(totalAmount * 0.10);
        influencerAmount = totalAmount - platformFee;
      } catch (stripeError) {
        console.warn('Stripe error, falling back to order data:', stripeError);
        // Fallback aux données de la commande
        totalAmount = Math.round(order.total_amount * 100); // Convertir en centimes
        platformFee = Math.round(totalAmount * 0.10);
        influencerAmount = totalAmount - platformFee;
      }
    } else {
      // Utiliser les données de la commande directement
      console.log('No Stripe session, using order data');
      totalAmount = Math.round(order.total_amount * 100); // Convertir en centimes
      platformFee = Math.round(totalAmount * 0.10);
      influencerAmount = totalAmount - platformFee;
    }

    console.log(`Amounts - Total: ${totalAmount}, Platform: ${platformFee}, Influencer: ${influencerAmount}`);

    // Update order status to completed
    const { error: orderError } = await supabaseService
      .from('orders')
      .update({ 
        status: 'terminée',
        date_completed: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (orderError) {
      console.error('Error updating order:', orderError);
      throw orderError;
    }

    // Create revenue record for influencer
    const { error: revenueError } = await supabaseService
      .from('influencer_revenues')
      .insert({
        influencer_id: order.influencer_id,
        order_id: orderId,
        amount: totalAmount / 100, // Convert back to euros
        commission: platformFee / 100,
        net_amount: influencerAmount / 100,
        status: 'available'
      });

    if (revenueError) {
      console.error('Error creating revenue record:', revenueError);
      throw revenueError;
    }

    console.log(`Order ${orderId} completed - Platform fee: ${platformFee/100}€, Influencer: ${influencerAmount/100}€`);

    return new Response(
      JSON.stringify({ 
        success: true,
        platformFee: platformFee / 100,
        influencerAmount: influencerAmount / 100
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error completing order payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});