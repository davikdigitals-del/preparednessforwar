import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Handles OAuth redirects from Google/Apple/Discord
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent") || "signin";

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        window.location.replace("/login");
        return;
      }

      const user = session.user;
      const identities = user.identities || [];
      const isOAuth = identities.length > 0 && identities[0].provider !== "email";

      if (isOAuth) {
        const createdAt = new Date(user.created_at).getTime();
        const isNewUser = Date.now() - createdAt < 60000;

        if (isNewUser && (intent === "signin" || intent === "signup")) {
          // New user — must subscribe first
          // Store userId for deletion after signout
          const userId = user.id;

          // Sign out first — this clears the session
          await supabase.auth.signOut();

          // Delete account in background (fire and forget)
          fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-unsubscribed-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({ userId }),
            }
          ).catch(() => {});

          // Full page replace so AuthContext resets completely — no session in header
          window.location.replace("/subscribe?from=signup");
          return;
        }
      }

      // Existing user — go to dashboard
      window.location.replace("/dashboard");
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}
