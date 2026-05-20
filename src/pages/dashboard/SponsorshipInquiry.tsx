import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Handshake, CheckCircle, Building2, Mail, Phone, Globe, MessageSquare, Info } from "lucide-react";

const sponsorshipTypes = [
  { value: "content_sponsorship",  label: "Content Sponsorship",    desc: "Sponsor specific articles or content series" },
  { value: "section_sponsorship",  label: "Section Sponsorship",    desc: "Sponsor an entire section of the website" },
  { value: "newsletter_sponsorship", label: "Newsletter Sponsorship", desc: "Featured in our weekly newsletter" },
  { value: "podcast_sponsorship",  label: "Podcast / Video",        desc: "Sponsor our podcast or video content" },
  { value: "event_sponsorship",    label: "Event Sponsorship",      desc: "Sponsor training events or webinars" },
  { value: "general",              label: "General Partnership",    desc: "Open to any partnership discussion" },
];

export default function SponsorshipInquiry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: user?.email || "",
    contact_phone: "",
    website_url: "",
    company_description: "",
    sponsorship_type: "",
    target_audience: "",
    message: "",
    preferred_start_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.contact_name || !form.contact_email || !form.sponsorship_type || !form.message) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("sponsorship_inquiries").insert({
        user_id: user?.id || null,
        company_name: form.company_name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone || null,
        website_url: form.website_url || null,
        company_description: form.company_description || null,
        sponsorship_type: form.sponsorship_type,
        target_audience: form.target_audience || null,
        message: form.message,
        preferred_start_date: form.preferred_start_date || null,
        status: "new",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-16 max-w-2xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-bold mb-4">Inquiry Received!</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Thank you for your interest in sponsoring Preparedness For War. Our team will review your inquiry and contact you at{" "}
          <strong>{form.contact_email}</strong> within <strong>2–3 business days</strong>.
        </p>
        <div className="bg-slate-50 border rounded-lg p-6 text-left space-y-3 mb-8">
          <h3 className="font-semibold">What happens next?</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              "Our team reviews your inquiry and sponsorship goals",
              `We contact you at ${form.contact_email} to discuss options`,
              "We create a tailored sponsorship package for your needs",
              "Once agreed, your sponsorship goes live on the platform",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={() => { setSubmitted(false); setForm({ ...form, message: "", company_name: "" }); }}>
          Submit Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2 flex items-center gap-3">
          <Handshake className="w-9 h-9 text-primary" />
          Sponsorship Inquiry
        </h1>
        <p className="text-muted-foreground text-lg">
          Partner with us to reach a highly engaged audience of preparedness-focused readers across the UK, EU & NATO countries.
        </p>
      </div>

      {/* Why sponsor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: "🎯", title: "Targeted Audience", desc: "Security-conscious readers in NATO member countries" },
          { icon: "📈", title: "Growing Platform", desc: "Thousands of active members and growing monthly" },
          { icon: "🤝", title: "Tailored Packages", desc: "Custom deals to fit your goals — no fixed price" },
        ].map((item) => (
          <div key={item.title} className="bg-slate-50 border rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3 mb-8">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          <strong>No payment required now.</strong> Submit this form and our team will contact you to discuss a tailored sponsorship package and pricing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-5 h-5" />Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <Input
                  placeholder="Your company name"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://yourcompany.com"
                    value={form.website_url}
                    onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Company Description</Label>
              <Textarea
                placeholder="Brief description of your company..."
                value={form.company_description}
                onChange={(e) => setForm({ ...form, company_description: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-5 h-5" />Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Your Name *</Label>
                <Input
                  placeholder="Full name"
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Phone Number (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="+44 7700 000000"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sponsorship Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Handshake className="w-5 h-5" />Sponsorship Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">Type of Sponsorship *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sponsorshipTypes.map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setForm({ ...form, sponsorship_type: type.value })}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      form.sponsorship_type === type.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Target Audience</Label>
                <Input
                  placeholder="e.g. UK preppers, NATO families..."
                  value={form.target_audience}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                />
              </div>
              <div>
                <Label>Preferred Start Date</Label>
                <Input
                  type="date"
                  value={form.preferred_start_date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm({ ...form, preferred_start_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Message to Our Team *</Label>
              <Textarea
                placeholder="Tell us about your sponsorship goals, what you're looking to achieve, and any specific requirements..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          {submitting ? "Submitting..." : "Submit Sponsorship Inquiry"}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          No payment required. Our team will contact you to discuss pricing and packages.
        </p>
      </form>
    </div>
  );
}
