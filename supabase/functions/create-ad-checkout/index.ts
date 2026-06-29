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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { adPurchaseId, placementId, durationValue, durationType, title, imageUrl, destinationUrl, startDate, endDate, amount } = await req.json()

    // Fetch placement for product name
    const { data: placement } = await supabaseClient
      .from('ad_placements')
      .select('name, currency')
      .eq('id', placementId)
      .single()

    const currency = placement?.currency?.toLowerCase() || 'gbp'
    const amountInPence = Math.round(amount * 100)
    const origin = req.headers.get('origin') || 'https://preparednessforwar.onrender.com'

    // Create Stripe one-time payment session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: {
            name: `Ad: ${placement?.name || 'Placement'}`,
            description: `${durationValue} ${durationType}(s) — ${title} | ${startDate} to ${endDate}`,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: amountInPence,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/dashboard/my-ads?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/advertise?cancelled=true`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        adPurchaseId,
        placementId,
        type: 'ad_purchase',
      },
    })

    // Save session ID to the purchase record
    await supabaseClient
      .from('ad_purchases')
      .update({ stripe_session_id: session.id })
      .eq('id', adPurchaseId)
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Ad checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
