import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "noreply@preparednessforwar.site";
const FROM_NAME = "Preparedness For War";

serve(async (req) => {
  try {
    const body = await req.json();

    // Called by Supabase webhook when a user confirms their email
    // Payload: { type: "UPDATE", table: "users", record: { email, email_confirmed_at, ... } }
    const record = body?.record;
    const oldRecord = body?.old_record;

    // Only fire when email_confirmed_at changes from null to a value
    const justConfirmed =
      record?.email_confirmed_at &&
      !oldRecord?.email_confirmed_at;

    if (!justConfirmed || !record?.email) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const userName = record?.raw_user_meta_data?.name ||
                     record?.raw_user_meta_data?.full_name ||
                     record?.email?.split("@")[0] ||
                     "Member";

    const html = `
<html>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1e3a5f;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;letter-spacing:1px;">
                PREPAREDNESS FOR WAR
              </h1>
              <p style="color:#93c5fd;margin:8px 0 0;font-size:13px;">
                Your trusted source for emergency preparedness
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:22px;">
                Welcome, ${userName}!
              </h2>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Your account has been confirmed and is now active. You're officially part of the Preparedness For War community.
              </p>
              <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Here's what you can do now:
              </p>

              <!-- Features list -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;width:100%;">
                ${[
                  ["🌍 Country Intelligence", "Track risk levels and security alerts across NATO countries."],
                  ["📚 Survival Guides", "Access practical guides, checklists, and preparedness resources."],
                  ["🎓 Training Courses", "Enrol in survival and emergency preparedness courses."],
                  ["🛡️ My Bunker", "Build your personal emergency plan — works offline too."],
                  ["📰 Intelligence Hub", "Stay informed with the latest news and situation reports."],
                ].map(([title, desc]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
                    <p style="margin:0;font-size:14px;font-weight:bold;color:#1e3a5f;">${title}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${desc}</p>
                  </td>
                </tr>`).join("")}
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#1e3a5f;border-radius:6px;padding:14px 40px;text-align:center;">
                    <a href="https://preparednessforwar.onrender.com/dashboard"
                       style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;letter-spacing:0.5px;">
                      Go to My Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">
                Stay prepared. Stay safe. If you have any questions, reply to this email and we'll be happy to help.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">
                Preparedness For War &mdash; preparednessforwar.site
              </p>
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                You're receiving this because you created an account with us.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [record.email],
        subject: `Welcome to Preparedness For War, ${userName}!`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), { status: 500 });
    }

    console.log("Welcome email sent to:", record.email);
    return new Response(JSON.stringify({ success: true, id: result.id }), { status: 200 });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
