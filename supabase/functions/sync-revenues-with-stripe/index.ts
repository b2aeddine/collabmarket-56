import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  console.log('🔄 Starting revenue synchronization with Stripe...');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get all orders that claim to be paid/completed
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_amount, net_amount, stripe_payment_intent_id, payment_captured, influencer_id, merchant_id')
      .in('status', ['paid', 'terminée', 'en_cours']);

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`);
    }

    console.log(`📊 Found ${orders?.length || 0} orders marked as paid/completed`);

    let verified = 0;
    let invalidated = 0;
    let revenuesCreated = 0;
    let revenuesDeleted = 0;

    for (const order of orders || []) {
      try {
        // Check if this order has a real Stripe payment
        if (!order.stripe_payment_intent_id) {
          console.log(`❌ Order ${order.id}: No Stripe payment intent - INVALID`);
          
          // Delete fake revenues for this order
          await supabase
            .from('influencer_revenues')
            .delete()
            .eq('order_id', order.id);
          
          await supabase
            .from('revenues')
            .delete()
            .eq('order_id', order.id);
          
          revenuesDeleted++;
          
          // Update order status to reflect reality
          await supabase
            .from('orders')
            .update({ 
              status: 'pending',
              payment_captured: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);
          
          invalidated++;
          continue;
        }

        // Verify with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        
        if (paymentIntent.status === 'succeeded' && paymentIntent.amount_received > 0) {
          console.log(`✅ Order ${order.id}: Verified with Stripe (${paymentIntent.amount_received / 100}€)`);
          
          // Check if revenue exists
          const { data: existingRevenue } = await supabase
            .from('influencer_revenues')
            .select('id')
            .eq('order_id', order.id)
            .maybeSingle();

          if (!existingRevenue && order.payment_captured) {
            // Create missing revenue for verified payment
            const totalAmount = paymentIntent.amount_received / 100;
            const commission = totalAmount * 0.1;
            const netAmount = totalAmount - commission;
            
            await supabase
              .from('influencer_revenues')
              .insert({
                influencer_id: order.influencer_id,
                order_id: order.id,
                amount: totalAmount,
                commission: commission,
                net_amount: netAmount,
                status: 'available',
              });
            
            revenuesCreated++;
            console.log(`💰 Created revenue for verified order ${order.id}`);
          }
          
          verified++;
        } else {
          console.log(`⚠️ Order ${order.id}: Payment not succeeded in Stripe (status: ${paymentIntent.status})`);
          
          // Delete incorrect revenues
          await supabase
            .from('influencer_revenues')
            .delete()
            .eq('order_id', order.id);
          
          await supabase
            .from('revenues')
            .delete()
            .eq('order_id', order.id);
          
          revenuesDeleted++;
          invalidated++;
        }

      } catch (stripeError) {
        console.error(`Error verifying order ${order.id} with Stripe:`, stripeError);
        
        // If payment intent not found in Stripe, it's invalid
        if (stripeError.code === 'resource_missing') {
          console.log(`🗑️ Order ${order.id}: Payment intent not found in Stripe - deleting revenues`);
          
          await supabase
            .from('influencer_revenues')
            .delete()
            .eq('order_id', order.id);
          
          await supabase
            .from('revenues')
            .delete()
            .eq('order_id', order.id);
          
          revenuesDeleted++;
          invalidated++;
        }
      }
    }

    console.log(`✅ Sync complete: ${verified} verified, ${invalidated} invalidated, ${revenuesCreated} created, ${revenuesDeleted} deleted`);

    return new Response(JSON.stringify({ 
      success: true,
      verified,
      invalidated,
      revenuesCreated,
      revenuesDeleted,
      message: `Synchronization complete: ${verified} orders verified with Stripe, ${invalidated} invalid orders found`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Sync error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
