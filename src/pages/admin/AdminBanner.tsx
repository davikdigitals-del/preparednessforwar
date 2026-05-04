import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone } from "lucide-react";

export default function AdminBanner() {
  const [bannerData, setBannerData] = useState({
    text: "",
    link: "",
    enabled: false,
  });

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
              value={bannerData.text}
              onChange={(e) => setBannerData({ ...bannerData, text: e.target.value })}
              placeholder="Enter announcement text..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="banner-link">Link URL (optional)</Label>
            <Input
              id="banner-link"
              value={bannerData.link}
              onChange={(e) => setBannerData({ ...bannerData, link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={bannerData.enabled}
                onChange={(e) =>
                  setBannerData({ ...bannerData, enabled: e.target.checked })
                }
              />
              <span className="text-sm">Enable banner</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save Banner</Button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Preview</h3>
        {bannerData.enabled && bannerData.text ? (
          <div className="bg-primary text-white p-3 rounded text-center">
            {bannerData.text}
          </div>
        ) : (
          <p className="text-blue-700 text-sm">
            Banner preview will appear here when enabled
          </p>
        )}
      </div>
    </div>
  );
}
