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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    console.log('Auth header starts with Bearer:', authHeader?.startsWith('Bearer '))

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Not authenticated - missing or invalid Authorization header')
    }

    const token = authHeader.replace('Bearer ', '').trim()
    console.log('Token length:', token.length)

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    console.log('SUPABASE_URL set:', !!supabaseUrl)
    console.log('SERVICE_ROLE_KEY set:', !!serviceRoleKey)
    console.log('ANON_KEY set:', !!anonKey)

    // Use service role key if available, otherwise fall back to anon key
    const adminKey = serviceRoleKey || anonKey
    if (!adminKey) {
      throw new Error('Not authenticated - Supabase keys not configured')
    }

    const supabaseAdmin = createClient(supabaseUrl, adminKey, {
      auth: { persistSession: false },
    })

    // Verify the user JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    console.log('getUser error:', userError?.message ?? 'none')
    console.log('User found:', !!user)

    if (userError || !user) {
      throw new Error(`Not authenticated - ${userError?.message ?? 'user not found'}`)
    }

    // Parse request body
    const { planId } = await req.json()
    console.log('planId:', planId)

    // Fetch plan details using anon client with user token
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

    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://preparednessforwar.onrender.com'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: `${plan.name} subscription`,
            },
            unit_amount: Math.round(plan.price * 100),
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
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
