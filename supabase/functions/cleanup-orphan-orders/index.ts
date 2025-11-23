import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  console.log('🧹 Cleanup orphan orders called');
  
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

    // Get all pending orders older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: pendingOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, stripe_session_id, created_at')
      .eq('status', 'pending')
      .lt('created_at', oneHourAgo);

    if (fetchError) {
      console.error('Error fetching pending orders:', fetchError);
      throw fetchError;
    }

    if (!pendingOrders || pendingOrders.length === 0) {
      console.log('✅ No orphan orders found');
      return new Response(JSON.stringify({ 
        message: 'No orphan orders found',
        cleaned: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`🔍 Found ${pendingOrders.length} pending orders to check`);

    let cleaned = 0;
    let kept = 0;

    for (const order of pendingOrders) {
      if (!order.stripe_session_id) {
        // Orders without session ID should be deleted
        console.log(`🗑️ Deleting order ${order.id} (no session ID)`);
        await supabase.from('orders').delete().eq('id', order.id);
        cleaned++;
        continue;
      }

      try {
        // Check Stripe session status
        const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
        
        if (session.status === 'expired' || session.status === 'complete') {
          if (session.status === 'expired') {
            console.log(`🗑️ Deleting expired order ${order.id}`);
            await supabase.from('orders').delete().eq('id', order.id);
            cleaned++;
          } else if (session.status === 'complete') {
            // Session is complete but order is still pending - update it
            console.log(`✅ Updating completed order ${order.id} to paid`);
            await supabase.from('orders')
              .update({ 
                status: 'paid',
                updated_at: new Date().toISOString()
              })
              .eq('id', order.id);
            kept++;
          }
        } else {
          // Session is still open/processing - keep the order
          kept++;
        }
      } catch (stripeError) {
        console.error(`Error checking Stripe session for order ${order.id}:`, stripeError);
        // If we can't find the session in Stripe, delete the order
        if (stripeError.code === 'resource_missing') {
          console.log(`🗑️ Deleting order ${order.id} (session not found in Stripe)`);
          await supabase.from('orders').delete().eq('id', order.id);
          cleaned++;
        }
      }
    }

    console.log(`✅ Cleanup complete: ${cleaned} deleted, ${kept} kept`);

    return new Response(JSON.stringify({ 
      message: 'Cleanup complete',
      cleaned,
      kept,
      total: pendingOrders.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Cleanup error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
