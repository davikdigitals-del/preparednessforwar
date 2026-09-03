import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSubscribeProps {
  variant?: "default" | "compact" | "inline";
  title?: string;
  description?: string;
}

export function NewsletterSubscribe({ 
  variant = "default",
  title = "Stay Informed with Our Newsletter",
  description = "Get the latest emergency preparedness updates, survival guides, and critical alerts delivered to your inbox."
}: NewsletterSubscribeProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ 
        title: "Invalid Email", 
        description: "Please enter a valid email address.", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      // Try to use edge function first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/newsletter-subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
          },
          body: JSON.stringify({ 
            email, 
            name: null, 
            preferences: {
              emergencyNews: true,
              survivalGuides: true,
              weeklyDigest: true,
            }
          }),
        });

        if (!res.ok) throw new Error('Edge function failed');
      } catch (edgeFunctionError) {
        console.log('Edge function unavailable, using direct DB insert');
      }

      // Fallback: save directly to DB
      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert({
          email,
          name: null,
          preferences: {
            emergencyNews: true,
            survivalGuides: true,
            weeklyDigest: true,
          },
          subscribed_at: new Date().toISOString(),
          is_active: true,
        }, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });

      if (error) {
        // Check if it's a duplicate email error
        if (error.message?.includes('duplicate') || error.code === '23505') {
          toast({ 
            title: "Already Subscribed", 
            description: "You're already on our mailing list!" 
          });
          setSubscribed(true);
          return;
        }
        throw error;
      }

      setSubscribed(true);
      toast({ 
        title: "Successfully Subscribed!", 
        description: "Check your inbox for a confirmation email."
      });
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({ 
        title: "Subscription Failed", 
        description: error.message || "Please try again later.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Compact variant (for sidebars)
  if (variant === "compact") {
    if (subscribed) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-green-800">You're subscribed!</p>
        </div>
      );
    }

    return (
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm">{title}</h3>
        </div>
        <form onSubmit={handleSubscribe} className="space-y-2">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="text-sm"
          />
          <Button type="submit" size="sm" className="w-full" disabled={loading}>
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    );
  }

  // Inline variant (for within article content)
  if (variant === "inline") {
    if (subscribed) {
      return (
        <div className="my-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Successfully Subscribed!</p>
              <p className="text-sm text-green-700">Check your inbox for confirmation.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="my-6 bg-primary/5 border-l-4 border-primary p-6 rounded">
        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{description}</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Default variant (full card)
  if (subscribed) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-bold text-xl mb-2">You're Subscribed!</h3>
        <p className="text-muted-foreground">
          Check your inbox at <strong>{email}</strong> for a confirmation email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-xl mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="sm:w-auto">
              {loading ? (
                "Subscribing..."
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Join thousands staying prepared. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
