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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🔄 Processing subscription renewals...')

    // Get current date
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Find all active subscriptions that are expiring today
    const { data: expiringSubscriptions, error: fetchError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        started_at,
        expires_at,
        subscription_plans (
          id,
          name,
          slug,
          price,
          currency,
          interval
        )
      `)
      .eq('status', 'active')
      .lte('expires_at', today)

    if (fetchError) {
      console.error('❌ Error fetching expiring subscriptions:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${expiringSubscriptions?.length || 0} expiring subscriptions`)

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No expiring subscriptions found',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let processedCount = 0
    let renewedCount = 0
    let expiredCount = 0

    // Process each expiring subscription
    for (const subscription of expiringSubscriptions) {
      try {
        console.log(`🔍 Processing subscription ${subscription.id} for user ${subscription.user_id}`)
        
        const plan = subscription.subscription_plans
        if (!plan) {
          console.error(`❌ No plan found for subscription ${subscription.id}`)
          continue
        }

        // Calculate new expiry date based on interval
        const currentExpiry = new Date(subscription.expires_at)
        let newExpiry = new Date(currentExpiry)
        
        if (plan.interval === 'month') {
          newExpiry.setMonth(newExpiry.getMonth() + 1)
        } else if (plan.interval === 'year') {
          newExpiry.setFullYear(newExpiry.getFullYear() + 1)
        } else {
          console.error(`❌ Unknown interval '${plan.interval}' for subscription ${subscription.id}`)
          continue
        }

        // For this demo, we'll auto-renew all subscriptions
        // In a real system, you'd integrate with Stripe to process payments
        
        // Update subscription with new expiry date
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            expires_at: newExpiry.toISOString(),
            status: 'active' // Keep active status
          })
          .eq('id', subscription.id)

        if (updateError) {
          console.error(`❌ Error updating subscription ${subscription.id}:`, updateError)
          continue
        }

        console.log(`✅ Renewed subscription ${subscription.id} until ${newExpiry.toISOString()}`)
        renewedCount++

        // Optional: Send renewal notification email (you'd implement this)
        // await sendRenewalEmail(subscription.user_id, plan.name, newExpiry)

      } catch (error) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error)
      }
      
      processedCount++
    }

    console.log(`✅ Renewal processing complete: ${renewedCount} renewed, ${expiredCount} expired`)

    return new Response(
      JSON.stringify({ 
        message: `Processed ${processedCount} subscriptions`,
        renewed: renewedCount,
        expired: expiredCount,
        details: expiringSubscriptions.map(sub => ({
          id: sub.id,
          user_id: sub.user_id,
          plan: sub.subscription_plans?.name,
          status: 'renewed'
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Renewal processing error:', error)
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