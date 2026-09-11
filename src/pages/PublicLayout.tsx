import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MaintenancePage from "./MaintenancePage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function PublicLayout() {
  const { user } = useAuth();
  const [maintenance, setMaintenance] = useState<{
    enabled: boolean;
    message: string;
    estimated_back: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Debounce maintenance check to prevent race conditions
  let maintenanceCheckTimeout: NodeJS.Timeout;
  const debouncedCheckMaintenance = () => {
    clearTimeout(maintenanceCheckTimeout);
    maintenanceCheckTimeout = setTimeout(checkMaintenanceMode, 300);
  };

  useEffect(() => {
    checkMaintenanceMode();
    if (user) {
      checkIfUserIsAdmin();
    }

    // Subscribe to maintenance mode changes with debouncing
    const channel = supabase
      .channel("maintenance-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_mode",
        },
        (payload) => {
          console.log("Maintenance mode change detected:", payload);
          debouncedCheckMaintenance();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(maintenanceCheckTimeout);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkMaintenanceMode = async () => {
    try {
      // Try to get the maintenance config with fixed ID first
      const { data, error } = await supabase
        .from("maintenance_mode")
        .select("*")
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (error && error.code === 'PGRST116') {
        // No row with fixed ID found, try to get any row
        const { data: anyData, error: anyError } = await supabase
          .from("maintenance_mode")
          .select("*")
          .limit(1)
          .single();

        if (anyError && anyError.code === 'PGRST116') {
          // No rows at all - default to not in maintenance mode
          console.log("No maintenance_mode rows found, defaulting to disabled");
          setMaintenance({
            enabled: false,
            message: "Site is under maintenance. We will be back soon.",
            estimated_back: null,
          });
          return;
        } else if (anyError) {
          console.error("Error fetching any maintenance mode:", anyError);
          // Default to not in maintenance mode on error
          setMaintenance({
            enabled: false,
            message: "Site is under maintenance. We will be back soon.",
            estimated_back: null,
          });
          return;
        } else if (anyData) {
          setMaintenance({
            enabled: anyData.enabled || false,
            message: anyData.message || "Site is under maintenance. We will be back soon.",
            estimated_back: anyData.estimated_back || null,
          });
          return;
        }
      } else if (error) {
        console.error("Error fetching maintenance mode:", error);
        // Default to not in maintenance mode on error
        setMaintenance({
          enabled: false,
          message: "Site is under maintenance. We will be back soon.",
          estimated_back: null,
        });
        return;
      }

      if (data) {
        console.log("Maintenance mode data:", data);
        setMaintenance({
          enabled: data.enabled || false,
          message: data.message || "Site is under maintenance. We will be back soon.",
          estimated_back: data.estimated_back || null,
        });
      } else {
        // No data found, default to not in maintenance mode
        setMaintenance({
          enabled: false,
          message: "Site is under maintenance. We will be back soon.",
          estimated_back: null,
        });
      }
    } catch (err) {
      console.error("Error checking maintenance mode:", err);
      // Default to not in maintenance mode on error
      setMaintenance({
        enabled: false,
        message: "Site is under maintenance. We will be back soon.",
        estimated_back: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserIsAdmin = async () => {
    if (!user) {
      setIsUserAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        setIsUserAdmin(false);
        return;
      }

      setIsUserAdmin(data?.is_admin === true || data?.role === "admin");
    } catch (err) {
      console.error("Error checking admin status:", err);
      setIsUserAdmin(false);
    }
  };

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If maintenance mode is on and user is not admin, show maintenance page
  if (maintenance?.enabled && (!user || !isUserAdmin)) {
    return (
      <MaintenancePage
        message={maintenance.message}
        estimatedBack={maintenance.estimated_back || undefined}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
