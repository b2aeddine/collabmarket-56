import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🚀 Webhook called - method:", req.method, "url:", req.url);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    console.log("📥 Webhook signature present:", !!signature);
    console.log("🔑 Webhook secret configured:", !!webhookSecret);

    // Log l'événement même si la vérification échoue
    let event;
    
    if (!signature || !webhookSecret) {
      console.error("❌ Missing signature or webhook secret");
      return new Response("Missing signature or webhook secret", { status: 400 });
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Event verified successfully:", event.type, "ID:", event.id);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Log l'événement dans notre table de logs
    await supabase.from("payment_logs").insert({
      stripe_session_id: event.data.object.id || "unknown",
      event_type: event.type,
      event_data: event.data,
      processed: false
    });

    console.log("📝 Event logged to payment_logs table");

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💰 Payment succeeded for session:", session.id);
        console.log("📋 Session metadata:", session.metadata);

        // Trouver la commande correspondante
        const { data: existingOrder, error: findError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_session_id", session.id)
          .single();

        if (findError) {
          console.error("❌ Error finding order:", findError);
          throw findError;
        }

        if (!existingOrder) {
          console.error("⚠️ No order found for session:", session.id);
          throw new Error(`No order found for session ${session.id}`);
        }

        console.log("🔍 Found order:", existingOrder.id, "Current status:", existingOrder.status);

        // Mettre à jour le statut de la commande à 'paid'
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            status: "paid",
            webhook_received_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("stripe_session_id", session.id);

        if (updateError) {
          console.error("❌ Error updating order status:", updateError);
          throw updateError;
        }

        // Marquer le log comme traité
        await supabase
          .from("payment_logs")
          .update({ 
            processed: true,
            order_id: existingOrder.id 
          })
          .eq("stripe_session_id", session.id)
          .eq("event_type", event.type);

        console.log("✅ Order status updated to paid for session:", session.id);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("⏰ Payment session expired:", session.id);

        // Mettre à jour le statut de la commande à 'cancelled'
        const { error: updateError } = await supabase
          .from("orders")
          .update({ 
            status: "cancelled",
            webhook_received_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("stripe_session_id", session.id);

        if (updateError) {
          console.error("❌ Error updating order status:", updateError);
          throw updateError;
        }

        // Marquer le log comme traité
        await supabase
          .from("payment_logs")
          .update({ processed: true })
          .eq("stripe_session_id", session.id)
          .eq("event_type", event.type);

        console.log("✅ Order status updated to cancelled for session:", session.id);
        break;
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ 
      received: true, 
      event_type: event.type,
      session_id: event.data.object.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("💥 Webhook error:", error);
    
    // Log l'erreur dans Supabase
    try {
      await supabase.from("payment_logs").insert({
        stripe_session_id: "error",
        event_type: "webhook_error",
        event_data: { error: error.message, stack: error.stack },
        processed: false
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});