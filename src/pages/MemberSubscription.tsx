import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Crown, CheckCircle, Loader2, Calendar, CreditCard, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { PortalBreadcrumb } from "@/components/PortalBreadcrumb";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
  subscription_plans?: SubscriptionPlan;
}

export default function MemberSubscription() {
  const { user, loading: authLoading } = useAuth();
  const { isPremium, plan: currentPlan } = usePremiumStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();

    // Real-time updates
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscription_plans'
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch all active plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (plansError) throw plansError;
      setPlans(plansData || []);

      // Fetch user's current subscription
      const { data: subData, error: subError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq("user_id", user.id)
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setSubscription(subData);
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

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmMessage = "⚠️ WARNING: Cancelling your subscription will PERMANENTLY DELETE your entire account and all data. This cannot be undone. Are you sure you want to continue?";

    if (!confirm(confirmMessage)) {
      return;
    }

    // Double confirmation for permanent deletion
    const doubleConfirm = confirm("FINAL CONFIRMATION: This will permanently delete your account and ALL your data including saved articles, preparedness plans, emergency contacts, and everything else. Are you absolutely sure?");
    if (!doubleConfirm) return;

    setUpdateLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Account Deleted",
        description: "Your subscription has been cancelled and your account has been permanently deleted.",
        variant: "destructive",
      });

      // User will be automatically logged out since account is deleted
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAutoRenewalToggle = async (enabled: boolean) => {
    if (!subscription) return;

    setUpdateLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('toggle-auto-renewal', {
        body: { auto_renew: enabled }
      });

      if (error) throw error;

      toast({
        title: enabled ? "Auto-Renewal Enabled" : "Auto-Renewal Disabled",
        description: data.message,
      });

      fetchData(); // Refresh subscription data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    navigate(`/subscribe?plan=${planId}`);
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-4">Loading subscription details...</p>
      </div>
    );
  }

  const freePlan = plans.find(p => p.slug === 'free');
  const paidPlans = plans.filter(p => p.slug !== 'free');

  // Filter plans based on selected billing interval
  const filteredPlans = paidPlans.filter(plan => plan.interval === billingInterval);

  // Calculate yearly savings
  const monthlyPlan = paidPlans.find(p => p.interval === 'month');
  const yearlyPlan = paidPlans.find(p => p.interval === 'year');
  const yearlySavings = monthlyPlan && yearlyPlan
    ? (monthlyPlan.price * 12 - yearlyPlan.price).toFixed(2)
    : null;

  return (
    <div className="container py-6 sm:py-8 max-w-6xl px-4 sm:px-6">
      <PortalBreadcrumb items={[{ label: "My Subscription" }]} />
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your subscription and billing</p>
      </div>

      {/* Current Subscription Status */}
      <Card className="mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription && subscription.status === 'active' ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{subscription.subscription_plans?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      £{subscription.subscription_plans?.price} / {subscription.subscription_plans?.interval}
                    </p>
                  </div>
                </div>
                <Badge className="bg-[#00703c] self-start">Active</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Started:</span>
                  <span className="font-medium">
                    {new Date(subscription.started_at).toLocaleDateString()}
                  </span>
                </div>
                {subscription.expires_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {subscription.auto_renew ? 'Auto-renews:' : 'Expires:'}
                    </span>
                    <span className="font-medium">
                      {new Date(subscription.expires_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Auto-Renewal Toggle */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Auto-Renewal</div>
                    <p className="text-xs text-muted-foreground">
                      Automatically renew your subscription before it expires
                    </p>
                  </div>
                  <Switch
                    checked={subscription.auto_renew}
                    onCheckedChange={handleAutoRenewalToggle}
                    disabled={updateLoading}
                  />
                </div>

                {subscription.auto_renew && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-800">
                        Your subscription will automatically renew on{' '}
                        <span className="font-medium">
                          {subscription.expires_at && new Date(subscription.expires_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {!subscription.auto_renew && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <p className="text-sm text-amber-800">
                        Auto-renewal is disabled. Your subscription will expire on{' '}
                        <span className="font-medium">
                          {subscription.expires_at && new Date(subscription.expires_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {subscription.subscription_plans?.features && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Your Benefits:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {subscription.subscription_plans.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#00703c] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cancellation Section */}
              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Subscription Management</h4>

                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium mb-1">⚠️ Important Notice</p>
                        <p>Cancelling your subscription will permanently delete your entire account and all data. This cannot be undone.</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    disabled={updateLoading}
                    onClick={handleCancelSubscription}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    {updateLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Cancel Subscription & Delete Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                You're currently on the free plan. Upgrade to unlock premium features!
              </p>
              {freePlan && (
                <div className="inline-block text-left bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="font-medium mb-2">Free Plan Includes:</p>
                  <ul className="space-y-1">
                    {freePlan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-[#00703c] flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-4">
          {isPremium ? "Upgrade Your Plan" : "Choose a Plan"}
        </h2>
        <p className="text-muted-foreground mb-6">
          Select the plan that best fits your needs
        </p>

        {/* Billing Interval Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${billingInterval === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${billingInterval === 'year'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
          >
            Yearly
            {yearlySavings && (
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                Save £{yearlySavings}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredPlans.map((plan) => {
          const isCurrentPlan = subscription?.plan_id === plan.id;
          const isPopular = plan.slug === 'premium-monthly';

          return (
            <Card
              key={plan.id}
              className={`relative ${isPopular
                ? 'border-2 border-primary shadow-lg'
                : 'border-2 border-border'
                } ${isCurrentPlan ? 'bg-primary/5' : ''}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-[#00703c]">Current Plan</Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold mb-2">
                  {plan.name}
                </CardTitle>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    £{plan.price}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    per {plan.interval}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-[#00703c] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan}
                  variant={isCurrentPlan ? 'outline' : isPopular ? 'default' : 'outline'}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    <>
                      {isPremium ? 'Switch Plan' : 'Subscribe Now'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div>
              <CheckCircle className="w-8 h-8 text-[#00703c] mx-auto mb-2" />
              <h4 className="font-bold mb-1">Cancel Anytime</h4>
              <p className="text-sm text-muted-foreground">
                No long-term commitments. Cancel whenever you want.
              </p>
            </div>
            <div>
              <CreditCard className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-bold mb-1">Secure Payments</h4>
              <p className="text-sm text-muted-foreground">
                Powered by Stripe. Your payment info is safe.
              </p>
            </div>
            <div>
              <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
              <h4 className="font-bold mb-1">Instant Access</h4>
              <p className="text-sm text-muted-foreground">
                Get immediate access to all premium features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
