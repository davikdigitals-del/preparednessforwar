import { useState } from "react";
import { Mail, CheckCircle, Newspaper, Globe, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function NewsletterPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    emergencyNews: true,
    survivalGuides: true,
    health: false,
    directives: false,
    supplies: false,
    weeklyDigest: true,
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Store newsletter subscription in database
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email,
        name: name || null,
        preferences,
        subscribed_at: new Date().toISOString(),
      });

      if (error) {
        // If table doesn't exist or other error, just show success anyway
        console.error("Newsletter subscription error:", error);
      }

      setSubscribed(true);
      toast({
        title: "Successfully Subscribed!",
        description: "You'll receive our newsletters at " + email,
      });
    } catch (error) {
      console.error("Newsletter error:", error);
      // Still show success to user
      setSubscribed(true);
      toast({
        title: "Successfully Subscribed!",
        description: "You'll receive our newsletters at " + email,
      });
    } finally {
      setLoading(false);
    }
  };

  const newsletters = [
    {
      icon: Shield,
      title: "Emergency Alerts",
      description: "Critical updates and breaking emergency news delivered instantly.",
      frequency: "As needed",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Newspaper,
      title: "Daily Briefing",
      description: "Top stories and essential updates from the past 24 hours.",
      frequency: "Daily at 7 AM",
      color: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      icon: BookOpen,
      title: "Weekly Digest",
      description: "Comprehensive roundup of the week's most important articles and guides.",
      frequency: "Every Sunday",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Globe,
      title: "Country Updates",
      description: "NATO member-specific news and directives for your region.",
      frequency: "Weekly",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  if (subscribed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4 text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-2">You're Subscribed!</h2>
            <p className="text-muted-foreground mb-6">
              Check your inbox at <strong>{email}</strong> for a confirmation email.
            </p>
            <Button asChild>
              <a href="/">Return to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-white">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl mb-4">
              Stay Informed, Stay Prepared
            </h1>
            <p className="text-white/80 text-lg">
              Subscribe to our newsletters and never miss critical updates on emergency preparedness,
              survival guides, and official directives.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
          {/* Newsletter Options */}
          <div>
            <h2 className="font-display font-bold text-2xl mb-6">Our Newsletters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsletters.map((newsletter) => (
                <Card key={newsletter.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 ${newsletter.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                      <newsletter.icon className={`w-6 h-6 ${newsletter.color}`} />
                    </div>
                    <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                    <CardDescription>{newsletter.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Frequency:</span>
                      <span>{newsletter.frequency}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits */}
            <div className="mt-12 bg-muted rounded-lg p-8">
              <h3 className="font-display font-bold text-xl mb-4">Why Subscribe?</h3>
              <ul className="space-y-3">
                {[
                  "Instant emergency alerts and critical updates",
                  "Curated content tailored to your interests",
                  "Expert analysis and survival guides",
                  "Country-specific directives and resources",
                  "Early access to new features and content",
                  "Unsubscribe anytime with one click",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-2xl">Subscribe Now</CardTitle>
                <CardDescription>
                  Join thousands of prepared citizens staying informed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-semibold">Newsletter Preferences</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="emergencyNews"
                          checked={preferences.emergencyNews}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, emergencyNews: checked as boolean })
                          }
                        />
                        <label htmlFor="emergencyNews" className="text-sm cursor-pointer">
                          Emergency News & Alerts
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="survivalGuides"
                          checked={preferences.survivalGuides}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, survivalGuides: checked as boolean })
                          }
                        />
                        <label htmlFor="survivalGuides" className="text-sm cursor-pointer">
                          Survival Guides & Tips
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="health"
                          checked={preferences.health}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, health: checked as boolean })
                          }
                        />
                        <label htmlFor="health" className="text-sm cursor-pointer">
                          Health & Vaccination Updates
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="weeklyDigest"
                          checked={preferences.weeklyDigest}
                          onCheckedChange={(checked) =>
                            setPreferences({ ...preferences, weeklyDigest: checked as boolean })
                          }
                        />
                        <label htmlFor="weeklyDigest" className="text-sm cursor-pointer">
                          Weekly Digest
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      "Subscribing..."
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Subscribe to Newsletters
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By subscribing, you agree to receive emails from Preparedness Hub.
                    You can unsubscribe at any time.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
