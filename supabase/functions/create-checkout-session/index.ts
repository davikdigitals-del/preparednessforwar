import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Extract the user JWT from Authorization header
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()

    console.log('token present:', !!token)
    console.log('token length:', token.length)
    console.log('serviceRoleKey set:', !!serviceRoleKey)

    // Decode token payload to check what we received (without verifying)
    let tokenPayload: any = {}
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        tokenPayload = JSON.parse(atob(parts[1]))
      }
    } catch (_) {}

    console.log('token role:', tokenPayload?.role)
    console.log('token sub:', tokenPayload?.sub ?? 'MISSING')

    // Reject immediately if the token is the anon key (no sub claim)
    if (!tokenPayload?.sub) {
      throw new Error('Not authenticated - no user session found. Please log in and try again.')
    }

    // Verify the token using service role key (preferred) or anon key
    const verifyKey = serviceRoleKey || anonKey
    const supabaseAdmin = createClient(supabaseUrl, verifyKey, {
      auth: { persistSession: false },
    })

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    console.log('getUser error:', userError?.message ?? 'none')
    console.log('user id:', user?.id ?? 'none')

    if (userError || !user) {
      throw new Error(`Not authenticated - ${userError?.message ?? 'user not found'}`)
    }

    // Parse body
    const { planId } = await req.json()

    // Fetch plan
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      throw new Error(`Plan not found - ${planError?.message ?? 'no data'}`)
    }

    const origin = req.headers.get('origin') || 'https://preparednessforwar.onrender.com'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: {
            name: plan.name,
            description: `${plan.name} subscription`,
          },
          unit_amount: Math.round(plan.price * 100),
          recurring: { interval: plan.interval },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/subscribe?plan=${planId}`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
      },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('create-checkout-session error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
