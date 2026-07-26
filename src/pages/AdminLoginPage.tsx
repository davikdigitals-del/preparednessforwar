import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReCaptcha } from "@/components/ReCaptcha";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      {PASSWORD_RULES.map(rule => (
        <div key={rule.label} className="flex items-center gap-1.5">
          {rule.test(password)
            ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
          <span className={`text-xs ${rule.test(password) ? "text-green-600" : "text-muted-foreground"}`}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginRecaptchaToken, setLoginRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regRecaptchaToken, setRegRecaptchaToken] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const recaptchaEnabled = !!recaptchaSiteKey;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (recaptchaEnabled && !loginRecaptchaToken) {
      setError("Please complete the reCAPTCHA verification.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign in with Supabase directly first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError || !data.user) {
        setLoading(false);
        setError("Invalid credentials. Please check your email and password.");
        return;
      }

      // Wait briefly for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if this user is actually an admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin, role")
        .eq("id", data.user.id)
        .maybeSingle();

      console.log("Profile:", profile, "Error:", profileError);

      // If RLS blocks the read, fall back to checking auth metadata
      const metaIsAdmin = data.user.user_metadata?.is_admin === true ||
                          data.user.raw_user_meta_data?.is_admin === true;

      const isAdmin = profile?.is_admin === true || profile?.role === "admin" || metaIsAdmin;

      if (!isAdmin) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("Access denied. This portal is for administrators only.");
        return;
      }

      // Confirmed admin — navigate to admin portal
      // adminLogin will re-read the profile but we force navigation regardless
      setLoading(false);
      await adminLogin(email, password);
      navigate("/admin");
    } catch (err) {
      console.error("Admin login error:", err);
      setLoading(false);
      setError("An error occurred during login. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!EMAIL_REGEX.test(regEmail)) {
      setRegError("Please enter a valid email address.");
      return;
    }

    const isStrong = PASSWORD_RULES.every(r => r.test(regPassword));
    if (!isStrong) {
      setRegError("Please choose a stronger password that meets all requirements.");
      return;
    }

    if (recaptchaEnabled && !regRecaptchaToken) {
      setRegError("Please complete the reCAPTCHA verification.");
      return;
    }
    
    setRegLoading(true);

    try {
      // Sign up with is_admin=true in metadata — the DB trigger will set admin role
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: { name: regName, is_admin: true },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) {
        // "Error sending confirmation email" means the account WAS created
        // but Supabase's email service is rate-limited — treat this as success
        if (signUpError.message?.toLowerCase().includes("sending confirmation email") ||
            signUpError.message?.toLowerCase().includes("email") && signUpError.status === 500) {
          // Account created — just can't send email right now
          await supabase.auth.signOut();
          setRegLoading(false);
          setTab("login");
          setEmail(regEmail);
          setPassword("");
          setError("✅ Admin account created! Email confirmation is temporarily unavailable — you can sign in directly below.");
          return;
        }
        setRegError(signUpError.message);
        setRegLoading(false);
        return;
      }

      if (!signUpData?.user) {
        setRegError("Account creation failed. Please try again.");
        setRegLoading(false);
        return;
      }

      // Supabase returns identities=[] when email already exists
      if (signUpData.user.identities?.length === 0) {
        setRegError("This email is already registered. Please use a different email or sign in.");
        setRegLoading(false);
        return;
      }

      // Sign out immediately — admin must confirm email then sign in
      await supabase.auth.signOut();

      setRegLoading(false);
      setTab("login");
      setEmail(regEmail);
      setPassword("");
      setError("✅ Admin account created! Check your email to confirm your account, then sign in.");
    } catch (error: any) {
      console.error("Registration exception:", error);
      setRegError(error?.message || "An error occurred during registration. Please try again.");
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Admin Portal</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Preparedness Hub Administration</p>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
                <div>
                  <Label htmlFor="login-email">Admin Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                      key="admin-login-recaptcha"
                      siteKey={recaptchaSiteKey}
                      onVerify={(token) => setLoginRecaptchaToken(token)}
                      onExpired={() => setLoginRecaptchaToken("")}
                      onError={() => setLoginRecaptchaToken("")}
                    />
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Authenticating..." : "Login to Admin"}</Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" autoComplete="on">
                {regError && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{regError}</p>}
                <div>
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    id="reg-name"
                    name="name"
                    autoComplete="name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-email">Admin Email</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
                    title="Please enter a valid email address"
                  />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      name="password"
                      type={showRegPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min 8 chars, uppercase, number, symbol"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showRegPassword ? "Hide password" : "Show password"}
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={regPassword} />
                </div>

                {recaptchaEnabled && (
                  <div className="flex justify-center">
                    <ReCaptcha
                      key="admin-register-recaptcha"
                      siteKey={recaptchaSiteKey}
                      onVerify={(token) => setRegRecaptchaToken(token)}
                      onExpired={() => setRegRecaptchaToken("")}
                      onError={() => setRegRecaptchaToken("")}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={regLoading || !PASSWORD_RULES.every(r => r.test(regPassword))}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  {regLoading ? "Creating..." : "Create Admin Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back to public site</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
