import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // ── CORS preflight ──
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const to = params.get("To");

    if (!to) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say>No destination number provided.</Say></Response>`,
        { status: 200, headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    // Only allow E.164 format numbers
    const e164 = /^\+[1-9]\d{6,14}$/;
    if (!e164.test(to)) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Invalid phone number format. Please use international format starting with plus.</Say></Response>`,
        { status: 200, headers: { ...corsHeaders, "Content-Type": "text/xml" } }
      );
    }

    const TWILIO_CALLER_ID = Deno.env.get("TWILIO_CALLER_ID") ?? "";

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${TWILIO_CALLER_ID}" timeout="30" record="do-not-record">
    <Number>${to}</Number>
  </Dial>
</Response>`;

    return new Response(twiml, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/xml" },
    });

  } catch (err: any) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred. Please try again.</Say></Response>`,
      { status: 200, headers: { ...corsHeaders, "Content-Type": "text/xml" } }
    );
  }
});
