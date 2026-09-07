import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Wrench, Eye, Bug } from "lucide-react";
import MaintenancePage from "@/pages/MaintenancePage";
import { MaintenanceDebug } from "@/components/MaintenanceDebug";

export default function AdminMaintenance() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();

  const [config, setConfig] = useState({
    enabled: false,
    message: "Site is under maintenance. We will be back soon.",
    estimated_back: "",
  });

  useEffect(() => {
    fetchMaintenanceConfig();
  }, []);

  const fetchMaintenanceConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("maintenance_mode")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setConfig({
          enabled: data.enabled || false,
          message: data.message || "Site is under maintenance. We will be back soon.",
          estimated_back: data.estimated_back || "",
        });
      } else {
        // No data found, use defaults
        setConfig({
          enabled: false,
          message: "Site is under maintenance. We will be back soon.",
          estimated_back: "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching maintenance config:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch maintenance configuration",
        variant: "destructive",
      });
      // Set default values on error
      setConfig({
        enabled: false,
        message: "Site is under maintenance. We will be back soon.",
        estimated_back: "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // First check if there are any rows in the maintenance_mode table
      const { data: existingData, error: fetchError } = await supabase
        .from("maintenance_mode")
        .select("id")
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw fetchError;
      }

      let updateResult;

      if (existingData?.id) {
        // Update existing row
        updateResult = await supabase
          .from("maintenance_mode")
          .update({
            enabled: config.enabled,
            message: config.message,
            estimated_back: config.estimated_back || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingData.id);
      } else {
        // Insert new row if none exists
        updateResult = await supabase
          .from("maintenance_mode")
          .insert({
            enabled: config.enabled,
            message: config.message,
            estimated_back: config.estimated_back || null,
          });
      }

      if (updateResult.error) throw updateResult.error;

      toast({
        title: "Success",
        description: config.enabled
          ? "✅ Maintenance mode enabled - Site is now offline for visitors"
          : "✅ Maintenance mode disabled - Site is back online",
      });

      fetchMaintenanceConfig();
    } catch (error: any) {
      console.error("Error saving maintenance config:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save maintenance configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <Button onClick={() => setShowPreview(false)} variant="outline">
            Close Preview
          </Button>
        </div>
        <MaintenancePage message={config.message} estimatedBack={config.estimated_back} />
      </div>
    );
  }

  if (showDebug) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Maintenance Mode Debug</h1>
            <p className="text-muted-foreground">
              Diagnose maintenance mode issues
            </p>
          </div>
          <Button onClick={() => setShowDebug(false)} variant="outline">
            Back to Settings
          </Button>
        </div>
        <MaintenanceDebug />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Mode</h1>
        <p className="text-muted-foreground">
          Put your site in maintenance mode to perform updates or fixes
        </p>
      </div>

      {config.enabled && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Maintenance Mode is Active</p>
                <p className="text-sm text-red-700 mt-1">
                  Your site is currently offline for all visitors. Only admins can access the admin panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Maintenance Settings
          </CardTitle>
          <CardDescription>
            Configure how your maintenance page looks and when to enable it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex-1">
              <Label htmlFor="enabled" className="text-base font-semibold">
                Enable Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Turn this on to show maintenance page to all visitors
              </p>
            </div>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig({ ...config, enabled: checked })
              }
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Maintenance Message</Label>
            <Textarea
              id="message"
              value={config.message}
              onChange={(e) => setConfig({ ...config, message: e.target.value })}
              placeholder="Enter the message visitors will see"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message will be displayed prominently on the maintenance page
            </p>
          </div>

          {/* Estimated Back Time */}
          <div className="space-y-2">
            <Label htmlFor="estimated_back">Estimated Time Back (Optional)</Label>
            <Input
              id="estimated_back"
              value={config.estimated_back}
              onChange={(e) =>
                setConfig({ ...config, estimated_back: e.target.value })
              }
              placeholder="e.g., 2 hours, Tomorrow 10 AM, March 15th"
            />
            <p className="text-xs text-muted-foreground">
              Let visitors know when you expect to be back online
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
              variant={config.enabled ? "destructive" : "default"}
            >
              {saving
                ? "Saving..."
                : config.enabled
                  ? "Save & Keep Site Offline"
                  : "Save Settings"}
            </Button>
            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button
              onClick={() => setShowDebug(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Debug
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">1.</span>
            <p>
              <span className="font-semibold">Customize the message</span> - Write a clear message
              explaining why the site is down
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">2.</span>
            <p>
              <span className="font-semibold">Set estimated time</span> (optional) - Let users know
              when to check back
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">3.</span>
            <p>
              <span className="font-semibold">Preview the page</span> - Make sure it looks good
              before enabling
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">4.</span>
            <p>
              <span className="font-semibold">Enable maintenance mode</span> - Site goes offline for
              visitors
            </p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-600">5.</span>
            <p>
              <span className="font-semibold">Disable when done</span> - Turn it off to bring site
              back online
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
