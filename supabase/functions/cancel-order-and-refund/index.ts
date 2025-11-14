import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    console.log('Cancelling order and refunding:', orderId);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer la commande
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*, stripe_payment_intent_id, stripe_session_id')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    console.log('Order found:', order);

    // Annuler le payment intent si existe
    if (order.stripe_payment_intent_id) {
      try {
        console.log('Cancelling payment intent:', order.stripe_payment_intent_id);
        await stripe.paymentIntents.cancel(order.stripe_payment_intent_id);
        console.log('Payment intent cancelled successfully');
      } catch (stripeError: any) {
        // Si le paiement a déjà été capturé, on le rembourse
        if (stripeError.code === 'payment_intent_unexpected_state') {
          console.log('Payment already captured, creating refund instead');
          await stripe.refunds.create({
            payment_intent: order.stripe_payment_intent_id,
          });
          console.log('Refund created successfully');
        } else {
          console.error('Stripe error:', stripeError);
          throw stripeError;
        }
      }
    }

    // Mettre à jour la commande
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: 'annulée',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order cancelled successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Commande annulée et remboursement effectué'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in cancel-order-and-refund:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
