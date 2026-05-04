import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReCaptcha } from "@/components/ReCaptcha";

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
    const ok = await adminLogin(email, password);
    setLoading(false);
    if (ok) navigate("/admin");
    else setError("Invalid admin credentials or no admin role on this account.");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (regPassword.length < 6) { setRegError("Password must be at least 6 characters."); return; }
    
    if (recaptchaEnabled && !regRecaptchaToken) {
      setRegError("Please complete the reCAPTCHA verification.");
      return;
    }
    
    setRegLoading(true);

    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: { name: regName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setRegError(error.message);
      setRegLoading(false);
      return;
    }

    // Mark the new account as admin immediately
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: regEmail,
      password: regPassword,
    });
    if (signInData?.user) {
      await supabase.from("profiles").upsert(
        {
          id: signInData.user.id,
          email: regEmail,
          name: regName,
          country: "GB",
          is_admin: true,
          role: "admin",
        },
        { onConflict: "id" }
      );
      await supabase.from("user_roles").upsert(
        { user_id: signInData.user.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      await supabase.auth.signOut();
    }

    setRegLoading(false);
    setTab("login");
    setEmail(regEmail);
    setPassword(regPassword);
    setRegError("Account created. Sign in now — first admin login is auto-bootstrapped if no admin exists.");
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
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>}
                <div><Label>Admin Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
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
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{regError}</p>}
                <div><Label>Full Name</Label><Input value={regName} onChange={(e) => setRegName(e.target.value)} required /></div>
                <div><Label>Admin Email</Label><Input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required /></div>
                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input 
                      type={showRegPassword ? "text" : "password"} 
                      value={regPassword} 
                      onChange={(e) => setRegPassword(e.target.value)} 
                      required 
                      minLength={6}
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
                
                <Button type="submit" className="w-full" disabled={regLoading}>
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
