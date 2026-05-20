import { supabase } from "@/integrations/supabase/client";

export class AffiliateTrackingService {
  /**
   * Track affiliate product click
   */
  static async trackClick(
    productId: string,
    userId?: string,
    referrer?: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Get user's country (you might want to use a geolocation service)
      const countryCode = await this.getUserCountry();

      // Insert click record
      const { error: clickError } = await supabase.from("affiliate_clicks").insert([
        {
          product_id: productId,
          user_id: userId || null,
          referrer: referrer || document.referrer || null,
          country_code: countryCode,
          clicked_at: new Date().toISOString(),
        },
      ]);

      if (clickError) throw clickError;

      // Increment product click count
      const { data: product } = await supabase
        .from("affiliate_products")
        .select("click_count")
        .eq("id", productId)
        .single();

      if (product) {
        await supabase
          .from("affiliate_products")
          .update({ click_count: product.click_count + 1 })
          .eq("id", productId);
      }

      return { success: true };
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
      return { success: false, error };
    }
  }

  /**
   * Track affiliate conversion (when a purchase is made)
   */
  static async trackConversion(
    productId: string,
    conversionAmount: number,
    userId?: string
  ): Promise<{ success: boolean; error?: any }> {
    try {
      // Get the most recent click for this product and user
      let query = supabase
        .from("affiliate_clicks")
        .select("*")
        .eq("product_id", productId)
        .eq("converted", false)
        .order("clicked_at", { ascending: false })
        .limit(1);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: clicks } = await query;

      if (!clicks || clicks.length === 0) {
        return { success: false, error: "No matching click found" };
      }

      const click = clicks[0];

      // Update click with conversion data
      const { error: updateError } = await supabase
        .from("affiliate_clicks")
        .update({
          converted: true,
          conversion_amount: conversionAmount,
          converted_at: new Date().toISOString(),
        })
        .eq("id", click.id);

      if (updateError) throw updateError;

      // Update product stats
      const { data: product } = await supabase
        .from("affiliate_products")
        .select("conversion_count, revenue_generated")
        .eq("id", productId)
        .single();

      if (product) {
        await supabase
          .from("affiliate_products")
          .update({
            conversion_count: product.conversion_count + 1,
            revenue_generated: product.revenue_generated + conversionAmount,
          })
          .eq("id", productId);
      }

      // Create revenue transaction
      await supabase.from("revenue_transactions").insert([
        {
          transaction_type: "affiliate_commission",
          affiliate_product_id: productId,
          amount: conversionAmount,
          currency: "USD",
          status: "completed",
          country_code: click.country_code,
          transaction_date: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        },
      ]);

      return { success: true };
    } catch (error) {
      console.error("Error tracking conversion:", error);
      return { success: false, error };
    }
  }

  /**
   * Get affiliate product performance stats
   */
  static async getProductStats(productId: string): Promise<{
    clicks: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }> {
    try {
      const { data: product } = await supabase
        .from("affiliate_products")
        .select("click_count, conversion_count, revenue_generated")
        .eq("id", productId)
        .single();

      if (!product) {
        return { clicks: 0, conversions: 0, revenue: 0, conversionRate: 0 };
      }

      const conversionRate =
        product.click_count > 0
          ? (product.conversion_count / product.click_count) * 100
          : 0;

      return {
        clicks: product.click_count,
        conversions: product.conversion_count,
        revenue: product.revenue_generated,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      console.error("Error getting product stats:", error);
      return { clicks: 0, conversions: 0, revenue: 0, conversionRate: 0 };
    }
  }

  /**
   * Get top performing products
   */
  static async getTopProducts(limit: number = 10): Promise<any[]> {
    try {
      const { data } = await supabase
        .from("affiliate_products")
        .select("*")
        .eq("is_active", true)
        .order("revenue_generated", { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error("Error getting top products:", error);
      return [];
    }
  }

  /**
   * Get user's country code (simplified - in production use a proper geolocation service)
   */
  private static async getUserCountry(): Promise<string> {
    try {
      // In production, use a geolocation API like ipapi.co or MaxMind
      // For now, return a default
      return "US";
    } catch (error) {
      return "US";
    }
  }

  /**
   * Get affiliate revenue for a date range
   */
  static async getRevenueByDateRange(
    startDate: string,
    endDate: string
  ): Promise<number> {
    try {
      const { data } = await supabase
        .from("revenue_transactions")
        .select("amount")
        .eq("transaction_type", "affiliate_commission")
        .eq("status", "completed")
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);

      if (!data) return 0;

      return data.reduce((sum, transaction) => sum + transaction.amount, 0);
    } catch (error) {
      console.error("Error getting affiliate revenue:", error);
      return 0;
    }
  }
}
