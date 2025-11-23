import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
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
        console.log("📋 Payment intent:", session.payment_intent);

        // Récupérer le PaymentIntent pour avoir toutes les metadata
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        
        console.log("💳 PaymentIntent metadata:", paymentIntent.metadata);

        // Vérifier si la commande existe déjà (pour éviter les doublons)
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id, status")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (existingOrder) {
          console.log("⚠️ Order already exists:", existingOrder.id, "- Updating status");
          
          // Mettre à jour le statut uniquement
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
        } else {
          console.log("✨ Creating new order from webhook metadata");
          
          // Créer la commande avec les metadata du PaymentIntent
          const metadata = paymentIntent.metadata;
          const influencerAmount = parseFloat(metadata.influencer_amount || '0') / 100;
          const totalAmount = parseFloat(metadata.total_amount || '0');
          const netAmount = parseFloat(metadata.net_amount || influencerAmount.toString());
          
          const specialInstructions = `Marque: ${metadata.brand_name || ''}\nProduit: ${metadata.product_name || ''}\nBrief: ${metadata.brief || ''}`;
          
          const { error: insertError } = await supabase
            .from("orders")
            .insert({
              merchant_id: metadata.merchant_id,
              influencer_id: metadata.influencer_id,
              offer_id: metadata.offer_id,
              total_amount: totalAmount,
              net_amount: netAmount,
              commission_rate: parseFloat(metadata.commission_rate || '10'),
              status: "paid",
              stripe_session_id: session.id,
              stripe_payment_intent_id: paymentIntent.id,
              special_instructions: specialInstructions,
              delivery_date: metadata.deadline ? new Date(metadata.deadline).toISOString() : null,
              webhook_received_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("❌ Error creating order:", insertError);
            throw insertError;
          }
          
          console.log("✅ Order created successfully from webhook");
        }

        // Marquer le log comme traité
        await supabase
          .from("payment_logs")
          .update({ 
            processed: true,
          })
          .eq("stripe_session_id", session.id)
          .eq("event_type", event.type);

        console.log("✅ Order processed for session:", session.id);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("⏰ Payment session expired:", session.id);

        // Vérifier si une commande existe pour cette session
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id, status")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (existingOrder && existingOrder.status === 'pending') {
          // Supprimer les commandes pending expirées pour garder une base propre
          console.log("🗑️ Deleting expired pending order:", existingOrder.id);
          
          const { error: deleteError } = await supabase
            .from("orders")
            .delete()
            .eq("id", existingOrder.id);

          if (deleteError) {
            console.error("❌ Error deleting expired order:", deleteError);
          } else {
            console.log("✅ Expired order deleted successfully");
          }
        } else {
          console.log("ℹ️ No pending order found for expired session");
        }

        // Marquer le log comme traité
        await supabase
          .from("payment_logs")
          .update({ processed: true })
          .eq("stripe_session_id", session.id)
          .eq("event_type", event.type);

        console.log("✅ Expired session processed:", session.id);
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