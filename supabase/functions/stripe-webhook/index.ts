import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!webhookSecret) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { userId, planId } = paymentIntent.metadata

        if (!userId || !planId) {
          throw new Error('Missing metadata')
        }

        // Calculate expiry date based on plan interval
        const { data: plan } = await supabaseAdmin
          .from('subscription_plans')
          .select('interval')
          .eq('id', planId)
          .single()

        const expiresAt = new Date()
        if (plan?.interval === 'year') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1)
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1)
        }

        // Create or update subscription
        const { error } = await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            payment_ref: paymentIntent.id,
          })

        if (error) {
          console.error('Error creating subscription:', error)
          throw error
        }

        console.log(`Subscription created for user ${userId}`)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const { type, adPurchaseId, userId } = session.metadata || {}

        // Handle ad purchase payment
        if (type === 'ad_purchase' && adPurchaseId) {
          const { error } = await supabaseAdmin
            .from('ad_purchases')
            .update({
              payment_status: 'paid',
              stripe_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string,
              paid_at: new Date().toISOString(),
              is_active: true, // Go live immediately after payment
            })
            .eq('id', adPurchaseId)

          if (error) {
            console.error('Error activating ad purchase:', error)
            throw error
          }
          console.log(`Ad purchase ${adPurchaseId} activated for user ${userId}`)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (userId) {
          await supabaseAdmin
            .from('user_subscriptions')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .eq('status', 'active')
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
