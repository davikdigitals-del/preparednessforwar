import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Mail, Globe, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DEFAULTS = {
  site_name: "Preparedness for War",
  site_description: "Your trusted source for preparedness information",
  contact_email: "",
  site_url: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_security: "tls",
  smtp_username: "",
  smtp_password: "",
  from_email: "",
  from_name: "Preparedness for War",
  twitter: "",
  facebook: "",
  youtube: "",
  instagram: "",
  linkedin: "",
};

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value");
      if (data && data.length > 0) {
        const loaded: Record<string, string> = {};
        data.forEach((row: any) => { loaded[row.key] = row.value; });
        setSettings(prev => ({ ...prev, ...loaded }));
      }
    } catch {
      // Table may not exist yet — use defaults
    } finally {
      setLoading(false);
    }
  };

  const set = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
      const { error } = await supabase
        .from("site_settings")
        .upsert(rows, { onConflict: "key" });
      if (error) throw error;
      toast({ title: "Settings saved", description: "Site settings updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    toast({ title: "Reset to defaults", description: "Settings reset — click Save to apply." });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
      <div className="space-y-6">

        {/* General */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>
          <div className="space-y-4">
            <div><Label>Site Name</Label><Input value={settings.site_name} onChange={e => set("site_name", e.target.value)} /></div>
            <div><Label>Site Description</Label><Textarea rows={3} value={settings.site_description} onChange={e => set("site_description", e.target.value)} /></div>
            <div><Label>Contact Email</Label><Input type="email" value={settings.contact_email} onChange={e => set("contact_email", e.target.value)} placeholder="contact@example.com" /></div>
            <div><Label>Site URL</Label><Input type="url" value={settings.site_url} onChange={e => set("site_url", e.target.value)} placeholder="https://example.com" /></div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Email Configuration</h2>
          </div>
          <div className="space-y-4">
            <div><Label>SMTP Host</Label><Input value={settings.smtp_host} onChange={e => set("smtp_host", e.target.value)} placeholder="smtp.gmail.com" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>SMTP Port</Label><Input type="number" value={settings.smtp_port} onChange={e => set("smtp_port", e.target.value)} placeholder="587" /></div>
              <div>
                <Label>Security</Label>
                <select value={settings.smtp_security} onChange={e => set("smtp_security", e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            <div><Label>SMTP Username</Label><Input type="email" value={settings.smtp_username} onChange={e => set("smtp_username", e.target.value)} placeholder="your-email@gmail.com" /></div>
            <div><Label>SMTP Password</Label><Input type="password" value={settings.smtp_password} onChange={e => set("smtp_password", e.target.value)} placeholder="••••••••" /></div>
            <div><Label>From Email</Label><Input type="email" value={settings.from_email} onChange={e => set("from_email", e.target.value)} placeholder="noreply@example.com" /></div>
            <div><Label>From Name</Label><Input value={settings.from_name} onChange={e => set("from_name", e.target.value)} placeholder="Preparedness for War" /></div>
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Social Media</h2>
          </div>
          <div className="space-y-4">
            <div><Label>Twitter / X</Label><Input value={settings.twitter} onChange={e => set("twitter", e.target.value)} placeholder="@username" /></div>
            <div><Label>Facebook</Label><Input value={settings.facebook} onChange={e => set("facebook", e.target.value)} placeholder="facebook.com/page" /></div>
            <div><Label>YouTube</Label><Input value={settings.youtube} onChange={e => set("youtube", e.target.value)} placeholder="youtube.com/channel" /></div>
            <div><Label>Instagram</Label><Input value={settings.instagram} onChange={e => set("instagram", e.target.value)} placeholder="@username" /></div>
            <div><Label>LinkedIn</Label><Input value={settings.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/company/name" /></div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
