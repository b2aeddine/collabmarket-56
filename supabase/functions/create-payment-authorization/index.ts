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
    const { 
      influencerId, 
      offerId, 
      amount, 
      brandName, 
      productName, 
      brief,
      deadline,
      specialInstructions 
    } = await req.json();

    console.log('Creating payment authorization for:', { influencerId, offerId, amount });

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

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Get offer and influencer details
    const [offerResponse, influencerResponse] = await Promise.all([
      supabaseService.from('offers')
        .select('*')
        .eq('id', offerId)
        .single(),
      supabaseService.from('profiles').select('*').eq('id', influencerId).single()
    ]);

    if (offerResponse.error || influencerResponse.error) {
      throw new Error("Failed to fetch offer or influencer details");
    }

    const offer = offerResponse.data;
    const influencerProfile = influencerResponse.data;

    // Check if customer exists or create one
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim(),
      });
      customerId = customer.id;
    }

    // Create Stripe session with authorization (not immediate capture)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${offerResponse.data.title} - ${influencerResponse.data.first_name} ${influencerResponse.data.last_name}`,
              description: `Marque: ${brandName} | Produit: ${productName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_intent_data: {
        capture_method: "manual", // Important: Manual capture
        metadata: {
          influencer_id: influencerId,
          offer_id: offerId,
          merchant_id: user.id,
          brand_name: brandName,
          product_name: productName,
          brief: brief,
          deadline: deadline || '',
          special_instructions: specialInstructions || '',
        },
      },
      metadata: {
        influencer_id: influencerId,
        offer_id: offerId,
        merchant_id: user.id,
        brand_name: brandName,
        product_name: productName,
      },
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    });

    // Store the payment authorization in orders table with offer snapshot
    const { error: insertError } = await supabaseService
      .from('orders')
      .insert({
        merchant_id: user.id,
        influencer_id: influencerId,
        offer_id: offerId,
        offer_title: offer.title, // Store offer snapshot
        offer_description: offer.description,
        offer_delivery_time: offer.delivery_time,
        total_amount: amount,
        net_amount: amount * 0.9, // 90% for influencer
        commission_rate: 10,
        status: 'pending',
        stripe_session_id: session.id,
        special_instructions: `Marque: ${brandName}\nProduit: ${productName}\nBrief: ${brief}`,
        delivery_date: deadline ? new Date(deadline).toISOString() : null,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error inserting order:', insertError);
      throw new Error(`Failed to create order record: ${insertError.message}`);
    }

    console.log('Payment authorization created successfully:', session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-payment-authorization:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});