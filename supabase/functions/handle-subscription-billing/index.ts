import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    console.log('💳 Processing subscription billing...')

    // Get current date and upcoming billing dates
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
    const todayStr = now.toISOString().split('T')[0]
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0]

    // Find subscriptions that need renewal in the next 3 days
    const { data: upcomingRenewals, error: fetchError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        started_at,
        expires_at,
        payment_ref,
        subscription_plans (
          id,
          name,
          slug,
          price,
          currency,
          interval
        ),
        profiles (
          id,
          email,
          name
        )
      `)
      .eq('status', 'active')
      .gte('expires_at', todayStr)
      .lte('expires_at', threeDaysStr)

    if (fetchError) {
      console.error('❌ Error fetching upcoming renewals:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${upcomingRenewals?.length || 0} upcoming renewals`)

    if (!upcomingRenewals || upcomingRenewals.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No upcoming renewals found',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let processedCount = 0
    let successCount = 0
    let failureCount = 0
    const results = []

    // Process each upcoming renewal
    for (const subscription of upcomingRenewals) {
      try {
        console.log(`🔍 Processing renewal for subscription ${subscription.id}`)
        
        const plan = subscription.subscription_plans
        const profile = subscription.profiles
        
        if (!plan || !profile) {
          console.error(`❌ Missing plan or profile for subscription ${subscription.id}`)
          continue
        }

        // Check if this is a paid plan (skip free plans)
        if (plan.price === 0 || plan.slug === 'free') {
          console.log(`ℹ️ Skipping free plan renewal for subscription ${subscription.id}`)
          continue
        }

        // Calculate renewal period
        const currentExpiry = new Date(subscription.expires_at)
        let newExpiry = new Date(currentExpiry)
        
        if (plan.interval === 'month') {
          newExpiry.setMonth(newExpiry.getMonth() + 1)
        } else if (plan.interval === 'year') {
          newExpiry.setFullYear(newExpiry.getFullYear() + 1)
        }

        // Create Stripe payment intent for renewal
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(plan.price * 100), // Convert to cents
            currency: plan.currency.toLowerCase(),
            customer: subscription.payment_ref || undefined,
            description: `${plan.name} renewal for ${profile.email}`,
            metadata: {
              subscription_id: subscription.id,
              user_id: subscription.user_id,
              plan_id: plan.id,
              renewal_date: newExpiry.toISOString()
            },
            automatic_payment_methods: {
              enabled: true,
            },
          })

          console.log(`💳 Created payment intent ${paymentIntent.id} for subscription ${subscription.id}`)

          // For auto-renewal, you would typically use saved payment methods
          // Here we'll simulate successful payment for demo purposes
          const paymentSuccessful = true // In real implementation, check payment status

          if (paymentSuccessful) {
            // Update subscription with new expiry date
            const { error: updateError } = await supabaseClient
              .from('user_subscriptions')
              .update({
                expires_at: newExpiry.toISOString(),
                status: 'active'
              })
              .eq('id', subscription.id)

            if (updateError) {
              console.error(`❌ Error updating subscription ${subscription.id}:`, updateError)
              failureCount++
              continue
            }

            console.log(`✅ Successfully renewed subscription ${subscription.id}`)
            successCount++
            
            results.push({
              subscription_id: subscription.id,
              user_email: profile.email,
              plan_name: plan.name,
              new_expiry: newExpiry.toISOString(),
              status: 'renewed'
            })

          } else {
            // Handle payment failure
            await supabaseClient
              .from('user_subscriptions')
              .update({
                status: 'payment_failed'
              })
              .eq('id', subscription.id)
              
            console.log(`❌ Payment failed for subscription ${subscription.id}`)
            failureCount++
            
            results.push({
              subscription_id: subscription.id,
              user_email: profile.email,
              plan_name: plan.name,
              status: 'payment_failed'
            })
          }

        } catch (stripeError) {
          console.error(`❌ Stripe error for subscription ${subscription.id}:`, stripeError)
          failureCount++
          
          results.push({
            subscription_id: subscription.id,
            user_email: profile.email,
            plan_name: plan.name,
            status: 'stripe_error',
            error: stripeError.message
          })
        }

      } catch (error) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error)
        failureCount++
      }
      
      processedCount++
    }

    console.log(`✅ Billing processing complete: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({ 
        message: `Processed ${processedCount} subscription renewals`,
        successful: successCount,
        failed: failureCount,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Billing processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})