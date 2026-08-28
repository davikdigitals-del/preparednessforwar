import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  subscription_id: string
  type: 'success' | 'failure'
  payment_intent_id?: string
  failure_reason?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subscription_id, type, payment_intent_id, failure_reason }: NotificationRequest = await req.json()
    
    if (!subscription_id || !type) {
      throw new Error('Missing required parameters: subscription_id and type')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log(`📧 Sending ${type} notification for subscription ${subscription_id}`)

    // Get subscription details
    const { data: subscription, error: fetchError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        expires_at,
        subscription_plans (
          name,
          price,
          currency,
          interval
        ),
        profiles (
          email,
          name
        )
      `)
      .eq('id', subscription_id)
      .single()

    if (fetchError || !subscription) {
      throw new Error(`Subscription not found: ${subscription_id}`)
    }

    const plan = subscription.subscription_plans
    const profile = subscription.profiles
    
    if (!plan || !profile || !profile.email) {
      throw new Error('Missing subscription plan or user profile data')
    }

    let template: any
    let emailSent = false

    if (type === 'success') {
      template = getSuccessTemplate(profile, plan, subscription)
      emailSent = await sendEmail(profile.email, template)
    } else if (type === 'failure') {
      template = getFailureTemplate(profile, plan, subscription, failure_reason)
      emailSent = await sendEmail(profile.email, template)
    }

    // Log the notification
    await supabaseClient
      .from('subscription_renewals')
      .insert({
        subscription_id,
        user_id: subscription.user_id,
        plan_id: subscription.plan_id,
        renewal_date: subscription.expires_at,
        amount: plan.price,
        currency: plan.currency,
        status: `notification_${type}`,
        payment_intent_id,
        failure_reason,
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        message: `${type} notification sent successfully`,
        email_sent: emailSent,
        recipient: profile.email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Notification error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send notification',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function getSuccessTemplate(profile: any, plan: any, subscription: any) {
  const userName = profile.name || 'Valued Member'
  const planName = plan.name
  const price = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: plan.currency
  }).format(plan.price)
  const newExpiryDate = new Date(subscription.expires_at).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const subject = `Payment Successful - ${planName} Renewed`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Successful</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">✅ Payment Successful!</h1>
        </div>
        
        <div style="background: #f0fdf4; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p>Great news! Your subscription payment has been processed successfully and your access has been renewed.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="margin-top: 0; color: #10b981;">Renewal Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Amount Paid:</strong> ${price}</p>
            <p><strong>Next Renewal:</strong> ${newExpiryDate}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <p>Your subscription is now active and you have full access to all premium features and content.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://preparedness-hub.com'}/dashboard" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Access Your Account
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6b7280;">
            Thank you for your continued membership with Preparedness Hub.
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Best regards,<br>
            The Preparedness Hub Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${userName},

Great news! Your subscription payment has been processed successfully and your access has been renewed.

Renewal Details:
- Plan: ${planName}
- Amount Paid: ${price}
- Next Renewal: ${newExpiryDate}
- Status: Active

Your subscription is now active and you have full access to all premium features and content.

Access your account: ${Deno.env.get('SITE_URL') || 'https://preparedness-hub.com'}/dashboard

Thank you for your continued membership with Preparedness Hub.

Best regards,
The Preparedness Hub Team
  `

  return { subject, html, text }
}

function getFailureTemplate(profile: any, plan: any, subscription: any, failureReason?: string) {
  const userName = profile.name || 'Valued Member'
  const planName = plan.name
  const price = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: plan.currency
  }).format(plan.price)

  const subject = `Payment Failed - Action Required for ${planName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Failed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">⚠️ Payment Failed</h1>
        </div>
        
        <div style="background: #fef2f2; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p>We were unable to process your subscription renewal payment for <strong>${planName}</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="margin-top: 0; color: #ef4444;">Payment Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Amount:</strong> ${price}</p>
            ${failureReason ? `<p><strong>Reason:</strong> ${failureReason}</p>` : ''}
          </div>
          
          <div style="background: #fbbf24; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Action Required:</strong> Please update your payment method to continue your subscription without interruption.</p>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Your access will continue for a limited grace period</li>
            <li>We'll automatically retry payment in 24 hours</li>
            <li>Please update your payment method to ensure uninterrupted service</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://preparedness-hub.com'}/dashboard?update=payment" 
               style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Update Payment Method
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <h3 style="color: #ef4444;">Need Help?</h3>
          <p>If you continue to have payment issues or need assistance updating your payment method, please contact our support team immediately.</p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Best regards,<br>
            The Preparedness Hub Team
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hi ${userName},

We were unable to process your subscription renewal payment for ${planName}.

Payment Details:
- Plan: ${planName}
- Amount: ${price}
${failureReason ? `- Reason: ${failureReason}` : ''}

ACTION REQUIRED: Please update your payment method to continue your subscription without interruption.

What happens next?
- Your access will continue for a limited grace period
- We'll automatically retry payment in 24 hours
- Please update your payment method to ensure uninterrupted service

Update your payment method: ${Deno.env.get('SITE_URL') || 'https://preparedness-hub.com'}/dashboard?update=payment

Need help? Contact our support team if you continue to have payment issues.

Best regards,
The Preparedness Hub Team
  `

  return { subject, html, text }
}

async function sendEmail(to: string, template: any): Promise<boolean> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('📧 No email service configured - skipping email send')
      return true
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: Deno.env.get('FROM_EMAIL') || 'noreply@preparedness-hub.com',
        to: [to],
        subject: template.subject,
        html: template.html,
        text: template.text,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('❌ Email send error:', error)
    return false
  }
}