import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PremiumStatus {
  isPremium: boolean;
  loading: boolean;
  subscription: any | null;
  plan: any | null;
}

export function usePremiumStatus(): PremiumStatus {
  const { user } = useAuth();
  const [status, setStatus] = useState<PremiumStatus>({
    isPremium: false,
    loading: true,
    subscription: null,
    plan: null,
  });

  useEffect(() => {
    if (!user) {
      setStatus({
        isPremium: false,
        loading: false,
        subscription: null,
        plan: null,
      });
      return;
    }

    checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;

    try {
      // Check if user has an active subscription
      const { data: subscription, error } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) {
        // Log error but don't break the app
        console.warn("Subscription check failed (table may not exist):", error.message);
        setStatus({
          isPremium: false,
          loading: false,
          subscription: null,
          plan: null,
        });
        return;
      }

      const isPremium = !!subscription && subscription.status === "active";

      setStatus({
        isPremium,
        loading: false,
        subscription: subscription || null,
        plan: subscription?.subscription_plans || null,
      });
    } catch (error) {
      console.warn("Error checking premium status:", error);
      setStatus({
        isPremium: false,
        loading: false,
        subscription: null,
        plan: null,
      });
    }
  };

  return status;
}
