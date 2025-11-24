import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3"
import Stripe from "https://esm.sh/stripe@14.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasStripeKey: !!stripeSecretKey
    });

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header provided')
    }

    const token = authHeader.replace('Bearer ', '')
    
    console.log('Getting user from token...');
    const { data: user, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user.user) {
      throw new Error(`Authentication failed: ${authError?.message || 'User not found'}`)
    }

    console.log('User authenticated:', user.user.id);

    // Récupérer le profil utilisateur avec la session Stripe Identity
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single()

    if (profileError || !profile) {
      throw new Error(`Profile not found: ${profileError?.message}`)
    }

    console.log('Profile found:', profile.id, 'Session ID:', profile.stripe_identity_session_id);

    if (!profile.stripe_identity_session_id) {
      throw new Error('No Stripe Identity session found for this user')
    }

    // Récupérer le statut actuel de la session depuis Stripe
    console.log('Checking Stripe Identity session status...');
    const session = await stripe.identity.verificationSessions.retrieve(
      profile.stripe_identity_session_id
    );

    console.log('Stripe session status:', {
      id: session.id,
      status: session.status,
      type: session.type,
      metadata: session.metadata
    });

    // Mettre à jour le profil avec le statut actuel
    const updateData: any = {
      stripe_identity_status: session.status,
      updated_at: new Date().toISOString()
    };

    // Si la vérification est terminée avec succès
    if (session.status === 'verified') {
      updateData.is_verified = true;
      updateData.identity_status = 'verified';
      
      console.log('🎉 Session verified! Updating profile...');
    } else if (session.status === 'processing') {
      updateData.identity_status = 'processing';
      console.log('⏳ Session still processing...');
    } else if (session.status === 'requires_input') {
      console.log('⚠️ Session requires additional input...');
    } else if (session.status === 'canceled') {
      console.log('❌ Session was canceled...');
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    console.log('Profile updated successfully with status:', session.status);

    // Si vérifié, créer aussi un enregistrement dans identity_documents
    if (session.status === 'verified' && session.last_verification_report?.document) {
      const document = session.last_verification_report.document;
      const { error: docError } = await supabase
        .from('identity_documents')
        .upsert({
          user_id: user.user.id,
          document_type: document.type || 'identity_card',
          status: 'verified',
          verified_at: new Date().toISOString(),
          uploaded_at: new Date().toISOString(),
          document_front_url: 'verified_via_stripe_identity',
        }, {
          onConflict: 'user_id'
        });
      
      if (!docError) {
        console.log('✅ Identity document record created/updated');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: session.status,
        is_verified: session.status === 'verified',
        session_id: session.id,
        updated: true
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    const errorResponse = {
      error: error.message || 'Internal server error',
      details: error.toString(),
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})