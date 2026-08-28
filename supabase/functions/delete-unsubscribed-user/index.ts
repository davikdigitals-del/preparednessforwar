import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // Parse request body for userId
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify request comes from our app using the apikey header
    const apiKey = req.headers.get('apikey') ?? ''
    if (apiKey !== anonKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Only delete if user has no active subscription
    const { data: sub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (sub) {
      return new Response(JSON.stringify({ error: 'User has active subscription' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Delete profile and user_roles first
    await supabaseAdmin.from('profiles').delete().eq('id', userId)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)

    // Delete the auth account
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) throw new Error(`Failed to delete user: ${deleteError.message}`)

    console.log(`Deleted unsubscribed OAuth user: ${userId}`)
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err: any) {
    console.error('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
