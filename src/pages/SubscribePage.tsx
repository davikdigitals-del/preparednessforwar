import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle, Loader2, Shield, Zap, BadgePercent } from 'lucide-react';

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

export default function SubscribePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const planIdFromUrl = searchParams.get('plan');
  const fromSignup = searchParams.get('from') === 'signup';

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    const channel = supabase
      .channel('subscription_plans_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_plans' }, fetchPlans)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Auto-select tab if plan ID is in URL
  useEffect(() => {
    if (planIdFromUrl && plans.length > 0) {
      const plan = plans.find(p => p.id === planIdFromUrl);
      if (plan) setBillingInterval(plan.interval === 'year' ? 'year' : 'month');
    }
  }, [planIdFromUrl, plans]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .neq('slug', 'free')
        .order('price', { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast({ title: 'Error loading plans', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setProcessingId(plan.id);
    setSelectedPlan(plan);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const successUrl = fromSignup
        ? `${window.location.origin}/signup?payment=success`
        : `${window.location.origin}/dashboard?payment=success`;
      const cancelUrl = `${window.location.origin}/subscribe?plan=${plan.id}${fromSignup ? '&from=signup' : ''}`;

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            planId: plan.id,
            userId: currentUser?.id || null,
            userEmail: currentUser?.email || null,
            successUrl,
            cancelUrl,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create checkout session');
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to open checkout. Please try again.',
        variant: 'destructive',
      });
      setSelectedPlan(null);
      setProcessingId(null);
    }
  };

  // Filter plans by billing interval
  const monthlyPlans = plans.filter(p => p.interval === 'month');
  const yearlyPlans = plans.filter(p => p.interval === 'year');
  const displayPlans = billingInterval === 'month' ? monthlyPlans : yearlyPlans;

  // Calculate yearly savings vs monthly
  const getYearlySavings = (yearlyPlan: SubscriptionPlan) => {
    // Find equivalent monthly plan by matching name pattern
    const monthlyEquivalent = monthlyPlans.find(m =>
      m.name.toLowerCase().replace(/monthly|yearly|annual/gi, '').trim() ===
      yearlyPlan.name.toLowerCase().replace(/monthly|yearly|annual/gi, '').trim()
    ) || monthlyPlans[0];
    if (!monthlyEquivalent) return null;
    const monthlyTotal = monthlyEquivalent.price * 12;
    const saved = monthlyTotal - yearlyPlan.price;
    if (saved <= 0) return null;
    const pct = Math.round((saved / monthlyTotal) * 100);
    return { amount: saved.toFixed(2), pct };
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-muted-foreground">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 py-16 px-4">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">
          {fromSignup ? 'Choose Your Plan' : 'Upgrade to Premium'}
        </h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          {fromSignup
            ? 'Join thousands preparing for what matters most'
            : 'Unlock full access to all content, courses, and resources'}
        </p>
      </div>

      {/* Billing toggle */}
      {monthlyPlans.length > 0 && yearlyPlans.length > 0 && (
        <div className="flex items-center justify-center mb-10">
          <div className="bg-white/10 rounded-full p-1 flex items-center gap-1">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingInterval === 'month'
                  ? 'bg-white text-blue-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingInterval === 'year'
                  ? 'bg-white text-blue-900'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Yearly
              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                SAVE UP TO 20%
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Plans grid */}
      {displayPlans.length === 0 ? (
        <div className="text-center text-blue-200 py-12">
          <p>No {billingInterval === 'month' ? 'monthly' : 'yearly'} plans available yet.</p>
          {billingInterval === 'year' && monthlyPlans.length > 0 && (
            <button onClick={() => setBillingInterval('month')} className="mt-3 text-white underline text-sm">
              View monthly plans instead
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 max-w-5xl mx-auto ${
          displayPlans.length === 1 ? 'grid-cols-1 max-w-md' :
          displayPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {displayPlans.map((plan, idx) => {
            const isPopular = idx === 0 || plan.slug.includes('popular') || plan.slug.includes('premium');
            const isHighlighted = plan.id === planIdFromUrl;
            const isProcessing = processingId === plan.id;
            const savings = billingInterval === 'year' ? getYearlySavings(plan) : null;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-transform ${
                  isPopular || isHighlighted ? 'scale-105' : ''
                }`}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full shadow">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Savings badge */}
                {savings && (
                  <div className="absolute -top-4 right-4 z-10">
                    <span className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                      <BadgePercent className="w-3 h-3" />
                      Save {savings.pct}%
                    </span>
                  </div>
                )}

                <Card className={`h-full border-2 overflow-hidden ${
                  isPopular || isHighlighted
                    ? 'border-yellow-400 bg-white'
                    : 'border-white/20 bg-white/5 text-white'
                }`}>
                  <CardHeader className={`text-center pb-4 ${isPopular || isHighlighted ? '' : 'text-white'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      isPopular || isHighlighted ? 'bg-primary/10' : 'bg-white/10'
                    }`}>
                      {isPopular ? <Zap className="w-6 h-6 text-primary" /> : <Shield className="w-6 h-6 text-blue-200" />}
                    </div>
                    <CardTitle className={`text-xl mb-1 ${isPopular || isHighlighted ? 'text-gray-900' : 'text-white'}`}>
                      {plan.name}
                    </CardTitle>
                    <div className={`text-4xl font-black mt-2 ${isPopular || isHighlighted ? 'text-primary' : 'text-white'}`}>
                      £{plan.price}
                      <span className={`text-base font-normal ml-1 ${isPopular || isHighlighted ? 'text-muted-foreground' : 'text-blue-200'}`}>
                        /{plan.interval === 'year' ? 'yr' : 'mo'}
                      </span>
                    </div>
                    {savings && (
                      <p className="text-green-600 text-sm font-semibold mt-1">
                        Save £{savings.amount} vs monthly
                      </p>
                    )}
                    {plan.interval === 'year' && (
                      <p className={`text-xs mt-1 ${isPopular || isHighlighted ? 'text-muted-foreground' : 'text-blue-300'}`}>
                        £{(plan.price / 12).toFixed(2)}/month billed annually
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    <ul className="space-y-2.5">
                      {(plan.features || []).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            isPopular || isHighlighted ? 'text-green-500' : 'text-green-400'
                          }`} />
                          <span className={`text-sm ${isPopular || isHighlighted ? 'text-gray-700' : 'text-blue-100'}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full font-bold py-6 text-base rounded-xl ${
                        isPopular || isHighlighted
                          ? 'bg-primary hover:bg-primary/90 text-white'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'
                      }`}
                      onClick={() => handleSelectPlan(plan)}
                      disabled={!!processingId}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening checkout...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          {fromSignup ? 'Get Started' : 'Subscribe Now'}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Trust badges */}
      <div className="mt-12 text-center space-y-2">
        <div className="flex items-center justify-center gap-6 text-blue-200 text-sm">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Secure payment via Stripe
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-400" />
            No hidden fees
          </span>
        </div>
      </div>
    </div>
  );
}
