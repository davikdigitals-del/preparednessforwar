import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import {
  Megaphone, CheckCircle, Clock, XCircle, Eye,
  MousePointer, CreditCard, ArrowRight, Info,
  LayoutDashboard, Newspaper, Monitor, Mail, ChevronLeft
} from "lucide-react";

interface AdPlacement {
  id: string;
  name: string;
  slug: string;
  description: string;
  dimensions: string;
  location: string;
  price_per_week: number;
  price_per_month: number;
  currency: string;
  allowed_formats: string;
}

interface AdPurchase {
  id: string;
  title: string;
  image_url: string;
  destination_url: string;
  placement_name: string;
  placement_location: string;
  duration_type: string;
  duration_value: number;
  start_date: string;
  end_date: string;
  amount: number;
  currency: string;
  payment_status: string;
  is_active: boolean;
  impression_count: number;
  click_count: number;
  created_at: string;
}

const locationIcons: Record<string, any> = {
  homepage: LayoutDashboard,
  article: Newspaper,
  dashboard: Monitor,
  newsletter: Mail,
};

export default function AdvertiseWithUs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [myAds, setMyAds] = useState<AdPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"browse" | "create" | "my-ads">("browse");
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | null>(null);

  const [form, setForm] = useState({
    title: "",
    image_url: "",
    destination_url: "",
    notes: "",
    duration_type: "week" as "week" | "month",
    duration_value: 1,
    start_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchData();
    if (searchParams.get("cancelled") === "true") {
      toast({ title: "Payment Cancelled", description: "No charge was made." });
    }
    if (searchParams.get("payment") === "success") {
      toast({ title: "Payment Successful!", description: "Your ad is now live on the website." });
      setStep("my-ads");
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [placementsRes, adsRes] = await Promise.all([
        supabase.from("ad_placements").select("*").eq("is_active", true).order("display_order"),
        user
          ? supabase.from("ad_purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);
      setPlacements(placementsRes.data || []);
      setMyAds((adsRes as any).data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const calcTotal = () => {
    if (!selectedPlacement) return 0;
    const price =
      form.duration_type === "week"
        ? selectedPlacement.price_per_week
        : selectedPlacement.price_per_month;
    return price * form.duration_value;
  };

  const calcEndDate = () => {
    if (!form.start_date) return "";
    const start = new Date(form.start_date);
    const days =
      form.duration_type === "week"
        ? form.duration_value * 7
        : form.duration_value * 30;
    start.setDate(start.getDate() + days);
    return start.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlacement) return;

    if (!form.title || !form.image_url || !form.destination_url) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const endDate = calcEndDate();
      const total = calcTotal();

      // Create ad purchase record first
      const { data: adPurchase, error: adError } = await supabase
        .from("ad_purchases")
        .insert({
          user_id: user.id,
          title: form.title,
          image_url: form.image_url,
          destination_url: form.destination_url,
          notes: form.notes || null,
          placement_id: selectedPlacement.id,
          placement_name: selectedPlacement.name,
          placement_location: selectedPlacement.location,
          duration_type: form.duration_type,
          duration_value: form.duration_value,
          start_date: form.start_date,
          end_date: endDate,
          amount: total,
          currency: selectedPlacement.currency,
          payment_status: "pending",
          is_active: false,
        })
        .select()
        .single();

      if (adError) throw adError;

      // Get auth session for edge function
      const { data: { session } } = await supabase.auth.getSession();

      // Call Stripe checkout edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ad-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            adPurchaseId: adPurchase.id,
            placementId: selectedPlacement.id,
            durationValue: form.duration_value,
            durationType: form.duration_type,
            title: form.title,
            imageUrl: form.image_url,
            destinationUrl: form.destination_url,
            startDate: form.start_date,
            endDate,
            amount: total,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment failed");

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const getStatusBadge = (ad: AdPurchase) => {
    if (ad.payment_status === "pending")
      return <Badge variant="outline" className="text-yellow-600 border-yellow-400"><Clock className="w-3 h-3 mr-1" />Awaiting Payment</Badge>;
    if (ad.payment_status === "paid" && ad.is_active)
      return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Live</Badge>;
    if (ad.payment_status === "paid" && !ad.is_active)
      return <Badge variant="secondary">Expired</Badge>;
    if (ad.payment_status === "failed")
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Payment Failed</Badge>;
    return <Badge variant="outline">{ad.payment_status}</Badge>;
  };

  if (loading) return (
    <div className="container py-12 text-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3">
          <Megaphone className="w-9 h-9 text-primary" />
          Advertise With Us
        </h1>
        <p className="text-muted-foreground text-lg">
          Reach thousands of preparedness-focused readers across the UK, EU & NATO countries.
          Pay and your ad goes live immediately.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b">
        {[
          { key: "browse", label: "Ad Placements" },
          { key: "create", label: "Place Ad", disabled: !selectedPlacement },
          { key: "my-ads", label: `My Ads (${myAds.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => !(tab as any).disabled && setStep(tab.key as any)}
            disabled={(tab as any).disabled}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              step === tab.key
                ? "border-primary text-primary"
                : (tab as any).disabled
                ? "border-transparent text-muted-foreground/40 cursor-not-allowed"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BROWSE PLACEMENTS ── */}
      {step === "browse" && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Choose a placement and duration below</li>
                <li>Upload your ad image and add your destination link</li>
                <li>Pay securely via Stripe</li>
                <li>Your ad goes live on the website immediately after payment</li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {placements.map((placement) => {
              const Icon = locationIcons[placement.location] || Monitor;
              const isSelected = selectedPlacement?.id === placement.id;
              return (
                <Card
                  key={placement.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? "border-2 border-primary ring-2 ring-primary/20"
                      : "border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedPlacement(placement)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">{placement.name}</CardTitle>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />}
                    </div>
                    <CardDescription>{placement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline">{placement.dimensions}</Badge>
                      <span className="text-muted-foreground text-xs">{placement.allowed_formats}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3 text-center border">
                        <p className="text-xl font-bold text-primary">£{placement.price_per_week}</p>
                        <p className="text-xs text-muted-foreground">per week</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-center border">
                        <p className="text-xl font-bold text-primary">£{placement.price_per_month}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedPlacement && (
            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep("create")} size="lg">
                Continue with {selectedPlacement.name}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── CREATE AD ── */}
      {step === "create" && selectedPlacement && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected placement */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">{selectedPlacement.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPlacement.dimensions} · {selectedPlacement.description}
                </p>
              </div>
              <Button variant="outline" size="sm" type="button" onClick={() => setStep("browse")}>
                <ChevronLeft className="w-4 h-4 mr-1" />Change
              </Button>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader><CardTitle className="text-base">Duration & Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration Type</Label>
                  <Select
                    value={form.duration_type}
                    onValueChange={(v: "week" | "month") => setForm({ ...form, duration_type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Weekly — £{selectedPlacement.price_per_week}/week</SelectItem>
                      <SelectItem value="month">Monthly — £{selectedPlacement.price_per_month}/month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>How many {form.duration_type === "week" ? "weeks" : "months"}?</Label>
                  <Select
                    value={String(form.duration_value)}
                    onValueChange={(v) => setForm({ ...form, duration_value: parseInt(v) })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 6, 8, 12].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {form.duration_type === "week" ? "week" : "month"}{n > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
                {calcEndDate() && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Ends:{" "}
                    <strong>
                      {new Date(calcEndDate()).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ad Content */}
          <Card>
            <CardHeader><CardTitle className="text-base">Ad Content</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ad Title (internal reference) *</Label>
                <Input
                  placeholder="e.g. Summer Campaign 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Destination URL *</Label>
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={form.destination_url}
                  onChange={(e) => setForm({ ...form, destination_url: e.target.value })}
                  required
                />
              </div>
              <div>
                <FileUpload
                  type="image"
                  currentUrl={form.image_url}
                  onUrlChange={(url) => setForm({ ...form, image_url: url })}
                  label={`Ad Image * — ${selectedPlacement.dimensions}, ${selectedPlacement.allowed_formats}`}
                />
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="Any additional notes..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{selectedPlacement.name}</span>
                <span>{form.duration_value} {form.duration_type}{form.duration_value > 1 ? "s" : ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>
                  £{form.duration_type === "week"
                    ? selectedPlacement.price_per_week
                    : selectedPlacement.price_per_month}/{form.duration_type}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">£{calcTotal().toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Paid securely via Stripe. Your ad goes live immediately after payment.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("browse")}>
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1" size="lg">
              <CreditCard className="w-4 h-4 mr-2" />
              {submitting ? "Redirecting to payment..." : `Pay £${calcTotal().toFixed(2)} & Go Live`}
            </Button>
          </div>
        </form>
      )}

      {/* ── MY ADS ── */}
      {step === "my-ads" && (
        <div className="space-y-4">
          {myAds.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Ads Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Place your first ad to reach our audience
                </p>
                <Button onClick={() => setStep("browse")}>Browse Placements</Button>
              </CardContent>
            </Card>
          ) : (
            myAds.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {ad.image_url && (
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-24 h-16 object-cover rounded flex-shrink-0 border"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold truncate">{ad.title}</h3>
                        {getStatusBadge(ad)}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{ad.placement_name}</span>
                        <span>·</span>
                        <span>{ad.duration_value} {ad.duration_type}{ad.duration_value > 1 ? "s" : ""}</span>
                        <span>·</span>
                        <span>£{ad.amount}</span>
                        {ad.start_date && (
                          <>
                            <span>·</span>
                            <span>
                              {new Date(ad.start_date).toLocaleDateString("en-GB")} →{" "}
                              {new Date(ad.end_date).toLocaleDateString("en-GB")}
                            </span>
                          </>
                        )}
                      </div>
                      {ad.payment_status === "paid" && ad.is_active && (
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="w-4 h-4" />{ad.impression_count} views
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MousePointer className="w-4 h-4" />{ad.click_count} clicks
                          </span>
                          {ad.impression_count > 0 && (
                            <span className="text-muted-foreground">
                              CTR: {((ad.click_count / ad.impression_count) * 100).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div className="flex justify-end pt-2">
            <Button onClick={() => setStep("browse")}>
              <Megaphone className="w-4 h-4 mr-2" />Place Another Ad
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
