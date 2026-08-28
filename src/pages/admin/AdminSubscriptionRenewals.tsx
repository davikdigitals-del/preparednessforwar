import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, RefreshCw, Users, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpcomingRenewal {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  expires_at: string;
  next_billing_date: string;
  auto_renew: boolean;
  renewal_attempts: number;
  plan_name: string;
  price: number;
  currency: string;
  interval: string;
  user_email: string;
  user_name: string;
}

interface RenewalStats {
  total_renewals: number;
  successful_renewals: number;
  failed_renewals: number;
  success_rate: number;
  total_revenue: number;
}

export default function AdminSubscriptionRenewals() {
  const [upcomingRenewals, setUpcomingRenewals] = useState<UpcomingRenewal[]>([]);
  const [renewalStats, setRenewalStats] = useState<RenewalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingRenewals, setProcessingRenewals] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUpcomingRenewals(),
        loadRenewalStats()
      ]);
    } catch (error) {
      console.error("Error loading renewal data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingRenewals = async () => {
    try {
      const { data, error } = await supabase
        .from("upcoming_renewals")
        .select("*")
        .limit(50);

      if (error) throw error;
      setUpcomingRenewals(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const loadRenewalStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc("get_renewal_stats", { days_back: 30 });

      if (error) throw error;
      if (data && data.length > 0) {
        setRenewalStats(data[0]);
      }
    } catch (error: any) {
      console.error("Error loading renewal stats:", error);
    }
  };

  const processRenewals = async () => {
    setProcessingRenewals(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-subscription-renewals');
      
      if (error) throw error;
      
      toast({ 
        title: "Success", 
        description: `Processed ${data.processed || 0} subscription renewals` 
      });
      
      // Reload data after processing
      loadData();
      
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: `Failed to process renewals: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setProcessingRenewals(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Subscription Renewals</h1>
          <p className="text-gray-600 mt-1">Manage subscription renewals and billing</p>
        </div>
        <Button 
          onClick={processRenewals}
          disabled={processingRenewals}
          className="gap-2"
        >
          {processingRenewals ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Process Renewals
        </Button>
      </div>

      {/* Stats Cards */}
      {renewalStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Renewals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{renewalStats.total_renewals}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{renewalStats.success_rate}%</div>
              <p className="text-xs text-muted-foreground">
                {renewalStats.successful_renewals} of {renewalStats.total_renewals}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(renewalStats.total_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Renewals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {renewalStats.failed_renewals}
              </div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Renewals (Next 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingRenewals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming renewals in the next 7 days
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRenewals.map((renewal) => (
                <div
                  key={renewal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold">
                        {renewal.user_name || renewal.user_email}
                      </div>
                      <Badge variant="outline">
                        {renewal.plan_name}
                      </Badge>
                      {renewal.auto_renew ? (
                        <Badge variant="default">Auto-Renew</Badge>
                      ) : (
                        <Badge variant="secondary">Manual</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="mr-4">
                        Next billing: {formatDate(renewal.next_billing_date)}
                      </span>
                      <span className="mr-4">
                        Amount: {formatCurrency(renewal.price, renewal.currency)}
                      </span>
                      {renewal.renewal_attempts > 0 && (
                        <span className="text-orange-600">
                          Attempts: {renewal.renewal_attempts}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(renewal.price, renewal.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {renewal.interval}ly
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}