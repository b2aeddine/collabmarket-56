
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3"

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
      console.error('Stripe secret key missing');
      throw new Error('Stripe secret key not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header');
      throw new Error('No authorization header provided')
    }

    const token = authHeader.replace('Bearer ', '')
    
    console.log('Getting user from token...');
    const { data: user, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`)
    }

    if (!user.user) {
      console.error('No user found');
      throw new Error('User not found')
    }

    console.log('User authenticated:', user.user.id);

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error(`Profile fetch failed: ${profileError.message}`)
    }

    if (!profile) {
      console.error('Profile not found for user:', user.user.id);
      throw new Error('Profile not found')
    }

    console.log('Profile found:', profile.id);

    // Créer une session Stripe Identity
    console.log('Creating Stripe Identity session...');
    
    const sessionData = {
      type: 'document',
      metadata: {
        user_id: user.user.id,
        profile_id: profile.id,
        supabase_user_id: user.user.id
      },
      return_url: `${req.headers.get('origin') || 'https://preview--collabmarket-connect-hub.lovable.app'}/verify-identity?verification=complete`
    };

    console.log('Stripe request data:', JSON.stringify(sessionData, null, 2));

    const stripeResponse = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'type': sessionData.type,
        'metadata[user_id]': sessionData.metadata.user_id,
        'metadata[profile_id]': sessionData.metadata.profile_id,
        'metadata[supabase_user_id]': sessionData.metadata.supabase_user_id,
        'return_url': sessionData.return_url
      }).toString(),
    })

    console.log('Stripe response status:', stripeResponse.status);

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text()
      console.error('Stripe API error:', stripeResponse.status, errorText)
      
      // Analyser l'erreur Stripe pour donner un message plus clair
      let errorMessage = `Stripe API error: ${stripeResponse.status}`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message
        }
      } catch (e) {
        errorMessage = errorText
      }
      
      throw new Error(errorMessage)
    }

    const session = await stripeResponse.json()
    console.log('Stripe session created successfully:', session.id)

    // Mettre à jour le profil avec les informations de session
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_identity_session_id: session.id,
        stripe_identity_status: session.status,
        stripe_identity_url: session.url,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      throw new Error(`Failed to update profile: ${updateError.message}`)
    }

    console.log('Profile updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: session.url,
        session_id: session.id,
        status: session.status
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
    
    // Retourner une erreur structurée
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
