import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, BookOpen, Link as LinkIcon, Megaphone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RevenueTransaction } from "@/types/monetization";

export default function AdminRevenue() {
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");
  const { toast } = useToast();

  useEffect(() => {
    fetchRevenue();
  }, [timeRange]);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
      
      const { data, error } = await supabase
        .from("revenue_transactions")
        .select("*")
        .gte("transaction_date", daysAgo.toISOString())
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const revenueByType = {
    course_sale: transactions
      .filter(t => t.transaction_type === "course_sale" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    subscription: transactions
      .filter(t => t.transaction_type === "subscription" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    affiliate_commission: transactions
      .filter(t => t.transaction_type === "affiliate_commission" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    sponsorship: transactions
      .filter(t => t.transaction_type === "sponsorship" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
    advertisement: transactions
      .filter(t => t.transaction_type === "advertisement" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const revenueByCountry = transactions
    .filter(t => t.status === "completed" && t.country_code)
    .reduce((acc, t) => {
      const country = t.country_code || "Unknown";
      acc[country] = (acc[country] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCountries = Object.entries(revenueByCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track all revenue streams</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm mb-2">Total Revenue ({timeRange} days)</p>
            <p className="text-5xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-green-100 mt-2">{transactions.filter(t => t.status === "completed").length} completed transactions</p>
          </div>
          <DollarSign className="w-24 h-24 text-green-300 opacity-50" />
        </div>
      </div>

      {/* Revenue by Type */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground">Course Sales</p>
          <p className="text-2xl font-bold">${revenueByType.course_sale.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-sm text-muted-foreground">Subscriptions</p>
          <p className="text-2xl font-bold">${revenueByType.subscription.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <LinkIcon className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">Affiliate</p>
          <p className="text-2xl font-bold">${revenueByType.affiliate_commission.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Megaphone className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-sm text-muted-foreground">Sponsorships</p>
          <p className="text-2xl font-bold">${revenueByType.sponsorship.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground">Advertisements</p>
          <p className="text-2xl font-bold">${revenueByType.advertisement.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Countries */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Top Countries by Revenue</h3>
          {topCountries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No country data available</p>
          ) : (
            <div className="space-y-3">
              {topCountries.map(([country, amount]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="font-medium">{country}</span>
                  <span className="text-green-600 font-semibold">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(revenueByType).map(([type, amount]) => {
              const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : "0.0";
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-lg">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No transactions found for this period
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 50).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm capitalize">
                      {transaction.transaction_type.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">
                      ${transaction.amount.toFixed(2)} {transaction.currency}
                    </td>
                    <td className="px-6 py-4 text-sm">{transaction.country_code || "-"}</td>
                    <td className="px-6 py-4">
                      {transaction.status === "completed" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>
                      )}
                      {transaction.status === "pending" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                      {transaction.status === "refunded" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Refunded</span>
                      )}
                      {transaction.status === "failed" && (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Failed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.payment_reference || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
