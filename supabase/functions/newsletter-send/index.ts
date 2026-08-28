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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
      hasResendApiKey: !!resendApiKey,
    })

    if (!resendApiKey) throw new Error('RESEND_API_KEY is not configured in Supabase secrets')

    // Verify admin
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) throw new Error('Authorization token missing')

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized - invalid token')

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', user.id)
      .single()

    if (!profile || (!profile.is_admin && profile.role !== 'admin')) throw new Error('Admin access required')

    // Parse request
    let body
    try {
      body = await req.json()
      console.log('Request body received:', {
        hasSubject: !!body.subject,
        hasHtml: !!body.html,
        hasText: !!body.text,
        subjectLength: body.subject?.length,
        htmlLength: body.html?.length,
      })
    } catch (e) {
      console.error('Failed to parse request JSON:', e)
      throw new Error(`Invalid JSON in request body: ${e.message}`)
    }

    const { subject, html, text, previewText } = body

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      throw new Error('Subject is required and must be a non-empty string')
    }
    if (!html || typeof html !== 'string' || !html.trim()) {
      throw new Error('HTML content is required and must be a non-empty string')
    }

    // Get all active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('is_active', true)

    if (subError) throw new Error(`Failed to fetch subscribers: ${subError.message}`)
    if (!subscribers || subscribers.length === 0) throw new Error('No active subscribers found')

    console.log(`Sending newsletter to ${subscribers.length} subscribers`)

    // Resend supports batch emails - send in chunks of 100
    const chunkSize = 100
    let sent = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += chunkSize) {
      const chunk = subscribers.slice(i, i + chunkSize)

      // Use Resend batch API
      const emails = chunk.map((sub: any) => ({
        from: 'Preparedness For War <newsletter@preparednessforwar.site>',
        to: [sub.email],
        subject,
        html: html.replace('{{name}}', sub.name || 'Subscriber'),
        text: (text || '').replace('{{name}}', sub.name || 'Subscriber'),
        reply_to: 'support@preparednessforwar.site',
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'Preparedness For War Newsletter',
          'List-Unsubscribe': `<https://preparednessforwar.site/unsubscribe?email=${encodeURIComponent(sub.email)}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'List-Help': '<https://preparednessforwar.site/help>',
          'List-Archive': '<https://preparednessforwar.site/newsletter-archive>',
          'Precedence': 'bulk',
        },
      }))

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emails),
      })

      if (res.ok) {
        sent += chunk.length
      } else {
        const err = await res.text()
        console.error('Resend batch error:', err)
        failed += chunk.length
      }
    }

    // Log the send in database
    try {
      await supabase.from('newsletter_sends').insert({
        subject,
        sent_count: sent,
        failed_count: failed,
        sent_by: user.id,
        sent_at: new Date().toISOString(),
      });
    } catch (_) { } // Ignore if table doesn't exist yet

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: subscribers.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('newsletter-send error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
