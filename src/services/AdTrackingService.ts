import { supabase } from "@/integrations/supabase/client";

export class AdTrackingService {
  /**
   * Track ad impression
   */
  static async trackImpression(
    adId: string,
    userId?: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Insert impression record
      const { error: impressionError } = await supabase.from("ad_impressions").insert([
        {
          ad_id: adId,
          user_id: userId || null,
          viewed_at: new Date().toISOString(),
        },
      ]);

      if (impressionError) throw impressionError;

      // Increment ad impression count
      const { data: ad } = await supabase
        .from("advertisements")
        .select("impression_count")
        .eq("id", adId)
        .single();

      if (ad) {
        await supabase
          .from("advertisements")
          .update({ impression_count: ad.impression_count + 1 })
          .eq("id", adId);
      }

      return { success: true };
    } catch (error) {
      console.error("Error tracking impression:", error);
      return { success: false, error };
    }
  }

  /**
   * Track ad click
   */
  static async trackClick(
    adId: string,
    userId?: string,
    referrer?: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Insert click record
      const { error: clickError } = await supabase.from("ad_clicks").insert([
        {
          ad_id: adId,
          user_id: userId || null,
          referrer: referrer || document.referrer || null,
          clicked_at: new Date().toISOString(),
        },
      ]);

      if (clickError) throw clickError;

      // Increment ad click count
      const { data: ad } = await supabase
        .from("advertisements")
        .select("click_count")
        .eq("id", adId)
        .single();

      if (ad) {
        await supabase
          .from("advertisements")
          .update({ click_count: ad.click_count + 1 })
          .eq("id", adId);
      }

      return { success: true };
    } catch (error) {
      console.error("Error tracking click:", error);
      return { success: false, error };
    }
  }

  /**
   * Get ad performance stats
   */
  static async getAdStats(adId: string): Promise<{
    impressions: number;
    clicks: number;
    ctr: number;
  }> {
    try {
      const { data: ad } = await supabase
        .from("advertisements")
        .select("impression_count, click_count")
        .eq("id", adId)
        .single();

      if (!ad) {
        return { impressions: 0, clicks: 0, ctr: 0 };
      }

      const ctr =
        ad.impression_count > 0
          ? (ad.click_count / ad.impression_count) * 100
          : 0;

      return {
        impressions: ad.impression_count,
        clicks: ad.click_count,
        ctr: Math.round(ctr * 100) / 100,
      };
    } catch (error) {
      console.error("Error getting ad stats:", error);
      return { impressions: 0, clicks: 0, ctr: 0 };
    }
  }

  /**
   * Get active ads for a specific ad space
   */
  static async getActiveAds(adSpaceSlug: string): Promise<any[]> {
    try {
      // Get ad space
      const { data: adSpace } = await supabase
        .from("ad_spaces")
        .select("id")
        .eq("slug", adSpaceSlug)
        .eq("is_active", true)
        .single();

      if (!adSpace) return [];

      // Get active ads
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
        .order("priority", { ascending: false });

      return ads || [];
    } catch (error) {
      console.error("Error getting active ads:", error);
      return [];
    }
  }

  /**
   * Get sponsor performance stats
   */
  static async getSponsorStats(sponsorId: string): Promise<{
    totalImpressions: number;
    totalClicks: number;
    averageCTR: number;
    activeAds: number;
  }> {
    try {
      const { data: ads } = await supabase
        .from("advertisements")
        .select("impression_count, click_count, is_active")
        .eq("sponsor_id", sponsorId);

      if (!ads || ads.length === 0) {
        return {
          totalImpressions: 0,
          totalClicks: 0,
          averageCTR: 0,
          activeAds: 0,
        };
      }

      const totalImpressions = ads.reduce((sum, ad) => sum + ad.impression_count, 0);
      const totalClicks = ads.reduce((sum, ad) => sum + ad.click_count, 0);
      const averageCTR =
        totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const activeAds = ads.filter((ad) => ad.is_active).length;

      return {
        totalImpressions,
        totalClicks,
        averageCTR: Math.round(averageCTR * 100) / 100,
        activeAds,
      };
    } catch (error) {
      console.error("Error getting sponsor stats:", error);
      return {
        totalImpressions: 0,
        totalClicks: 0,
        averageCTR: 0,
        activeAds: 0,
      };
    }
  }

  /**
   * Get ad revenue for a date range
   */
  static async getRevenueByDateRange(
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { data } = await supabase
        .from("revenue_transactions")
        .select("amount")
        .eq("transaction_type", "advertisement")
        .eq("status", "completed")
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);

      if (!data) return 0;

      return data.reduce((sum, transaction) => sum + transaction.amount, 0);
    } catch (error) {
      console.error("Error getting ad revenue:", error);
      return 0;
    }
  }

  /**
   * Get top performing ads
   */
  static async getTopPerformingAds(limit: number = 10): Promise<any[]> {
    try {
      const { data } = await supabase
        .from("advertisements")
        .select(`
          *,
          sponsor:sponsors(*)
        `)
        .eq("is_active", true)
        .order("click_count", { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error("Error getting top performing ads:", error);
      return [];
    }
  }

  /**
   * Calculate CPM (Cost Per Mille - cost per 1000 impressions)
   */
  static calculateCPM(cost: number, impressions: number): number {
    if (impressions === 0) return 0;
    return (cost / impressions) * 1000;
  }

  /**
   * Calculate CPC (Cost Per Click)
   */
  static calculateCPC(cost: number, clicks: number): number {
    if (clicks === 0) return 0;
    return cost / clicks;
  }
}
