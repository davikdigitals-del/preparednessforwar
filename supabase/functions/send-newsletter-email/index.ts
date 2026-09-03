// Supabase Edge Function to send newsletter confirmation emails via Resend
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    // Send welcome email
    const { data, error } = await resend.emails.send({
      from: "Preparedness For War <newsletter@preparednessforwar.com>",
      to: email,
      subject: "Welcome to Preparedness For War Newsletter!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Our Newsletter</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #1e3a8a; padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                        Welcome to Preparedness For War
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                        ${name ? `Hi ${name},` : 'Hello,'}
                      </p>
                      
                      <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                        Thank you for subscribing to our newsletter! You're now part of a community dedicated to emergency preparedness and survival readiness.
                      </p>
                      
                      <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0;">
                        <strong>Here's what you'll receive:</strong>
                      </p>
                      
                      <ul style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 20px 0; padding-left: 20px;">
                        <li style="margin-bottom: 10px;">🚨 Critical emergency alerts and breaking news</li>
                        <li style="margin-bottom: 10px;">📚 Expert survival guides and tutorials</li>
                        <li style="margin-bottom: 10px;">🛡️ Weekly preparedness tips and strategies</li>
                        <li style="margin-bottom: 10px;">🌍 Country-specific updates and directives</li>
                      </ul>
                      
                      <p style="font-size: 16px; line-height: 24px; color: #333333; margin: 0 0 30px 0;">
                        Stay prepared, stay safe!
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="https://preparednessforwar.com" 
                               style="display: inline-block; background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Visit Our Website
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">
                        You're receiving this because you subscribed to Preparedness For War newsletter.
                      </p>
                      <p style="font-size: 14px; color: #6b7280; margin: 0 0 15px 0;">
                        <a href="{{unsubscribe_url}}" style="color: #1e3a8a; text-decoration: underline;">
                          Unsubscribe
                        </a> | 
                        <a href="https://preparednessforwar.com/privacy" style="color: #1e3a8a; text-decoration: underline;">
                          Privacy Policy
                        </a>
                      </p>
                      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        Preparedness For War &copy; ${new Date().getFullYear()}
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      // Plain text version for email clients that don't support HTML
      text: `
Welcome to Preparedness For War Newsletter!

${name ? `Hi ${name},` : 'Hello,'}

Thank you for subscribing to our newsletter! You're now part of a community dedicated to emergency preparedness and survival readiness.

Here's what you'll receive:
- Critical emergency alerts and breaking news
- Expert survival guides and tutorials
- Weekly preparedness tips and strategies
- Country-specific updates and directives

Stay prepared, stay safe!

Visit us: https://preparednessforwar.com

---
You're receiving this because you subscribed to Preparedness For War newsletter.
Unsubscribe: {{unsubscribe_url}}
      `.trim(),
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
