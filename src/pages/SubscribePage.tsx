import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { StripeCheckout } from '@/components/StripeCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Crown, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

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

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchPlans();

    // Set up real-time subscription for plans
    const channel = supabase
      .channel('subscription_plans_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscription_plans'
        },
        () => {
          fetchPlans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Only auto-trigger after user is confirmed loaded and plans are ready
    if (planIdFromUrl && plans.length > 0 && user && !loading) {
      const plan = plans.find(p => p.id === planIdFromUrl);
      if (plan) {
        // Small delay to ensure session is fully initialized
        const timer = setTimeout(() => handleSelectPlan(plan), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [planIdFromUrl, plans, user, loading]);

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
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login?redirect=/subscribe?plan=' + plan.id);
      return;
    }

    setProcessingPayment(true);
    setSelectedPlan(plan);

    try {
      // Use getUser() which waits for session to be fully initialized
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        toast({
          title: 'Please log in',
          description: 'You need to be logged in to subscribe.',
          variant: 'destructive',
        });
        navigate('/login?redirect=/subscribe?plan=' + plan.id);
        return;
      }

      // Now get the session token — guaranteed to be ready after getUser()
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (!accessToken) {
        console.warn('No access token but user exists — proceeding anyway');
      }

      // Call edge function — pass user info in body since token auth is unreliable
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
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
            userId: currentUser.id,
            userEmail: currentUser.email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
      setSelectedPlan(null);
      setProcessingPayment(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Your subscription is now active',
    });
    navigate('/dashboard');
  };

  const handleCancel = () => {
    setSelectedPlan(null);
    setClientSecret('');
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-4">Loading plans...</p>
      </div>
    );
  }

  if (selectedPlan && clientSecret) {
    return (
      <div className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={handleCancel}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Button>
        <StripeCheckout
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={selectedPlan.price}
          currency={selectedPlan.currency}
          clientSecret={clientSecret}
          onSuccess={handlePaymentSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-primary" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">
          Upgrade to Premium
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get unlimited access to exclusive content, videos, and resources
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isPopular = plan.slug === 'premium-monthly';
          
          return (
            <Card
              key={plan.id}
              className={`relative ${
                isPopular
                  ? 'border-2 border-primary shadow-lg scale-105'
                  : 'border-2 border-border'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-center">
                  <div className="text-2xl font-bold mb-2">{plan.name}</div>
                  <div className="text-4xl font-bold text-primary">
                    {plan.currency === 'GBP' ? '£' : plan.currency === 'USD' ? '$' : '€'}
                    {plan.price}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    per {plan.interval}
                  </p>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={processingPayment}
                  variant={isPopular ? 'default' : 'outline'}
                >
                  {processingPayment && selectedPlan?.id === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>Secure payment powered by Stripe</p>
        <p className="mt-2">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  );
}
