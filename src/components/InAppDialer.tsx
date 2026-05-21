import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, PhoneCall, Wifi, WifiOff, Loader2, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface InAppDialerProps {
  contactName: string;
  phoneNumber: string;
  isOnline: boolean;
}

type CallState = "idle" | "connecting" | "ringing" | "active" | "ended" | "error";

export function InAppDialer({ contactName, phoneNumber, isOnline }: InAppDialerProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [twilioLoaded, setTwilioLoaded] = useState(false);
  const deviceRef = useRef<any>(null);
  const callRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamically load Twilio Voice SDK (v2)
  useEffect(() => {
    if (!isOnline) return;
    const existing = document.getElementById("twilio-voice-sdk");
    if (existing) { setTwilioLoaded(true); return; }
    const script = document.createElement("script");
    script.id = "twilio-voice-sdk";
    // Use Twilio Voice SDK 2.x — stable, supports modern browsers
    script.src = "https://sdk.twilio.com/js/voice/releases/2.10.0/twilio.min.js";
    script.onload = () => setTwilioLoaded(true);
    script.onerror = () => setErrorMsg("Failed to load voice SDK");
    document.head.appendChild(script);
  }, [isOnline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callRef.current) callRef.current.disconnect();
      if (deviceRef.current) deviceRef.current.destroy();
    };
  }, []);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const startCall = async () => {
    if (!isOnline) return; // offline: use tel: link instead
    if (!twilioLoaded || !(window as any).Twilio) {
      setErrorMsg("Voice SDK not ready. Please wait.");
      return;
    }

    setCallState("connecting");
    setErrorMsg("");

    try {
      // Get Twilio access token from edge function
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twilio-voice-token`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const { token, error } = await res.json();
      if (error || !token) throw new Error(error || "No token returned");

      // Setup Twilio Device (SDK v2)
      const TwilioVoice = (window as any).Twilio.Device;
      const device = new TwilioVoice(token, {
        codecPreferences: ["opus", "pcmu"],
        logLevel: 1,
      });
      deviceRef.current = device;

      await device.register();
      setCallState("ringing");

      // Connect — params are sent as POST body to the TwiML handler
      const call = await device.connect({
        params: { To: phoneNumber },
      });
      callRef.current = call;

      call.on("accept", () => {
        setCallState("active");
        timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
      });

      call.on("disconnect", () => {
        setCallState("ended");
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => { setCallState("idle"); setDuration(0); }, 3000);
      });

      call.on("error", (err: any) => {
        setErrorMsg(err.message || "Call error");
        setCallState("error");
      });

    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start call");
      setCallState("error");
    }
  };

  const endCall = () => {
    if (callRef.current) callRef.current.disconnect();
    if (timerRef.current) clearInterval(timerRef.current);
    if (deviceRef.current) { deviceRef.current.destroy(); deviceRef.current = null; }
    setCallState("ended");
    setTimeout(() => { setCallState("idle"); setDuration(0); }, 2000);
  };

  const toggleMute = () => {
    if (callRef.current) {
      callRef.current.mute(!muted);
      setMuted(!muted);
    }
  };

  // ── OFFLINE: show tel: link only ──
  if (!isOnline) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        <a
          href={`tel:${phoneNumber}`}
          className="flex items-center gap-2 bg-[#1d70b8] text-white text-sm font-bold px-4 py-2 hover:bg-[#003078] transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call {phoneNumber}
        </a>
        <a
          href={`sms:${phoneNumber}`}
          className="flex items-center gap-2 bg-[#f3f2f1] text-[#0b0c0c] text-sm font-bold px-4 py-2 border border-[#b1b4b6] hover:bg-[#e8f0f8] transition-colors"
        >
          SMS
        </a>
        <span className="text-xs text-[#505a5f] flex items-center gap-1">
          <WifiOff className="w-3 h-3" /> Device dialer (offline)
        </span>
      </div>
    );
  }

  // ── ONLINE: in-platform dialer ──
  return (
    <div className="space-y-2">
      {/* Idle state */}
      {callState === "idle" && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={startCall}
            className="flex items-center gap-2 bg-[#1d70b8] text-white text-sm font-bold px-4 py-2 hover:bg-[#003078] transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Call in-app
          </button>
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center gap-2 bg-[#f3f2f1] text-[#0b0c0c] text-sm font-bold px-4 py-2 border border-[#b1b4b6] hover:bg-[#e8f0f8] transition-colors"
          >
            <Phone className="w-4 h-4" />
            {phoneNumber}
          </a>
          <a
            href={`sms:${phoneNumber}`}
            className="flex items-center gap-2 text-[#1d70b8] text-sm font-medium hover:underline"
          >
            SMS
          </a>
        </div>
      )}

      {/* Connecting */}
      {callState === "connecting" && (
        <div className="flex items-center gap-3 bg-[#e8f0f8] border border-[#1d70b8]/30 px-4 py-3">
          <Loader2 className="w-4 h-4 text-[#1d70b8] animate-spin" />
          <span className="text-sm font-medium text-[#0b0c0c]">Connecting to {contactName}…</span>
        </div>
      )}

      {/* Ringing */}
      {callState === "ringing" && (
        <div className="flex items-center justify-between bg-[#e8f0f8] border border-[#1d70b8]/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#1d70b8] rounded-full animate-pulse" />
            <span className="text-sm font-medium text-[#0b0c0c]">Ringing {contactName}…</span>
          </div>
          <button onClick={endCall} className="flex items-center gap-1.5 bg-[#d4351c] text-white text-xs font-bold px-3 py-1.5 hover:bg-[#aa2a12] transition-colors">
            <PhoneOff className="w-3 h-3" /> Cancel
          </button>
        </div>
      )}

      {/* Active call */}
      {callState === "active" && (
        <div className="bg-[#e8f4ee] border border-[#00703c]/30 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00703c] rounded-full animate-pulse" />
              <span className="text-sm font-bold text-[#0b0c0c]">On call with {contactName}</span>
              <span className="text-xs text-[#505a5f] font-mono">{formatDuration(duration)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 border transition-colors ${muted ? "bg-[#f47738] text-white border-[#f47738]" : "bg-white text-[#0b0c0c] border-[#b1b4b6] hover:bg-[#f3f2f1]"}`}
            >
              {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              onClick={endCall}
              className="flex items-center gap-1.5 bg-[#d4351c] text-white text-xs font-bold px-3 py-1.5 hover:bg-[#aa2a12] transition-colors"
            >
              <PhoneOff className="w-3 h-3" /> End Call
            </button>
          </div>
        </div>
      )}

      {/* Ended */}
      {callState === "ended" && (
        <div className="flex items-center gap-2 text-sm text-[#505a5f] px-1">
          <PhoneOff className="w-4 h-4" /> Call ended
        </div>
      )}

      {/* Error */}
      {callState === "error" && (
        <div className="bg-[#fde8e8] border border-[#d4351c]/30 px-4 py-3">
          <p className="text-sm text-[#d4351c] font-medium mb-2">⚠ {errorMsg || "Call failed"}</p>
          <div className="flex gap-2">
            <button onClick={() => { setCallState("idle"); setErrorMsg(""); }} className="text-xs text-[#1d70b8] hover:underline">Try again</button>
            <span className="text-xs text-[#505a5f]">or</span>
            <a href={`tel:${phoneNumber}`} className="text-xs text-[#1d70b8] hover:underline">Call via device</a>
          </div>
        </div>
      )}
    </div>
  );
}
