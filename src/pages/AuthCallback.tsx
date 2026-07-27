import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// This page handles OAuth redirects
// Supabase redirects here after Google/Apple/Discord sign-in
export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent") || "signin";

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        navigate("/login");
        return;
      }

      const user = session.user;
      const identities = user.identities || [];
      const isOAuth = identities.length > 0 && identities[0].provider !== "email";

      if (isOAuth) {
        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60000; // within last 60 seconds

        if (isNewUser && intent === "signin") {
          // New user came from sign-in page — delete account and send to subscribe
          try {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-unsubscribed-user`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({ userId: user.id }),
              }
            );
          } catch (e) {
            console.warn("Could not delete user:", e);
          }

          await supabase.auth.signOut();
          navigate("/subscribe?from=signup");
          return;
        }

        if (isNewUser && intent === "signup") {
          // New user from sign-up page — go to subscribe
          await supabase.auth.signOut();
          navigate("/subscribe?from=signup");
          return;
        }
      }

      // Existing user or email user — go to dashboard
      navigate("/dashboard");
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
