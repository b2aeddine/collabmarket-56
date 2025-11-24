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
    console.log('Completing order and paying influencer:', orderId);

    // SECURITY: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized: Missing authentication');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized: Invalid token');
    }

    console.log('Authenticated user:', user.id);

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Récupérer la commande
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    // SECURITY: Verify authorization - only participants can complete
    if (order.merchant_id !== user.id && order.influencer_id !== user.id) {
      console.error('Unauthorized attempt by user', user.id, 'for order with merchant', order.merchant_id, 'and influencer', order.influencer_id);
      throw new Error('Unauthorized: You are not authorized to complete this order');
    }

    console.log('Order found:', order);

    // Capturer le paiement Stripe si disponible
    if (order.stripe_payment_intent_id && !order.payment_captured) {
      try {
        console.log('Capturing payment intent:', order.stripe_payment_intent_id);
        await stripe.paymentIntents.capture(order.stripe_payment_intent_id);
        console.log('Payment captured successfully');
      } catch (stripeError: any) {
        console.error('Stripe capture error:', stripeError);
        // Continue même si la capture échoue
      }
    }

    // Calculer les montants
    const totalAmount = order.total_amount;
    const platformFeePercentage = 0.10; // 10%
    const platformFee = totalAmount * platformFeePercentage;
    const influencerAmount = totalAmount - platformFee;

    // Créer le revenu pour l'influenceur
    const { error: revenueError } = await supabaseClient
      .from('influencer_revenues')
      .insert({
        influencer_id: order.influencer_id,
        order_id: order.id,
        amount: totalAmount,
        commission: platformFee,
        net_amount: influencerAmount,
        status: 'available',
      });

    if (revenueError) {
      console.error('Error creating revenue:', revenueError);
      throw revenueError;
    }

    console.log('Revenue created for influencer');

    // Mettre à jour la commande
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: 'terminée',
        payment_captured: true,
        date_completed: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Commande terminée et paiement effectué à l\'influenceur'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in complete-order-and-pay:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
