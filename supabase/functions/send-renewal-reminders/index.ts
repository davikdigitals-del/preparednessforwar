import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
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

    console.log('📧 Processing subscription renewal reminders...')

    // Get current date and reminder thresholds
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
    const sevenDaysFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
    const oneDayFromNow = new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000))

    // Find subscriptions that need reminders
    const { data: subscriptionsNeedingReminders, error: fetchError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        status,
        expires_at,
        next_billing_date,
        renewal_attempts,
        subscription_plans (
          id,
          name,
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
      .eq('auto_renew', true)
      .gte('expires_at', now.toISOString())
      .lte('expires_at', sevenDaysFromNow.toISOString())

    if (fetchError) {
      console.error('❌ Error fetching subscriptions for reminders:', fetchError)
      throw fetchError
    }

    console.log(`📊 Found ${subscriptionsNeedingReminders?.length || 0} subscriptions needing reminders`)

    if (!subscriptionsNeedingReminders || subscriptionsNeedingReminders.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No subscriptions need reminders',
          sent: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    let emailsSent = 0
    let emailsFailed = 0
    const results = []

    // Process each subscription
    for (const subscription of subscriptionsNeedingReminders) {
      try {
        const plan = subscription.subscription_plans
        const profile = subscription.profiles

        if (!plan || !profile || !profile.email) {
          console.error(`❌ Missing plan, profile, or email for subscription ${subscription.id}`)
          continue
        }

        const expiryDate = new Date(subscription.expires_at)
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Determine reminder type based on days until expiry
        let reminderType = ''
        let template: EmailTemplate

        if (daysUntilExpiry <= 1) {
          reminderType = 'expires_tomorrow'
          template = getExpiresReminderTemplate(profile, plan, expiryDate, 'tomorrow')
        } else if (daysUntilExpiry <= 3) {
          reminderType = 'expires_in_3_days'
          template = getExpiresReminderTemplate(profile, plan, expiryDate, '3 days')
        } else if (daysUntilExpiry <= 7) {
          reminderType = 'expires_in_7_days'
          template = getExpiresReminderTemplate(profile, plan, expiryDate, '7 days')
        } else {
          continue // Skip if more than 7 days
        }

        // Check if we already sent this type of reminder recently
        const { data: recentReminders } = await supabaseClient
          .from('subscription_renewals')
          .select('id')
          .eq('subscription_id', subscription.id)
          .eq('status', `reminder_${reminderType}`)
          .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString()) // Last 24 hours

        if (recentReminders && recentReminders.length > 0) {
          console.log(`ℹ️ Already sent ${reminderType} reminder for subscription ${subscription.id}`)
          continue
        }

        // Send email via Resend or your email service
        const emailSent = await sendEmail(profile.email, template)

        if (emailSent) {
          // Log the reminder in the renewals table
          await supabaseClient
            .from('subscription_renewals')
            .insert({
              subscription_id: subscription.id,
              user_id: subscription.user_id,
              plan_id: subscription.plan_id,
              renewal_date: subscription.expires_at,
              amount: plan.price,
              currency: plan.currency,
              status: `reminder_${reminderType}`,
              email_sent: true,
              email_type: reminderType.replace('expires_', ''),
              created_at: now.toISOString()
            })

          // Update last reminder sent timestamp
          await supabaseClient
            .from('user_subscriptions')
            .update({
              last_reminder_sent: now.toISOString()
            })
            .eq('id', subscription.id)

          console.log(`✅ Sent ${reminderType} reminder to ${profile.email}`)
          emailsSent++

          results.push({
            subscription_id: subscription.id,
            user_email: profile.email,
            reminder_type: reminderType,
            days_until_expiry: daysUntilExpiry,
            status: 'sent'
          })
        } else {
          console.error(`❌ Failed to send ${reminderType} reminder to ${profile.email}`)
          emailsFailed++

          results.push({
            subscription_id: subscription.id,
            user_email: profile.email,
            reminder_type: reminderType,
            days_until_expiry: daysUntilExpiry,
            status: 'failed'
          })
        }

      } catch (error) {
        console.error(`❌ Error processing reminder for subscription ${subscription.id}:`, error)
        emailsFailed++
      }
    }

    console.log(`✅ Reminder processing complete: ${emailsSent} sent, ${emailsFailed} failed`)

    return new Response(
      JSON.stringify({
        message: `Processed ${subscriptionsNeedingReminders.length} subscription reminders`,
        sent: emailsSent,
        failed: emailsFailed,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Reminder processing error:', error)
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

// Email templates
function getExpiresReminderTemplate(profile: any, plan: any, expiryDate: Date, timeFrame: string): EmailTemplate {
  const userName = profile.name || 'Valued Member'
  const planName = plan.name
  const formattedDate = expiryDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const price = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: plan.currency
  }).format(plan.price)

  const subject = `Subscription Renewal Reminder - ${planName} expires ${timeFrame}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Subscription Renewal Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Subscription Renewal Reminder</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p>This is a friendly reminder that your <strong>${planName}</strong> subscription will expire <strong>${timeFrame}</strong> on <strong>${formattedDate}</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
            <h3 style="margin-top: 0; color: #1e40af;">Subscription Details</h3>
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Renewal Amount:</strong> ${price}</p>
            <p><strong>Expires:</strong> ${formattedDate}</p>
          </div>
          
          <p><strong>Good news!</strong> Your subscription is set to auto-renew, so you don't need to do anything. We'll automatically process your renewal and send you a confirmation.</p>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Important:</strong> Please ensure your payment method is up to date to avoid any interruption in service.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SITE_URL') || 'https://preparedness-hub.com'}/dashboard" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Manage Subscription
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <h3 style="color: #1e40af;">Need Help?</h3>
          <p>If you have any questions about your subscription or need to update your payment method, please contact our support team.</p>
          
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

This is a friendly reminder that your ${planName} subscription will expire ${timeFrame} on ${formattedDate}.

Subscription Details:
- Plan: ${planName}
- Renewal Amount: ${price}
- Expires: ${formattedDate}

Good news! Your subscription is set to auto-renew, so you don't need to do anything. We'll automatically process your renewal and send you a confirmation.

Important: Please ensure your payment method is up to date to avoid any interruption in service.

You can manage your subscription at: ${Deno.env.get('SITE_URL') || 'https://preparedness-hub.com'}/dashboard

Need help? Contact our support team with any questions.

Best regards,
The Preparedness Hub Team
  `

  return { subject, html, text }
}

// Email sending function (replace with your email service)
async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  try {
    // Example with Resend (replace with your email service)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!resendApiKey) {
      console.log('📧 No email service configured - skipping email send')
      return true // Return true for development
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

    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Email sent successfully:`, result.id)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Email send failed:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Email send error:', error)
    return false
  }
}