import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReCaptcha } from "@/components/ReCaptcha";
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SignInPage() {
  const { login, signInWithGoogle, signInWithApple, signInWithDiscord } = useAuth();
  const navigate = useNavigate();

  // Sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastSignInMethod, setLastSignInMethod] = useState<string | null>(null);

  // Forgot password state
  const [view, setView] = useState<"signin" | "forgot" | "sent">("signin");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const recaptchaEnabled = !!recaptchaSiteKey;

  // Get last sign-in method on mount
  useState(() => {
    const lastMethod = localStorage.getItem('lastSignInMethod');
    setLastSignInMethod(lastMethod);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (recaptchaEnabled && !recaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }

    setLoading(true);
    const ok = await login(email, password);

    if (ok) {
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please check your email and password.");
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);

    if (error) {
      setResetError(error.message || "Something went wrong. Please try again.");
    } else {
      setView("sent");
    }
  };

  // ── Forgot password — sent confirmation ──────────────────────────────────
  if (view === "sent") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We sent a password reset link to <strong>{resetEmail}</strong>. Check your spam folder if you don't see it within a minute.
            </p>
            <Button variant="outline" className="w-full" onClick={() => { setView("signin"); setResetEmail(""); }}>
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Forgot password — email form ─────────────────────────────────────────
  if (view === "forgot") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-900 flex items-center justify-center mx-auto mb-3">
              <span className="font-display font-bold text-lg text-white">PH</span>
            </div>
            <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email and we'll send you a reset link
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {resetError && (
                <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{resetError}</p>
              )}
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <button
                type="button"
                onClick={() => { setView("signin"); setResetError(""); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Sign in form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-blue-900 flex items-center justify-center mx-auto mb-3">
            <span className="font-display font-bold text-lg text-white">PH</span>
          </div>
          <CardTitle className="font-display text-2xl">Sign In</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Access your Preparedness Hub account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Password</Label>
                <button
                  type="button"
                  onClick={() => { setResetEmail(email); setView("forgot"); setResetError(""); }}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="pr-10"
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

            {recaptchaEnabled && (
              <div className="flex justify-center">
                <ReCaptcha
                  key="signin-recaptcha"
                  siteKey={recaptchaSiteKey}
                  onVerify={(token) => setRecaptchaToken(token)}
                  onExpired={() => setRecaptchaToken("")}
                  onError={() => setRecaptchaToken("")}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {lastSignInMethod && (
              <div className="text-center mb-3">
                <p className="text-xs text-muted-foreground">
                  Last used: <span className="font-semibold text-primary capitalize">{lastSignInMethod === 'email' ? 'Email & Password' : lastSignInMethod}</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={signInWithGoogle}
                className={`w-full flex items-center justify-center transition-all ${
                  lastSignInMethod === 'google' 
                    ? 'ring-2 ring-primary ring-offset-2 bg-blue-50 hover:bg-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
                title="Sign in with Google"
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={signInWithApple}
                className={`w-full flex items-center justify-center transition-all ${
                  lastSignInMethod === 'apple' 
                    ? 'ring-2 ring-primary ring-offset-2 bg-gray-50 hover:bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}
                title="Sign in with Apple"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={signInWithDiscord}
                className={`w-full flex items-center justify-center transition-all ${
                  lastSignInMethod === 'discord' 
                    ? 'ring-2 ring-primary ring-offset-2 bg-indigo-50 hover:bg-indigo-100' 
                    : 'hover:bg-indigo-50'
                }`}
                title="Sign in with Discord"
              >
                <svg width="20" height="20" viewBox="0 0 71 55" fill="#5865F2">
                  <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"/>
                </svg>
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-alert hover:underline font-semibold">Create one</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
