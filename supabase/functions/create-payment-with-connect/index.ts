import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateRequest, createPaymentSchema } from "../_shared/validation.ts";
import { handleError } from "../_shared/errorHandler.ts";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    const {
      influencerId,
      offerId,
      amount,
      brandName,
      productName,
      brief,
      deadline,
      specialInstructions
    } = await validateRequest(req, createPaymentSchema);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    // Get offer and influencer details (optimized: only select needed fields)
    const [offerResponse, influencerResponse] = await Promise.all([
      supabaseService.from('offers')
        .select('id, title, description, price, delivery_time, influencer_id')
        .eq('id', offerId)
        .single(),
      supabaseService.from('profiles').select('id, first_name, last_name, email').eq('id', influencerId).single()
    ]);

    if (offerResponse.error || influencerResponse.error) {
      throw new Error('Failed to fetch offer or influencer details');
    }

    const offer = offerResponse.data;
    const influencerProfile = influencerResponse.data;

    // Get influencer's Stripe Connect account (optimized: only select needed fields)
    const { data: stripeAccount } = await supabaseService
      .from('stripe_accounts')
      .select('stripe_account_id, charges_enabled, payouts_enabled, account_status')
      .eq('user_id', influencerId)
      .single();

    if (!stripeAccount?.stripe_account_id || !stripeAccount.charges_enabled) {
      throw new Error('L\'influenceur n\'a pas configuré son compte de paiement');
    }

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

    const amountInCents = Math.round(amount * 100);
    const platformFee = Math.round(amountInCents * 0.1); // 10% platform fee
    const influencerAmount = amountInCents - platformFee;

    // Create payment intent with platform fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      customer: customerId,
      application_fee_amount: platformFee,
      transfer_data: {
        destination: stripeAccount.stripe_account_id,
      },
      capture_method: 'manual', // Manual capture, will be captured when order is confirmed
      metadata: {
        influencer_id: influencerId,
        offer_id: offerId,
        merchant_id: user.id,
        brand_name: brandName,
        product_name: productName,
        brief: brief,
        deadline: deadline || '',
        special_instructions: specialInstructions || '',
        platform_fee: platformFee.toString(),
        influencer_amount: influencerAmount.toString(),
      },
    });

    // Create Stripe session avec toutes les metadata nécessaires
    // IMPORTANT: On ne crée PAS la commande ici, elle sera créée par le webhook
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${offerResponse.data.title} - ${influencerResponse.data.first_name} ${influencerResponse.data.last_name}`,
              description: `Marque: ${brandName} | Produit: ${productName}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccount.stripe_account_id,
        },
        capture_method: 'manual',
        metadata: {
          influencer_id: influencerId,
          offer_id: offerId,
          merchant_id: user.id,
          merchant_email: user.email,
          brand_name: brandName,
          product_name: productName,
          brief: brief,
          deadline: deadline || '',
          special_instructions: specialInstructions || '',
          platform_fee: platformFee.toString(),
          influencer_amount: influencerAmount.toString(),
          total_amount: amount.toString(),
          net_amount: (influencerAmount / 100).toString(),
          commission_rate: '10',
          offer_title: offer.title,
          offer_description: offer.description,
          offer_delivery_time: offer.delivery_time || '',
          influencer_name: `${influencerProfile.first_name} ${influencerProfile.last_name}`,
          influencer_email: influencerProfile.email,
        },
      },
      metadata: {
        influencer_id: influencerId,
        offer_id: offerId,
        merchant_id: user.id,
        brand_name: brandName,
        product_name: productName,
        brief: brief,
        deadline: deadline || '',
        special_instructions: specialInstructions || '',
        total_amount: amount.toString(),
      },
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      paymentIntentId: paymentIntent.id,
      platformFee: platformFee,
      influencerAmount: influencerAmount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return handleError(error, 'create-payment-with-connect');
  }
});