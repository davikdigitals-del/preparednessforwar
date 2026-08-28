import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminBanner() {
  const { toast } = useToast();
  const { setBanner } = useData();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [form, setForm] = useState({
    text: "",
    link: "",
    enabled: false,
  });

  // Load banner directly using the authenticated client
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("banner_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading banner:", error);
      } else if (data) {
        setBannerId(data.id);
        setForm({
          text: data.text || "",
          link: (data as any).link || "",
          enabled: data.enabled ?? false,
        });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        text: form.text,
        enabled: form.enabled,
        priority: "high",
      };

      let error;

      if (bannerId) {
        ({ error } = await supabase
          .from("banner_settings")
          .update(payload)
          .eq("id", bannerId));
      } else {
        const { data, error: insertError } = await supabase
          .from("banner_settings")
          .insert(payload)
          .select()
          .single();
        error = insertError;
        if (data) setBannerId(data.id);
      }

      if (error) throw error;

      // Immediately update the DataContext so SiteHeader reflects change without refresh
      setBanner({
        id: bannerId || undefined,
        text: form.text,
        enabled: form.enabled,
        priority: "high",
      });

      toast({ title: "Banner saved", description: "Changes are now live on the site." });
    } catch (err: any) {
      console.error("Banner save error:", err);
      toast({
        title: "Error saving banner",
        description: err?.message || "Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    const { data } = await supabase
      .from("banner_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) {
      setBannerId(data.id);
      setForm({
        text: data.text || "",
        link: (data as any).link || "",
        enabled: data.enabled ?? false,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-gray-500">Loading banner settings...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Site Banner</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Megaphone className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Announcement Banner</h2>
          </div>
          {/* On/Off toggle */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${form.enabled ? "text-green-600" : "text-gray-400"}`}>
              {form.enabled ? "ON" : "OFF"}
            </span>
            <button
              type="button"
              onClick={() => setForm({ ...form, enabled: !form.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.enabled ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="banner-text">Banner Text</Label>
            <Textarea
              id="banner-text"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Enter announcement text that will scroll across the banner..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will scroll like a news ticker across the top of the site.
            </p>
          </div>

          <div>
            <Label htmlFor="banner-link">Link URL (optional)</Label>
            <Input
              id="banner-link"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Banner"}
            </Button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Preview</h3>
        {form.enabled && form.text ? (
          <div className="bg-[#1e3a5f] text-white overflow-hidden rounded">
            <div className="flex items-center h-8">
              <div className="flex-shrink-0 bg-red-600 px-3 h-full flex items-center text-xs font-bold uppercase tracking-wider">
                LIVE
              </div>
              <div className="flex-1 overflow-hidden">
                <div
                  className="whitespace-nowrap text-sm font-medium"
                  style={{
                    display: "inline-block",
                    animation: "marquee 20s linear infinite",
                    paddingLeft: "100%",
                  }}
                >
                  {form.text}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-blue-700 text-sm">
            {form.text ? "Toggle ON to preview the banner." : "Add text and toggle ON to preview."}
          </p>
        )}
      </div>
    </div>
  );
}
