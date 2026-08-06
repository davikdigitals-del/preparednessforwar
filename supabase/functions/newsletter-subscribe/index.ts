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
    const { email, name, preferences } = await req.json()

    if (!email) throw new Error('Email is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // Save subscriber to database
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email,
        name: name || null,
        preferences: preferences || {},
        subscribed_at: new Date().toISOString(),
        is_active: true,
      }, { onConflict: 'email' })

    if (dbError) {
      console.error('DB error:', dbError)
      // Don't fail — still send welcome email
    }

    // Send welcome email via Resend
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Preparedness For War <newsletter@preparednessforwar.com>',
          to: [email],
          subject: 'Welcome to Preparedness For War Newsletter',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: #1e3a8a; padding: 30px; text-align: center; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Preparedness For War</h1>
                <p style="color: #93c5fd; margin: 8px 0 0;">Stay Informed. Stay Prepared.</p>
              </div>
              
              <h2 style="color: #111827;">Welcome${name ? `, ${name}` : ''}!</h2>
              <p style="color: #374151; line-height: 1.6;">
                You've successfully subscribed to the Preparedness For War newsletter. 
                You'll receive the latest updates on emergency preparedness, survival guides, 
                and critical alerts directly to your inbox.
              </p>

              <div style="background: #f0f9ff; border-left: 4px solid #1e3a8a; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #1e3a8a; font-weight: bold;">What to expect:</p>
                <ul style="color: #374151; margin: 8px 0 0; padding-left: 20px;">
                  <li>Breaking emergency news & alerts</li>
                  <li>Survival guides and practical tips</li>
                  <li>Official directives and country updates</li>
                  <li>Weekly digest of top stories</li>
                </ul>
              </div>

              <p style="color: #374151; line-height: 1.6;">
                Visit us anytime at 
                <a href="https://preparednessforwar.com" style="color: #1e3a8a;">preparednessforwar.com</a>
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                You're receiving this because you subscribed at preparednessforwar.com.<br>
                <a href="https://preparednessforwar.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #6b7280;">Unsubscribe</a>
              </p>
            </div>
          `,
        }),
      })

      if (!resendRes.ok) {
        const resendError = await resendRes.text()
        console.error('Resend error:', resendError)
      } else {
        console.log('Welcome email sent to:', email)
      }
    } else {
      console.warn('RESEND_API_KEY not set — skipping welcome email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Subscribed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('newsletter-subscribe error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
