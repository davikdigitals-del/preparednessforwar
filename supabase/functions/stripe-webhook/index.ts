import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const MAX_FAILED_PAYMENTS = 5 // disable account after this many failed payments

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  if (!signature) return new Response('No signature', { status: 400 })

  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) return new Response('Webhook secret not configured', { status: 500 })

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider)
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

      // ── Subscription created/renewed successfully ───────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.CheckoutSession
        const { type, adPurchaseId } = session.metadata || {}

        // Ad purchase
        if (type === 'ad_purchase' && adPurchaseId) {
          await supabaseAdmin.from('ad_purchases').update({
            payment_status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            paid_at: new Date().toISOString(),
            is_active: true,
          }).eq('id', adPurchaseId)
          break
        }

        // Subscription checkout completed — activate subscription
        if (session.mode === 'subscription' && session.subscription) {
          const userId = session.client_reference_id || session.metadata?.userId
          const planId = session.metadata?.planId

          if (userId && planId) {
            // Get subscription details from Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const periodEnd = new Date(stripeSubscription.current_period_end * 1000)

            // Get plan details
            const { data: plan } = await supabaseAdmin
              .from('subscription_plans')
              .select('*')
              .eq('id', planId)
              .single()

            await supabaseAdmin.from('user_subscriptions').upsert({
              user_id: userId,
              plan_id: planId,
              status: 'active',
              started_at: new Date().toISOString(),
              expires_at: periodEnd.toISOString(),
              stripe_subscription_id: stripeSubscription.id,
              stripe_customer_id: session.customer as string,
              payment_ref: session.id,
              failed_payment_count: 0,
            }, { onConflict: 'user_id' })

            console.log(`Subscription activated for user ${userId}`)
          }
        }
        break
      }

      // ── Invoice paid — subscription renewed ────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const stripeSubId = invoice.subscription as string
        if (!stripeSubId) break

        // Get subscription from Stripe to get period end
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)
        const periodEnd = new Date(stripeSub.current_period_end * 1000)
        const userId = stripeSub.metadata?.userId || stripeSub.client_reference_id

        if (userId) {
          // Renew subscription — reset failed count and extend expiry
          await supabaseAdmin.from('user_subscriptions').update({
            status: 'active',
            expires_at: periodEnd.toISOString(),
            failed_payment_count: 0,
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', stripeSubId)

          console.log(`Subscription renewed for user ${userId} until ${periodEnd.toISOString()}`)
        }
        break
      }

      // ── Invoice payment failed ─────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const stripeSubId = invoice.subscription as string
        if (!stripeSubId) break

        // Get current subscription record
        const { data: sub } = await supabaseAdmin
          .from('user_subscriptions')
          .select('user_id, failed_payment_count')
          .eq('stripe_subscription_id', stripeSubId)
          .maybeSingle()

        if (!sub) break

        const newFailCount = (sub.failed_payment_count || 0) + 1
        console.log(`Payment failed for user ${sub.user_id}, attempt ${newFailCount}/${MAX_FAILED_PAYMENTS}`)

        if (newFailCount >= MAX_FAILED_PAYMENTS) {
          // Disable account after max failed payments
          await supabaseAdmin.from('user_subscriptions').update({
            status: 'suspended',
            failed_payment_count: newFailCount,
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', stripeSubId)

          // Also cancel the Stripe subscription to stop future attempts
          await stripe.subscriptions.cancel(stripeSubId)

          console.log(`Account suspended for user ${sub.user_id} after ${newFailCount} failed payments`)
        } else {
          // Increment failed count but keep subscription active for now
          await supabaseAdmin.from('user_subscriptions').update({
            status: 'past_due',
            failed_payment_count: newFailCount,
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', stripeSubId)
        }
        break
      }

      // ── Subscription cancelled ─────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const stripeSubId = subscription.id

        await supabaseAdmin.from('user_subscriptions').update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', stripeSubId)

        console.log(`Subscription cancelled: ${stripeSubId}`)
        break
      }

      // ── Subscription updated (plan change, etc.) ───────────────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const periodEnd = new Date(subscription.current_period_end * 1000)

        let newStatus = 'active'
        if (subscription.status === 'past_due') newStatus = 'past_due'
        if (subscription.status === 'canceled') newStatus = 'cancelled'
        if (subscription.status === 'unpaid') newStatus = 'suspended'

        await supabaseAdmin.from('user_subscriptions').update({
          status: newStatus,
          expires_at: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', subscription.id)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
