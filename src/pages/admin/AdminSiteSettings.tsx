import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Mail, Globe, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AdminSiteSettings() {
  const [saving, setSaving] = useState(false);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState("");
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['recaptcha_enabled', 'recaptcha_site_key', 'recaptcha_secret_key']);

      if (data) {
        const enabledSetting = data.find(s => s.key === 'recaptcha_enabled');
        const siteKeySetting = data.find(s => s.key === 'recaptcha_site_key');
        const secretKeySetting = data.find(s => s.key === 'recaptcha_secret_key');

        setRecaptchaEnabled(enabledSetting?.value === 'true');
        setRecaptchaSiteKey(siteKeySetting?.value || '');
        setRecaptchaSecretKey(secretKeySetting?.value || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save reCAPTCHA settings
      const settings = [
        { key: 'recaptcha_enabled', value: recaptchaEnabled.toString() },
        { key: 'recaptcha_site_key', value: recaptchaSiteKey },
        { key: 'recaptcha_secret_key', value: recaptchaSecretKey },
      ];

      for (const setting of settings) {
        await supabase
          .from('site_settings')
          .upsert(setting, { onConflict: 'key' });
      }

      toast({
        title: "Settings saved",
        description: "Your site settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Site Settings</h1>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">General Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="site-name">Site Name</Label>
              <Input id="site-name" defaultValue="Preparedness for War" />
            </div>

            <div>
              <Label htmlFor="site-description">Site Description</Label>
              <Textarea
                id="site-description"
                rows={3}
                defaultValue="Your trusted source for preparedness information"
              />
            </div>

            <div>
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input id="contact-email" type="email" placeholder="contact@example.com" />
            </div>

            <div>
              <Label htmlFor="site-url">Site URL</Label>
              <Input id="site-url" type="url" placeholder="https://example.com" />
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Email Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" type="number" placeholder="587" />
              </div>
              <div>
                <Label htmlFor="smtp-secure">Security</Label>
                <select id="smtp-secure" className="w-full h-10 px-3 rounded-md border border-input bg-background">
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input id="smtp-username" type="email" placeholder="your-email@gmail.com" />
            </div>

            <div>
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input id="smtp-password" type="password" placeholder="••••••••" />
            </div>

            <div>
              <Label htmlFor="from-email">From Email</Label>
              <Input id="from-email" type="email" placeholder="noreply@example.com" />
            </div>

            <div>
              <Label htmlFor="from-name">From Name</Label>
              <Input id="from-name" placeholder="Preparedness for War" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Social Media</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="twitter">Twitter/X</Label>
              <Input id="twitter" placeholder="@username" />
            </div>

            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input id="facebook" placeholder="facebook.com/page" />
            </div>

            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input id="youtube" placeholder="youtube.com/channel" />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" placeholder="@username" />
            </div>

            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" placeholder="linkedin.com/company/name" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Security Settings</h2>
          </div>

          <div className="space-y-4">
            {/* reCAPTCHA Settings */}
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label>Enable Google reCAPTCHA</Label>
                  <p className="text-xs text-gray-500">Protect forms from spam and bots</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4"
                  checked={recaptchaEnabled}
                  onChange={(e) => setRecaptchaEnabled(e.target.checked)}
                />
              </div>

              {recaptchaEnabled && (
                <div className="space-y-3 mt-3 pl-4 border-l-2 border-primary">
                  <div>
                    <Label htmlFor="recaptcha-site-key">reCAPTCHA Site Key</Label>
                    <Input 
                      id="recaptcha-site-key"
                      value={recaptchaSiteKey}
                      onChange={(e) => setRecaptchaSiteKey(e.target.value)}
                      placeholder="6Lc..." 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your reCAPTCHA v2 site key (public key)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="recaptcha-secret-key">reCAPTCHA Secret Key</Label>
                    <Input 
                      id="recaptcha-secret-key"
                      type="password"
                      value={recaptchaSecretKey}
                      onChange={(e) => setRecaptchaSecretKey(e.target.value)}
                      placeholder="6Lc..." 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your reCAPTCHA v2 secret key (keep secure!)
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h4 className="font-semibold text-sm mb-2">Setup Instructions:</h4>
                    <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Go to <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google reCAPTCHA Admin</a></li>
                      <li>Register a new site with reCAPTCHA v2 "I'm not a robot" Checkbox</li>
                      <li>Add your domain to the list of authorized domains</li>
                      <li>Copy the Site Key and Secret Key above</li>
                      <li>Save settings and reCAPTCHA will be enabled on login and registration forms</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Two-Factor Authentication</Label>
                <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>

            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input id="session-timeout" type="number" defaultValue="60" />
            </div>

            <div>
              <Label htmlFor="max-login-attempts">Max Login Attempts</Label>
              <Input id="max-login-attempts" type="number" defaultValue="5" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save All Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
