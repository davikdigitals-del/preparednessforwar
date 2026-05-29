import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminBanner() {
  const { banner, updateBanner } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    text: "",
    link: "",
    enabled: false,
  });

  // Sync form with loaded banner data
  useEffect(() => {
    setForm({
      text: banner.text || "",
      link: (banner as any).link || "",
      enabled: banner.enabled ?? false,
    });
  }, [banner]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBanner({
        text: form.text,
        enabled: form.enabled,
        priority: banner.priority || "high",
      });
      toast({ title: "Banner saved", description: "Changes are now live on the site." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save banner.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      text: banner.text || "",
      link: (banner as any).link || "",
      enabled: banner.enabled ?? false,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Site Banner</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Announcement Banner</h2>
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

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Enable banner</span>
            </label>
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
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wider">
                LIVE
              </div>
              <div className="flex-1 overflow-hidden py-2 px-3">
                <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite]">
                  {form.text}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-blue-700 text-sm">
            Enable the banner and add text to see a preview.
          </p>
        )}
      </div>
    </div>
  );
}
