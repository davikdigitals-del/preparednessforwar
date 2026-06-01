import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    // Supabase puts the tokens in the URL hash: #access_token=...&type=recovery
    // We need to extract them and set the session manually.
    const hash = window.location.hash;

    // Check for error in hash or query string
    const params = new URLSearchParams(hash.replace("#", "?"));
    const errorCode = params.get("error_code") || new URLSearchParams(window.location.search).get("error_code");
    if (errorCode) {
      setLinkError("This reset link has expired or already been used. Please request a new one.");
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (accessToken && type === "recovery") {
      // Set the session using the tokens from the URL
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || "" })
        .then(({ error }) => {
          if (error) {
            setLinkError("This reset link has expired or already been used. Please request a new one.");
          } else {
            setSessionReady(true);
            // Clean the hash from the URL
            window.history.replaceState(null, "", window.location.pathname);
          }
        });
      return;
    }

    // Fallback: listen for PASSWORD_RECOVERY event (some Supabase versions)
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });

    // If no token in hash after 4 seconds, show expired message
    const timer = setTimeout(() => {
      if (!sessionReady) {
        setLinkError("This reset link has expired or already been used. Please request a new one.");
      }
    }, 4000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message || "Failed to update password. Please request a new reset link.");
    } else {
      setDone(true);
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Password updated</h2>
            <p className="text-sm text-muted-foreground">
              Your password has been changed. Redirecting you to sign in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Expired / invalid link ────────────────────────────────────────────────
  if (linkError) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Link expired</h2>
            <p className="text-sm text-muted-foreground mb-6">{linkError}</p>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Request a new reset link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Verifying ─────────────────────────────────────────────────────────────
  if (!sessionReady) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verifying reset link…</h2>
            <p className="text-sm text-muted-foreground">Just a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Set new password form ─────────────────────────────────────────────────
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-900 flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-bold text-lg text-white">PH</span>
          </div>
          <CardTitle className="font-display text-2xl">Set New Password</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
            )}
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  minLength={8}
                  className="pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
