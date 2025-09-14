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

  console.log("🔧 Running payment recovery process...");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // 1. Récupérer les commandes avec paiement mais sans webhook reçu
    const { data: ordersWithoutWebhook, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending_payment")
      .is("webhook_received_at", null)
      .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Plus de 10 minutes

    if (ordersError) {
      throw ordersError;
    }

    console.log(`📊 Found ${ordersWithoutWebhook?.length || 0} orders without webhook`);

    // 2. Récupérer les logs de paiement non traités
    const { data: unprocessedLogs, error: logsError } = await supabase
      .from("payment_logs")
      .select("*")
      .eq("processed", false)
      .eq("event_type", "checkout.session.completed");

    if (logsError) {
      throw logsError;
    }

    console.log(`📋 Found ${unprocessedLogs?.length || 0} unprocessed payment logs`);

    let recoveredOrders = 0;

    // 3. Traiter les logs non traités
    for (const log of unprocessedLogs || []) {
      try {
        const { data: order, error: findError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_session_id", log.stripe_session_id)
          .single();

        if (findError || !order) {
          console.log(`⚠️ No order found for session ${log.stripe_session_id}`);
          continue;
        }

        if (order.status !== "paid") {
          // Mettre à jour le statut de la commande
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              status: "paid",
              webhook_received_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          if (updateError) {
            console.error(`❌ Error updating order ${order.id}:`, updateError);
            continue;
          }

          // Marquer le log comme traité
          await supabase
            .from("payment_logs")
            .update({ 
              processed: true,
              order_id: order.id 
            })
            .eq("id", log.id);

          recoveredOrders++;
          console.log(`✅ Recovered order ${order.id}`);
        }
      } catch (error) {
        console.error(`💥 Error processing log ${log.id}:`, error);
      }
    }

    // 4. Nettoyer les anciennes commandes pending trop longtemps
    const { error: cleanupError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()); // Plus de 48h

    if (cleanupError) {
      console.error("❌ Error cleaning up old orders:", cleanupError);
    }

    const result = {
      recovered_orders: recoveredOrders,
      unprocessed_logs: unprocessedLogs?.length || 0,
      orders_without_webhook: ordersWithoutWebhook?.length || 0,
      success: true,
    };

    console.log("🎉 Payment recovery completed:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("💥 Payment recovery error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});