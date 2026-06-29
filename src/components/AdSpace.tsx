import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Advertisement } from "@/types/monetization";

interface AdSpaceProps {
  location: string;
  className?: string;
}

export function AdSpace({ location, className = "" }: AdSpaceProps) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [location]);

  const fetchAd = async () => {
    try {
      setLoading(true);

      // Get the ad space
      const { data: adSpace } = await supabase
        .from("ad_spaces")
        .select("id")
        .eq("slug", location)
        .eq("is_active", true)
        .single();

      if (!adSpace) {
        setLoading(false);
        return;
      }

      // Get active ads for this space
      const now = new Date().toISOString();
      const { data: ads } = await supabase
        .from("advertisements")
        .select(`
          *,
          sponsor:sponsors(*)
        `)
        .eq("ad_space_id", adSpace.id)
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("priority", { ascending: false })
        .limit(1);

      if (ads && ads.length > 0) {
        setAd(ads[0]);
        // Track impression
        trackImpression(ads[0].id);
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackImpression = async (adId: string) => {
    try {
      // Increment impression count
      const { data: currentAd } = await supabase
        .from("advertisements")
        .select("impression_count")
        .eq("id", adId)
        .single();

      if (currentAd) {
        await supabase
          .from("advertisements")
          .update({ impression_count: currentAd.impression_count + 1 })
          .eq("id", adId);
      }

      // Log impression
      await supabase.from("ad_impressions").insert([
        {
          ad_id: adId,
          viewed_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error tracking impression:", error);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    try {
      // Increment click count
      const { data: currentAd } = await supabase
        .from("advertisements")
        .select("click_count")
        .eq("id", ad.id)
        .single();

      if (currentAd) {
        await supabase
          .from("advertisements")
          .update({ click_count: currentAd.click_count + 1 })
          .eq("id", ad.id);
      }

      // Log click
      await supabase.from("ad_clicks").insert([
        {
          ad_id: ad.id,
          clicked_at: new Date().toISOString(),
        },
      ]);

      // Open destination URL
      window.open(ad.destination_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  if (loading || !ad) {
    return null;
  }

  return (
    <div className={`ad-space ${className}`}>
      {ad.html_content ? (
        // Custom HTML ad — key forces full remount when ad changes, preventing React DOM conflicts
        <div
          key={ad.id}
          className="cursor-pointer"
          onClick={handleClick}
          dangerouslySetInnerHTML={{ __html: ad.html_content }}
        />
      ) : ad.image_url ? (
        // Image ad
        <div
          className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 hover:border-blue-900 transition-colors"
          onClick={handleClick}
        >
          <img
            src={ad.image_url}
            alt={ad.title || "Advertisement"}
            className="w-full h-auto"
          />
          {ad.sponsor && (
            <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 border-t border-gray-200">
              Sponsored by {ad.sponsor.company_name}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
