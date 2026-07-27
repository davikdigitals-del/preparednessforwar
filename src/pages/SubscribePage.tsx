import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle, Loader2 } from 'lucide-react';

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const planIdFromUrl = searchParams.get('plan');
  const fromSignup = searchParams.get('from') === 'signup';

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Auto-select tab based on URL plan
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
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setProcessingId(plan.id);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const successUrl = fromSignup
        ? `${window.location.origin}/signup?payment=success`
        : `${window.location.origin}/dashboard?payment=success`;
      const cancelUrl = `${window.location.origin}/subscribe?plan=${plan.id}${fromSignup ? '&from=signup' : ''}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId: plan.id,
          userId: session?.user?.id || null,
          userEmail: session?.user?.email || null,
          successUrl,
          cancelUrl,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create checkout session');
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({ title: 'Payment Error', description: error.message, variant: 'destructive' });
      setProcessingId(null);
    }
  };

  const monthlyPlans = plans.filter(p => p.interval === 'month');
  const yearlyPlans = plans.filter(p => p.interval === 'year');
  const displayPlans = billingInterval === 'month' ? monthlyPlans : yearlyPlans;
  const hasYearly = yearlyPlans.length > 0;

  // Calculate yearly saving vs monthly equivalent
  const getYearlySaving = (yearlyPlan: SubscriptionPlan) => {
    const monthly = monthlyPlans[0];
    if (!monthly) return null;
    const annualMonthly = monthly.price * 12;
    const saved = annualMonthly - yearlyPlan.price;
    if (saved <= 0) return null;
    return Math.round((saved / annualMonthly) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-16 px-4">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          {fromSignup ? 'Choose Your Plan' : 'Upgrade to Premium'}
        </h1>
        <p className="text-gray-500 text-lg">Simple, flexible pricing, no excuses.</p>
      </div>

      {/* Monthly / Yearly pill tabs */}
      {hasYearly && (
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center border border-gray-200 rounded-full p-1 bg-gray-50 gap-1">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingInterval === 'month'
                  ? 'bg-gray-900 text-white shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingInterval === 'year'
                  ? 'bg-gray-900 text-white shadow'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      )}

      {/* Plans */}
      {displayPlans.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>No {billingInterval === 'month' ? 'monthly' : 'yearly'} plans available.</p>
          {billingInterval === 'year' && (
            <button onClick={() => setBillingInterval('month')} className="mt-2 text-primary underline text-sm">
              View monthly plans
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 max-w-5xl mx-auto ${
          displayPlans.length === 1 ? 'grid-cols-1 max-w-sm' :
          displayPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {displayPlans.map((plan, idx) => {
            const isPopular = idx === Math.floor(displayPlans.length / 2);
            const isProcessing = processingId === plan.id;
            const savingPct = billingInterval === 'year' ? getYearlySaving(plan) : null;

            return (
              <div key={plan.id} className={`relative rounded-2xl border-2 p-8 flex flex-col gap-6 transition-all hover:shadow-lg ${
                isPopular
                  ? 'border-yellow-400 bg-yellow-50 shadow-md'
                  : 'border-gray-200 bg-white'
              }`}>

                {/* Most popular badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Plan info */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-gray-900">
                      £{plan.price}
                    </span>
                    <span className="text-gray-400 text-base mb-2">
                      /{plan.interval === 'year' ? 'yr' : 'mo'}
                    </span>
                  </div>
                  {plan.interval === 'year' && (
                    <p className="text-sm text-gray-400 mt-1">
                      £{(plan.price / 12).toFixed(2)}/month billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1">
                  {(plan.features || []).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full py-6 text-base font-bold rounded-xl ${
                    isPopular
                      ? 'bg-gray-900 hover:bg-gray-800 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
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
              </div>
            );
          })}
        </div>
      )}

      {/* Trust line */}
      <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-400 flex-wrap">
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Secure payment via Stripe</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Cancel anytime</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No hidden fees</span>
      </div>
    </div>
  );
}
