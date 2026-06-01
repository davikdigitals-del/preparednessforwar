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

  // Supabase sends the user back with a session via the URL hash.
  // We need to wait for onAuthStateChange to pick it up.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    return () => listener.subscription.unsubscribe();
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
      setError(error.message || "Failed to update password. The link may have expired.");
    } else {
      setDone(true);
      // Sign out so user logs in fresh with new password
      await supabase.auth.signOut();
      setTimeout(() => navigate("/signin"), 3000);
    }
  };

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

  if (!sessionReady) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Verifying reset link…</h2>
            <p className="text-sm text-muted-foreground mb-6">
              If this takes more than a few seconds, your link may have expired.
            </p>
            <Button variant="outline" onClick={() => navigate("/signin")}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
