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

  useEffect(() => {
    checkMaintenanceMode();

    // Subscribe to maintenance mode changes
    const channel = supabase
      .channel("maintenance-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_mode",
        },
        () => {
          checkMaintenanceMode();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_mode")
        .select("*")
        .single();

      if (!error && data) {
        setMaintenance({
          enabled: data.enabled || false,
          message: data.message || "Site is under maintenance. We will be back soon.",
          estimated_back: data.estimated_back || null,
        });
      }
    } catch (err) {
      console.error("Error checking maintenance mode:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdmin = async () => {
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("is_admin, role")
      .eq("id", user.id)
      .single();
    return data?.is_admin === true || data?.role === "admin";
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
  if (maintenance?.enabled && !user) {
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
