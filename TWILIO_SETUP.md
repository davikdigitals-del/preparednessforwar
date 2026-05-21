# Twilio Voice Setup Guide

## Step 1 — Add secrets to Supabase Edge Functions

Go to: Supabase Dashboard → Project Settings → Edge Functions → Secrets

Add these 5 secrets (get values from your Twilio console):

```
TWILIO_ACCOUNT_SID     = (your Account SID from twilio.com/console)
TWILIO_API_KEY         = (your API Key SID)
TWILIO_API_SECRET      = (your API Key Secret)
TWILIO_TWIML_APP_SID   = AP289fe2c401bc5a5a6996dae2fa24059a
TWILIO_CALLER_ID       = (your verified Twilio phone number, e.g. +447700000000)
```

---

## Step 2 — Create a TwiML App in Twilio Console

1. Go to https://console.twilio.com
2. Navigate to: Voice → TwiML Apps → Create new TwiML App
3. Set the **Voice Request URL** to:
   ```
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/twilio-voice-handler
   ```
   (POST method)
4. Save — copy the **App SID** (starts with AP...)
5. Paste it as `TWILIO_TWIML_APP_SID` in Supabase secrets

---

## Step 3 — Deploy the edge functions

Run in your terminal:
```bash
supabase functions deploy twilio-voice-token
supabase functions deploy twilio-voice-handler
```

---

## Step 4 — Get a Twilio phone number (caller ID)

1. In Twilio Console → Phone Numbers → Buy a number
2. Choose a number in your country
3. Add it as `TWILIO_CALLER_ID` in Supabase secrets (E.164 format, e.g. +447700000000)

---

## How it works

- **Online**: Member clicks "Call in-app" → browser fetches a Twilio Access Token from
  the `twilio-voice-token` edge function → Twilio Voice SDK places a VoIP call through
  the browser → Twilio calls the `twilio-voice-handler` edge function → TwiML dials
  the contact's phone number.

- **Offline**: Falls back to `tel:` link which opens the device's native phone dialer.

---

## Security note

Rotate your API secret at: https://console.twilio.com → Account → API Keys
Never commit credentials to git — always use environment variables.
