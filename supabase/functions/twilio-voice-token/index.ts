import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  // ── CORS preflight — MUST return 200 before anything else ──
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  // ── Always wrap in try/catch and always include CORS headers ──
  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
    const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY") ?? "";
    const TWILIO_API_SECRET = Deno.env.get("TWILIO_API_SECRET") ?? "";
    const TWILIO_TWIML_APP_SID = Deno.env.get("TWILIO_TWIML_APP_SID") ?? "";

    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET || !TWILIO_TWIML_APP_SID) {
      return new Response(
        JSON.stringify({ error: "Twilio secrets not configured. Add them in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600;

    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      jti: `${TWILIO_API_KEY}-${now}`,
      iss: TWILIO_API_KEY,
      sub: TWILIO_ACCOUNT_SID,
      exp,
      grants: {
        voice: {
          incoming: { allow: true },
          outgoing: { application_sid: TWILIO_TWIML_APP_SID },
        },
      },
    };

    const b64url = (obj: object) =>
      btoa(JSON.stringify(obj))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const headerB64 = b64url(header);
    const payloadB64 = b64url(payload);
    const signingInput = `${headerB64}.${payloadB64}`;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(TWILIO_API_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(signingInput)
    );

    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const token = `${signingInput}.${sigB64}`;

    return new Response(
      JSON.stringify({ token }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
