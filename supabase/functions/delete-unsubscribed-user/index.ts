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
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return new Response(JSON.stringify({ error: 'No token' }), { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Get the user from the token
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders })
    }

    // Only delete if user has no active subscription
    const { data: sub } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (sub) {
      return new Response(JSON.stringify({ error: 'User has active subscription' }), { status: 400, headers: corsHeaders })
    }

    // Delete profile and user_roles
    await supabaseAdmin.from('profiles').delete().eq('id', user.id)
    await supabaseAdmin.from('user_roles').delete().eq('user_id', user.id)

    // Delete the auth account
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      throw new Error(`Failed to delete user: ${deleteError.message}`)
    }

    console.log(`Deleted unsubscribed OAuth user: ${user.email}`)
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    console.error('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
