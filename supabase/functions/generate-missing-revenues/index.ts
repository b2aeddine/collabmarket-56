import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting to generate missing revenues...');

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all completed orders that don't have revenue records
    const { data: completedOrders, error: ordersError } = await supabaseService
      .from('orders')
      .select('*')
      .in('status', ['terminée', 'completed'])
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(`Error fetching orders: ${ordersError.message}`);
    }

    console.log(`Found ${completedOrders?.length || 0} completed orders`);

    if (!completedOrders || completedOrders.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No completed orders found',
        processed: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let processed = 0;
    let errors = [];

    for (const order of completedOrders) {
      try {
        // Check if revenue already exists for this order
        const { data: existingRevenue } = await supabaseService
          .from('influencer_revenues')
          .select('id')
          .eq('order_id', order.id)
          .single();

        if (existingRevenue) {
          console.log(`Revenue already exists for order ${order.id}, skipping`);
          continue;
        }

        // Calculate amounts based on order data
        const totalAmount = parseFloat(order.total_amount);
        const commissionRate = parseFloat(order.commission_rate) || 10;
        const commission = totalAmount * (commissionRate / 100);
        const netAmount = totalAmount - commission;

        // Create revenue record in influencer_revenues table
        const { error: revenueError } = await supabaseService
          .from('influencer_revenues')
          .insert({
            influencer_id: order.influencer_id,
            order_id: order.id,
            amount: totalAmount,
            commission: commission,
            net_amount: netAmount,
            status: 'available',
            created_at: order.date_completed || order.updated_at || order.created_at,
          });

        if (revenueError) {
          console.error(`Error creating revenue for order ${order.id}:`, revenueError);
          errors.push(`Order ${order.id}: ${revenueError.message}`);
          continue;
        }

        // Also create in the legacy revenues table for backward compatibility
        const { error: legacyRevenueError } = await supabaseService
          .from('revenues')
          .insert({
            influencer_id: order.influencer_id,
            order_id: order.id,
            amount: totalAmount,
            commission: commission,
            net_amount: netAmount,
            status: 'available',
            created_at: order.date_completed || order.updated_at || order.created_at,
          });

        if (legacyRevenueError) {
          console.error(`Error creating legacy revenue for order ${order.id}:`, legacyRevenueError);
          // Don't count this as a failure since the main revenue was created
        }

        processed++;
        console.log(`Created revenue for order ${order.id} - Amount: €${totalAmount}, Net: €${netAmount}`);

      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
        errors.push(`Order ${order.id}: ${error.message}`);
      }
    }

    console.log(`Processing completed. Generated revenues for ${processed} orders`);

    return new Response(JSON.stringify({ 
      success: true,
      processed,
      totalOrders: completedOrders.length,
      errors: errors.length > 0 ? errors : null,
      message: `Successfully generated revenues for ${processed} completed orders`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in generate-missing-revenues:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});