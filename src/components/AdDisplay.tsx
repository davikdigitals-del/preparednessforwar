import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdDisplayProps {
  location: "homepage" | "article" | "dashboard" | "newsletter";
  className?: string;
}

interface AdPurchase {
  id: string;
  title: string;
  image_url: string;
  destination_url: string;
  placement_name: string;
}

export function AdDisplay({ location, className = "" }: AdDisplayProps) {
  const [ad, setAd] = useState<AdPurchase | null>(null);

  useEffect(() => {
    fetchAd();
  }, [location]);

  const fetchAd = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("ad_purchases")
        .select("id, title, image_url, destination_url, placement_name")
        .eq("is_active", true)
        .eq("payment_status", "paid")
        .eq("placement_location", location)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setAd(data);
        trackImpression(data.id);
      }
    } catch {
      // No ad available — silent fail
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      await supabase.rpc("increment_ad_impression", { ad_id: adId });
    } catch {
      // Non-critical
    }
  };

  const handleClick = async () => {
    if (!ad) return;
    try {
      await supabase.rpc("increment_ad_click", { ad_id: ad.id });
    } catch {
      // Non-critical
    }
    window.open(ad.destination_url, "_blank", "noopener,noreferrer");
  };

  if (!ad) return null;

  return (
    <div className={`ad-display ${className}`}>
      <div
        className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all"
        onClick={handleClick}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        aria-label={`Advertisement: ${ad.title}`}
      >
        <img
          src={ad.image_url}
          alt={ad.title}
          className="w-full h-auto block"
          loading="lazy"
        />
        <div className="bg-gray-50 px-3 py-1.5 text-xs text-gray-500 border-t border-gray-200 flex items-center justify-between">
          <span>Advertisement</span>
          <span className="text-gray-400">{ad.placement_name}</span>
        </div>
      </div>
    </div>
  );
}
