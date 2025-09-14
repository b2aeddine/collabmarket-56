
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { withdrawalId } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawals')
      .select(`
        *,
        bank_accounts(*),
        profiles!withdrawals_influencer_id_fkey(*)
      `)
      .eq('id', withdrawalId)
      .single()

    if (withdrawalError) {
      throw new Error(`Error fetching withdrawal: ${withdrawalError.message}`)
    }

    // Get Stripe account for the influencer
    const { data: stripeAccount, error: stripeError } = await supabaseClient
      .from('stripe_accounts')
      .select('*')
      .eq('user_id', withdrawal.influencer_id)
      .single()

    if (stripeError) {
      throw new Error(`Error fetching Stripe account: ${stripeError.message}`)
    }

    // Initialize Stripe (you'll need to add your Stripe secret key as a secret)
    const stripe = new (await import('https://esm.sh/stripe@11.1.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      { apiVersion: '2022-11-15' }
    )

    // Create payout to the influencer's Stripe account
    const payout = await stripe.payouts.create({
      amount: Math.round(withdrawal.amount * 100), // Convert to cents
      currency: 'eur',
      method: 'instant',
    }, {
      stripeAccount: stripeAccount.stripe_account_id,
    })

    // Update withdrawal with Stripe payout ID and status
    const { error: updateError } = await supabaseClient
      .from('withdrawals')
      .update({
        stripe_payout_id: payout.id,
        status: 'processing',
        processed_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)

    if (updateError) {
      throw new Error(`Error updating withdrawal: ${updateError.message}`)
    }

    // Update revenue status to 'paid'
    const { error: revenueError } = await supabaseClient
      .from('revenues')
      .update({ status: 'paid' })
      .eq('influencer_id', withdrawal.influencer_id)
      .eq('status', 'available')
      .lte('net_amount', withdrawal.amount)

    if (revenueError) {
      console.error('Error updating revenue status:', revenueError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        payoutId: payout.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating payout:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while creating the payout'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
